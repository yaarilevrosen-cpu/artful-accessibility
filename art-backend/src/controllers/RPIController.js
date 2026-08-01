const Painting = require('../models/PaintingSystem');
const { broadcastWS } = require('../services/websocketService');

async function updateStatus(sys_id, status) {
    try {
        const id = parseInt(sys_id, 10);
        await Painting.updateOne({ sys_id: id }, { $set: { status } });
        const p = await Painting.findOne({ sys_id: id });
        await broadcastWS({
            sys_id: id,
            status,
            sensor: p ? p.sensor : false,
            wheelchair: p ? p.wheelchair : 0,
            height_adjust: p ? p.height_adjust : false,
        });
        console.log('broadcast status', id, status);
    } catch (e) {
        console.error('status update failed:', e.message);
    }
}



class RPIController {
    constructor(mqttService) {
        this.mqttService = mqttService; // DI
    }


    async start_program_painting(req, res) {
        try {    
            const { sys_id } = req.params;
    this.mqttService.publish_start_program(sys_id)
            await updateStatus(sys_id, 'Active')
            res.json({
                success: true,
            
            });
        } catch (error) {
            console.error("Error shutdown:", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async stop_program_painting(req, res) {
        try {    
            const { sys_id } = req.params;
    this.mqttService.publish_stop_program(sys_id)
            await updateStatus(sys_id, 'Inactive')
            res.json({
                success: true,
            
            });
        } catch (error) {
            console.error("Error shutdown:", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async shutdown_painting(req, res) {
        try {    
            const { sys_id } = req.params;
    this.mqttService.publish_shutdown(sys_id)
            res.json({
                success: true,
            
            });
        } catch (error) {
            console.error("Error shutdown:", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async restart_painting(req, res) {
        try {    
            const { sys_id } = req.params;

    this.mqttService.publish_restart(sys_id)
            res.json({
                success: true,
            
            });
        } catch (error) {
            console.error("Error restart:", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }

}

module.exports = RPIController;