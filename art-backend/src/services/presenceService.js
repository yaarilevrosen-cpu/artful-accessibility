// One PresencePoller per painting that has a camera assigned, each polling
// that camera's own /status endpoint on the Jetson inference server and
// driving the same arrival/departure logic the ESP32 distance sensor drives
// over MQTT ('sensor' topic, status 'in'/'left'). Only runs when
// PRESENCE_SOURCE=camera (see index.js) — with PRESENCE_SOURCE unset/'sensor'
// this module is never instantiated, so the existing sensor-driven flow is
// completely unaffected.
//
// PresenceManager owns the fleet: it rescans the paintings collection on a
// timer and starts/stops pollers as paintings gain/lose a camera_device, so
// adding a painting (or flipping camera_device) is picked up without a
// restart. One painting's poller crashing, or its camera being unreachable,
// never touches any other painting's poller.
const axios = require('axios');
const winston = require('winston');
const Painting = require('../models/PaintingSystem');
const { broadcastWS } = require('./websocketService');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [new winston.transports.Console()],
});

const HOST_IP = process.env.HOST_IP || 'jetson-host';
const INFERENCE_BASE_URL = process.env.PRESENCE_INFERENCE_BASE_URL || `http://${HOST_IP}:5001`;
// Full override for every poller's status URL, ignoring camera_device —
// lets this be pointed at a single test double without touching HOST_IP
// or per-painting camera_device values. Same env var as before multi-camera.
const STATUS_URL_OVERRIDE = process.env.PRESENCE_STATUS_URL || null;

const POLL_MS = 500;
const ARRIVE_STREAK = parseInt(process.env.PRESENCE_ARRIVE_STREAK || '3', 10);
const LEAVE_STREAK = parseInt(process.env.PRESENCE_LEAVE_STREAK || '15', 10);
const COOLDOWN_MS = parseInt(process.env.PRESENCE_COOLDOWN_MS || '5000', 10);
const STARTUP_MS = parseInt(process.env.PRESENCE_STARTUP_MS || '6000', 10);
// אחרי כמה קריאות כושלות ברציפות מחזירים את הציור למצב בטוח (למעלה)
const FAIL_LIMIT = parseInt(process.env.PRESENCE_FAIL_LIMIT || '10', 10);
// How often the manager re-reads the paintings collection to notice
// paintings that gained/lost a camera_device or were added/removed.
const RESCAN_MS = parseInt(process.env.PRESENCE_RESCAN_MS || '5000', 10);

class PresencePoller {
    constructor(mqttService, sys_id, statusUrl) {
        this.mqttService = mqttService;
        this.sys_id = sys_id;
        this.statusUrl = statusUrl;
        this.presentStreak = 0;
        this.absentStreak = 0;
        this.isPresent = false;
        this.lastCommand = null; // 0 (up) | 1 (down) | null
        this.lastCommandAt = 0;
        this.timer = null;
        this.systemOn = null;   // null = לא ידוע עדיין
        this.readyAt = 0;       // זמן סיום החימום
        this.failStreak = 0;
        this.failsafeDone = false;
    }

    async failsafeRaise(reason) {
        if (this.failsafeDone) return;
        this.failsafeDone = true;
        logger.error(`presencePoller[${this.sys_id}]: FAILSAFE — ${reason}; raising painting to default height`);
        this.presentStreak = 0;
        this.absentStreak = 0;
        this.isPresent = false;
        this.lastCommand = 0;
        this.lastCommandAt = Date.now();
        try {
            await this.mqttService.sendHeightCommand(this.sys_id, 0);
            await Painting.updateOne({ sys_id: this.sys_id },
                { $set: { sensor: false, wheelchair: 0, height_adjust: false } });
            await broadcastWS({
                sys_id: this.sys_id, sensor: false, wheelchair: 0, height_adjust: false,
            });
        } catch (err) {
            logger.error(`presencePoller[${this.sys_id}]: failsafe failed: ${err.message}`);
        }
    }

    async shutdownReset() {
        logger.info(`presencePoller[${this.sys_id}]: system OFF — resetting painting state`);
        this.presentStreak = 0;
        this.absentStreak = 0;
        this.lastCommand = null;
        this.lastCommandAt = 0;
        const wasPresent = this.isPresent;
        this.isPresent = false;
        try {
            if (wasPresent) {
                await this.mqttService.handleVisitorLeft(this.sys_id, 'camera');
            }
            await Painting.updateOne({ sys_id: this.sys_id },
                { $set: { sensor: false, wheelchair: 0, height_adjust: false } });
            await broadcastWS({
                sys_id: this.sys_id, status: 'Inactive',
                sensor: false, wheelchair: 0, height_adjust: false,
            });
        } catch (err) {
            logger.error(`presencePoller[${this.sys_id}]: shutdown reset failed: ${err.message}`);
        }
    }

    start() {
        if (this.timer) return; // already running
        this.timer = setInterval(() => {
            this.poll().catch((err) => logger.error(`presencePoller[${this.sys_id}] poll crashed: ${err.message}`));
        }, POLL_MS);
        logger.info(`presencePoller[${this.sys_id}] started -> ${this.statusUrl} `
            + `(arrive>=${ARRIVE_STREAK}, leave>=${LEAVE_STREAK}, cooldown=${COOLDOWN_MS}ms)`);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    async poll() {
        // מצב הציור קובע אם בכלל דוגמים
        let painting;
        try {
            painting = await Painting.findOne({ sys_id: this.sys_id });
        } catch (err) {
            logger.warn(`presencePoller[${this.sys_id}]: DB read failed (${err.message})`);
            return;
        }
        const on = painting && painting.status === 'Active';
        if (this.systemOn === null) this.systemOn = on;

        if (!on) {
            if (this.systemOn) { this.systemOn = false; await this.shutdownReset(); }
            return;
        }
        if (!this.systemOn) {
            this.systemOn = true;
            this.readyAt = Date.now() + STARTUP_MS;
            logger.info(`presencePoller[${this.sys_id}]: system ON — warming up ${STARTUP_MS}ms`);
        }
        if (Date.now() < this.readyAt) return;

        let status;
        try {
            const res = await axios.get(this.statusUrl, { timeout: 2000 });
            status = res.data;
        } catch (err) {
            // Inference server unreachable: log and bail without touching the
            // streak counters, so a transient network blip can't erode
            // presentStreak/absentStreak and fire a spurious departure.
            logger.warn(`presencePoller[${this.sys_id}]: inference server unreachable at ${this.statusUrl} (${err.message})`);
            this.failStreak += 1;
            if (this.failStreak >= FAIL_LIMIT) {
                await this.failsafeRaise(`inference server unreachable x${this.failStreak}`);
            }
            return;
        }

        // מצלמה מדווחת על עצמה כתקולה — נספר גם את זה (כולל "unknown camera",
        // שקורה כשה-camera_device לא תואם אף worker על שרת ה-inference)
        if (status.camera_ok === false) {
            this.failStreak += 1;
            if (this.failStreak >= FAIL_LIMIT) {
                await this.failsafeRaise(`camera reported not ok x${this.failStreak}${status.error ? ` (${status.error})` : ''}`);
            }
            return;
        }
        if (this.failStreak > 0) {
            logger.info(`presencePoller[${this.sys_id}]: inference server back, resuming`);
        }
        this.failStreak = 0;
        this.failsafeDone = false;

        if (status.present) {
            this.presentStreak += 1;
            this.absentStreak = 0;
        } else {
            this.absentStreak += 1;
            this.presentStreak = 0;
        }

        if (!this.isPresent && this.presentStreak >= ARRIVE_STREAK) {
            this.isPresent = true;
            // handleVisitorArrived does its own wheelchair detection and may
            // publish a height command asynchronously. Start the cooldown
            // clock now (rather than at 0) so the very next poll can't fire
            // applyWheelchairState immediately and double up on it; leave
            // lastCommand unset since we don't yet know what it published.
            // Record what handleVisitorArrived is about to publish, so the
            // next poll's cooldown check doesn't re-send the same command.
            this.lastCommand = status.detected ? 1 : 0;
            this.lastCommandAt = Date.now();
            try {
                // Pass this poll's already-fetched reading through so
                // handleVisitorArrived doesn't need to trigger its own
                // detection (it no longer starts ML-Stream's camera loop
                // for the camera source — see mqttService.js).
                await this.mqttService.handleVisitorArrived(this.sys_id, 'camera', !!status.detected);
            } catch (err) {
                logger.error(`presencePoller[${this.sys_id}]: handleVisitorArrived failed: ${err.message}`);
            }
            return;
        }

        if (this.isPresent && this.absentStreak >= LEAVE_STREAK) {
            this.isPresent = false;
            try {
                await this.mqttService.handleVisitorLeft(this.sys_id, 'camera');
            } catch (err) {
                logger.error(`presencePoller[${this.sys_id}]: handleVisitorLeft failed: ${err.message}`);
            }
            return;
        }

        if (this.isPresent) {
            // Keep re-evaluating wheelchair status while the visit continues,
            // so someone who sits down mid-session still gets detected.
            await this.maybeUpdateWheelchair(status);
        }
    }

    async maybeUpdateWheelchair(status) {
        const command = status.detected ? 1 : 0;
        const now = Date.now();
        if (command === this.lastCommand) return; // never send the same command twice in a row
        if (now - this.lastCommandAt < COOLDOWN_MS) return; // rate limit

        // Record before awaiting: if applyWheelchairState throws after its MQTT
        // publish (e.g. a later DB save or broadcast fails), the dedup/cooldown
        // state must still stick, or a partial failure turns into a retry storm.
        this.lastCommand = command;
        this.lastCommandAt = now;
        try {
            await this.mqttService.applyWheelchairState(this.sys_id, !!status.detected);
        } catch (err) {
            logger.error(`presencePoller[${this.sys_id}]: applyWheelchairState failed: ${err.message}`);
        }
    }
}

class PresenceManager {
    constructor(mqttService) {
        this.mqttService = mqttService;
        this.pollers = new Map(); // sys_id -> PresencePoller
        this.rescanTimer = null;
    }

    // For the offline-alerting UI (see HealthController): one entry per
    // painting currently being polled (i.e. Active with a camera assigned),
    // reporting whether its camera is currently reporting or has tripped
    // the failsafe threshold. Not present in this list at all means "no
    // camera assigned" / "not being polled", which the UI treats as N/A
    // rather than offline.
    getStatusSummary() {
        return Array.from(this.pollers.values()).map((poller) => ({
            sys_id: poller.sys_id,
            camera_ok: poller.failStreak < FAIL_LIMIT,
            fail_streak: poller.failStreak,
        }));
    }

    _statusUrlFor(painting) {
        if (STATUS_URL_OVERRIDE) return STATUS_URL_OVERRIDE;
        return `${INFERENCE_BASE_URL}/status?device=${encodeURIComponent(painting.camera_device)}`;
    }

    async rescan() {
        let paintings;
        try {
            // A painting only gets a poller once it has a camera assigned.
            // Active/Inactive is handled inside the poller itself (it already
            // warms up / resets cleanly on toggle) — the manager only cares
            // whether polling this painting's camera makes sense at all.
            // $nin, not two $ne keys on one object literal — the latter
            // silently collapses to one key in JS ({a:1,a:2} keeps only the
            // last), which let camera_device: null slip through and start a
            // poller pointed at "?device=null".
            paintings = await Painting.find({ camera_device: { $exists: true, $nin: [null, ''] } });
        } catch (err) {
            logger.warn(`presenceManager: DB read failed during rescan (${err.message})`);
            return;
        }

        const seen = new Set();
        for (const painting of paintings) {
            seen.add(painting.sys_id);
            const existing = this.pollers.get(painting.sys_id);
            const statusUrl = this._statusUrlFor(painting);
            if (!existing) {
                const poller = new PresencePoller(this.mqttService, painting.sys_id, statusUrl);
                this.pollers.set(painting.sys_id, poller);
                poller.start();
                logger.info(`presenceManager: new poller for sys_id ${painting.sys_id} `
                    + `(camera_device=${painting.camera_device})`);
            } else if (existing.statusUrl !== statusUrl) {
                // camera_device was changed on an already-polled painting —
                // point the existing poller at its new camera without
                // dropping its debounce/cooldown state.
                logger.info(`presenceManager: sys_id ${painting.sys_id} camera_device changed, `
                    + `repointing poller (${existing.statusUrl} -> ${statusUrl})`);
                existing.statusUrl = statusUrl;
            }
        }

        for (const [sys_id, poller] of this.pollers) {
            if (!seen.has(sys_id)) {
                logger.info(`presenceManager: painting ${sys_id} no longer has a camera assigned — stopping its poller`);
                try {
                    if (poller.isPresent) await poller.shutdownReset();
                } catch (err) {
                    logger.error(`presenceManager: shutdownReset failed for ${sys_id}: ${err.message}`);
                }
                poller.stop();
                this.pollers.delete(sys_id);
            }
        }
    }

    start() {
        if (this.rescanTimer) return; // already running
        this.rescan().catch((err) => logger.error(`presenceManager: initial rescan failed: ${err.message}`));
        this.rescanTimer = setInterval(() => {
            this.rescan().catch((err) => logger.error(`presenceManager: rescan crashed: ${err.message}`));
        }, RESCAN_MS);
        logger.info(`presenceManager started (rescan every ${RESCAN_MS}ms)`);
    }

    stop() {
        if (this.rescanTimer) {
            clearInterval(this.rescanTimer);
            this.rescanTimer = null;
        }
        for (const poller of this.pollers.values()) poller.stop();
        this.pollers.clear();
    }
}

module.exports = { PresenceManager, PresencePoller };
