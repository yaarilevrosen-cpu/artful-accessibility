const express = require('express');
const router = express.Router();
const HealthController = require('../controllers/HealthController');

module.exports = function buildHealthRouter(mqttService, getPresenceManager) {
    const healthController = new HealthController(mqttService, getPresenceManager);
    router.route('/system').get(healthController.getSystemHealth.bind(healthController));
    router.route('/paintings').get(healthController.getPaintingsHealth.bind(healthController));
    return router;
};
