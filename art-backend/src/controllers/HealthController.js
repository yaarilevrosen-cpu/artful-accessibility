const axios = require('axios');
const Painting = require('../models/PaintingSystem');
const { getCpuTempC, getGpuTempC, getUptimeSeconds, getDiskFree } = require('../utils/hostMetrics');

const HOST_IP = process.env.HOST_IP || 'jetson-host';
const INFERENCE_HEALTH_URL = `http://${HOST_IP}:5001/health`;

class HealthController {
    constructor(mqttService, getPresenceManager) {
        this.mqttService = mqttService;
        this.getPresenceManager = getPresenceManager || (() => null);
    }

    // Per-painting camera status for the offline-alerting banner. Only
    // paintings currently being polled (Active + camera_device assigned)
    // appear here; anything else is "not applicable" as far as camera
    // offline-alerting goes, not "offline".
    async getPaintingsHealth(req, res) {
        const presenceManager = this.getPresenceManager();
        const cameraStatus = presenceManager ? presenceManager.getStatusSummary() : [];
        res.json({ success: true, cameras: cameraStatus });
    }

    async getSystemHealth(req, res) {
        let inferenceServerUp = false;
        try {
            await axios.get(INFERENCE_HEALTH_URL, { timeout: 2000 });
            inferenceServerUp = true;
        } catch (err) {
            inferenceServerUp = false;
        }

        let activePaintings = null;
        try {
            activePaintings = await Painting.countDocuments({ status: 'Active' });
        } catch (err) {
            activePaintings = null;
        }

        res.json({
            success: true,
            cpu_temp_c: getCpuTempC(),
            gpu_temp_c: getGpuTempC(),
            uptime_seconds: getUptimeSeconds(),
            disk: getDiskFree(),
            inference_server_up: inferenceServerUp,
            mqtt_broker_up: !!this.mqttService?.mqttClient?.connected,
            active_paintings: activePaintings,
        });
    }
}

module.exports = HealthController;
