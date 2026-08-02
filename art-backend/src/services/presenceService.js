// Polls the Jetson inference server's /status endpoint and drives the same
// arrival/departure logic the ESP32 distance sensor drives over MQTT
// ('sensor' topic, status 'in'/'left'). Only runs when PRESENCE_SOURCE=camera
// (see index.js) — with PRESENCE_SOURCE unset/'sensor' this module is never
// instantiated, so the existing sensor-driven flow is completely unaffected.
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

const HOST_IP = process.env.HOST_IP || '192.168.68.135';
// Override lets this be pointed at a test double without touching HOST_IP
// (which other services also rely on).
const STATUS_URL = process.env.PRESENCE_STATUS_URL || `http://${HOST_IP}:5001/status`;

const POLL_MS = 500;
const ARRIVE_STREAK = parseInt(process.env.PRESENCE_ARRIVE_STREAK || '3', 10);
const LEAVE_STREAK = parseInt(process.env.PRESENCE_LEAVE_STREAK || '15', 10);
const COOLDOWN_MS = parseInt(process.env.PRESENCE_COOLDOWN_MS || '5000', 10);
const STARTUP_MS = parseInt(process.env.PRESENCE_STARTUP_MS || '6000', 10);
// אחרי כמה קריאות כושלות ברציפות מחזירים את הציור למצב בטוח (למעלה)
const FAIL_LIMIT = parseInt(process.env.PRESENCE_FAIL_LIMIT || '10', 10);
const DEFAULT_SYS_ID = parseInt(process.env.PRESENCE_SYS_ID || '1784479996299', 10);

class PresenceService {
    constructor(mqttService) {
        this.mqttService = mqttService;
        this.sys_id = DEFAULT_SYS_ID;
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
        logger.error(`presenceService: FAILSAFE — ${reason}; raising painting to default height`);
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
            logger.error(`presenceService: failsafe failed: ${err.message}`);
        }
    }

    async shutdownReset() {
        logger.info('presenceService: system OFF — resetting painting state');
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
            logger.error(`presenceService: shutdown reset failed: ${err.message}`);
        }
    }

    start(sys_id = DEFAULT_SYS_ID) {
        this.sys_id = sys_id;
        if (this.timer) return; // already running
        this.timer = setInterval(() => {
            this.poll().catch((err) => logger.error(`presenceService poll crashed: ${err.message}`));
        }, POLL_MS);
        logger.info(`presenceService started for sys_id ${sys_id} (arrive>=${ARRIVE_STREAK}, leave>=${LEAVE_STREAK}, cooldown=${COOLDOWN_MS}ms)`);
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
            logger.warn(`presenceService: DB read failed (${err.message})`);
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
            logger.info(`presenceService: system ON — warming up ${STARTUP_MS}ms`);
        }
        if (Date.now() < this.readyAt) return;

        let status;
        try {
            const res = await axios.get(STATUS_URL, { timeout: 2000 });
            status = res.data;
        } catch (err) {
            // Inference server unreachable: log and bail without touching the
            // streak counters, so a transient network blip can't erode
            // presentStreak/absentStreak and fire a spurious departure.
            logger.warn(`presenceService: inference server unreachable at ${STATUS_URL} (${err.message})`);
            this.failStreak += 1;
            if (this.failStreak >= FAIL_LIMIT) {
                await this.failsafeRaise(`inference server unreachable x${this.failStreak}`);
            }
            return;
        }

        // מצלמה מדווחת על עצמה כתקולה — נספר גם את זה
        if (status.camera_ok === false) {
            this.failStreak += 1;
            if (this.failStreak >= FAIL_LIMIT) {
                await this.failsafeRaise(`camera reported not ok x${this.failStreak}`);
            }
            return;
        }
        if (this.failStreak > 0) {
            logger.info('presenceService: inference server back, resuming');
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
                logger.error(`presenceService: handleVisitorArrived failed: ${err.message}`);
            }
            return;
        }

        if (this.isPresent && this.absentStreak >= LEAVE_STREAK) {
            this.isPresent = false;
            try {
                await this.mqttService.handleVisitorLeft(this.sys_id, 'camera');
            } catch (err) {
                logger.error(`presenceService: handleVisitorLeft failed: ${err.message}`);
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
            logger.error(`presenceService: applyWheelchairState failed: ${err.message}`);
        }
    }
}

module.exports = { PresenceService };
