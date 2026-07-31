// Polls the Jetson inference server's /status endpoint and drives the same
// arrival/departure logic the ESP32 distance sensor drives over MQTT
// ('sensor' topic, status 'in'/'left'). Only runs when PRESENCE_SOURCE=camera
// (see index.js) — with PRESENCE_SOURCE unset/'sensor' this module is never
// instantiated, so the existing sensor-driven flow is completely unaffected.
const axios = require('axios');
const winston = require('winston');

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
const STATUS_URL = `http://${HOST_IP}:5001/status`;

const POLL_MS = 500;
const ARRIVE_STREAK = parseInt(process.env.PRESENCE_ARRIVE_STREAK || '3', 10);
const LEAVE_STREAK = parseInt(process.env.PRESENCE_LEAVE_STREAK || '15', 10);
const COOLDOWN_MS = parseInt(process.env.PRESENCE_COOLDOWN_MS || '5000', 10);
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
        let status;
        try {
            const res = await axios.get(STATUS_URL, { timeout: 2000 });
            status = res.data;
        } catch (err) {
            // Inference server unreachable: log and bail without touching the
            // streak counters, so a transient network blip can't erode
            // presentStreak/absentStreak and fire a spurious departure.
            logger.warn(`presenceService: inference server unreachable at ${STATUS_URL} (${err.message})`);
            return;
        }

        if (status.present) {
            this.presentStreak += 1;
            this.absentStreak = 0;
        } else {
            this.absentStreak += 1;
            this.presentStreak = 0;
        }

        if (!this.isPresent && this.presentStreak >= ARRIVE_STREAK) {
            this.isPresent = true;
            this.lastCommand = null;
            this.lastCommandAt = 0;
            try {
                await this.mqttService.handleVisitorArrived(this.sys_id, 'camera');
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
