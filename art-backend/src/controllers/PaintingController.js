const Painting = require('../models/PaintingSystem');
const {PaintingStats} = require('../models/PaintingStats');
const { painting_status } = require('../utils/config');
const { broadcastWS } = require('../services/websocketService');

// controllers/PaintingController.js
class PaintingController {
    constructor(mqttService) {
        this.mqttService = mqttService; // DI
    }

    async getAllPaintings(req, res) {
        try {
            const paintings = await Painting.find();
    
            // Convert binary photo data to Base64
            const formattedPaintings = paintings.map((painting) => ({
                ...painting.toObject(),
                photo: painting.photo ? `data:image/jpeg;base64,${painting.photo.toString('base64')}` : null,
            }));
    
            res.json({
                success: true,
                count: formattedPaintings.length,
                data: formattedPaintings,
            });
        } catch (error) {
            console.error("Error fetching paintings:", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    

    async getPainting(req, res) {
        try {
            const painting = await Painting.findBySysId(req.params.sys_id);

            if (!painting) {
                return res.status(404).json({
                    success: false,
                    error: 'Painting not found'
                });
            }

            res.json({
                success: true,
                data: painting
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async createPainting(req, res) {
        try {
            console.log('creating')
            const { photo, ...otherData } = req.body;
    
            // Convert Base64 to Buffer
            const bufferPhoto = photo ? Buffer.from(photo.split(",")[1], "base64") : null;
    
            const installationData = {
                sys_id: Date.now(),
                ...otherData    ,
                photo: bufferPhoto, // Save buffer in DB
            };
                
            // Save painting directly AND send MQTT message (without waiting for response)
            console.log('Saving painting and sending MQTT installation message');
            const painting = new Painting({ ...installationData, status: 'Inactive' });
            await painting.save();
            
            // Send MQTT message to Pi (fire and forget - no timeout)
            try {
                await this.mqttService.publishInstallationSimple(installationData.sys_id, otherData);
                console.log(`MQTT installation message sent for sys_id: ${installationData.sys_id}`);
            } catch (mqttError) {
                console.error('MQTT error (non-blocking):', mqttError.message);
            }
            
            res.status(200).json({ success: true, data: painting, message: 'Painting saved and installation sent to Pi' });
        } catch (error) {
            console.error('createPainting: Error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    

    async updatePainting(req, res) {
        console.log('body', req.body.data)
        try {
            const painting = await Painting.findOne({ sys_id: req.params.sys_id });

            if (!painting) {
                return res.status(404).json({
                    success: false,
                    error: 'Painting not found'
                });
            }
    
            // Destructure fields to be updated from the request body
            const {  name,painter_name,base_height,height,width,status,photo,weight,microcontroller} = req.body.data;
            // Update fields only if they are provided
                painting.height = height;
                painting.base_height = base_height;
                painting.status = status;
                painting.painter_name = painter_name;
                painting.name = name;
                painting.width = width;
                painting.weight=weight;
                painting.microcontroller=microcontroller;
                if(photo)
                painting.photo = photo; 
            
            console.log('Saving painting with updates:', painting);
            await painting.save(); // Save updated document to the database
    
            res.json({
                success: true,
                data: painting
            });
        } catch (error) {
            console.error('Error during updatePainting:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    
    async deletePainting(req, res) {
        try {
            const {sys_id} = req.params
            const painting =
                await Painting.findOne({ sys_id : sys_id }, null, { lean: true });

            if (!painting) {
                return res.status(404).json({
                    success: false,
                    error: 'Painting not found'
                });
            }
           const mqttResponse =  await this.mqttService.publish_deletion(req.params.sys_id);
            console.log('deletePainting: mqttResponse, ',mqttResponse)
            if(mqttResponse.success) {
                
                await PaintingStats.updateOne(
                    { sys_id }, // Query to match the document
                    { $set: { isStill: false , name: painting.name } }// Update operation
                    

                );
               console.log(Painting.name)
                await Painting.deleteOne({ sys_id });

                res.json({
                    success: true,
                    message: 'Painting removed successfully'
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    async sendInstallationToPi(req, res) {
        try {
            const { sys_id } = req.params;
            const painting = await Painting.findBySysId(sys_id);
            
            if (!painting) {
                return res.status(404).json({
                    success: false,
                    error: 'Painting not found'
                });
            }
            
            // Send installation message to Pi
            await this.mqttService.publishInstallationSimple(sys_id, {
                base_height: painting.base_height,
                height: painting.height,
                width: painting.width,
                microcontroller: painting.microcontroller
            });
            
            res.json({
                success: true,
                message: `Installation message sent to Pi for sys_id: ${sys_id}`
            });
        } catch (error) {
            console.error('Error sending installation to Pi:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async setHeight(req, res) {
        try {
            const { sys_id } = req.params;
            const { value } = req.body;

            if (value !== 0 && value !== 1) {
                return res.status(400).json({
                    success: false,
                    error: "Body must include 'value' as 0 (raise) or 1 (lower)"
                });
            }

            const painting = await Painting.findBySysId(sys_id);
            if (!painting) {
                return res.status(404).json({
                    success: false,
                    error: 'Painting not found'
                });
            }

            const published = await this.mqttService.sendHeightCommand(sys_id, value);

            // Persist the same DB state a detection-driven lower/raise would
            // (see applyWheelchairState / handleVisitorArrived) so a manual
            // command isn't invisible to startup reconciliation (FIX 3) —
            // otherwise a manual "lower" leaves the DB saying the painting
            // is up even though it physically isn't.
            painting.wheelchair = value ? 2 : 0;
            painting.height_adjust = !!value;
            await painting.save();
            await broadcastWS({
                sys_id: painting.sys_id,
                wheelchair: painting.wheelchair,
                height_adjust: painting.height_adjust,
            });

            res.json({
                success: true,
                sys_id,
                published
            });
        } catch (error) {
            console.error('Error sending manual height command:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async getStats(req, res) {
        try {
    
            // Fetch stats and populate the painting name from the Painting model
            const stats = await PaintingStats.find()
                .populate({
                    path: 'painting_id', // Reference to the Painting model
                    select: 'name', // Select only the name field from the Painting model
                });
    
         
                        
                      
            // Flatten the response to include the painting name at the top level
            const flattenedStats = stats.map(stat => {
                const statObject = stat.toObject(); // Convert Mongoose Document to plain object
                return {
                    ...statObject, // Include all original fields
                    name: stat.painting_id?.name || stat.name, // Add the name field
                };
            });
            console.log("flaten", flattenedStats)
    
          
    
            res.json({
                success: true,
                data: flattenedStats,
            });
        } catch (error) {
            console.error('Error in getStats:', error.message);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    
    


}

module.exports = PaintingController;