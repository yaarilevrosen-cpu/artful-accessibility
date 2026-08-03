// index.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // Optional: for logging
require('dotenv').config();
const session = require('express-session');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev')); // Optional: for logging
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,

}));
// Import routes
const paintingRoutes = require('./src/routes/PaintingRouter');
const connectDB = require("./src/database/config");
const {processFrame, processCamera, start_camera_analyze, deleteAllFrameFolders} = require("./src/camera/ML-Stream");
const MQTTService = require("./src/services/mqttService");
const {seedUsers} = require("./src/models/User");
const {initializeWebSocket} = require("./src/services/websocketService");
const {createServer} = require("node:http");
const {PresenceManager} = require("./src/services/presenceService");

// middleware/auth.js
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
};

const isAdmin = (req, res, next) => {
    if (req.session && req.session.userRole === 'admin') {
        return next();
    }
    res.status(403).json({ message: 'Forbidden' });
};

// Assigned once presenceManager starts (below, inside server.listen) - a
// getter closure is handed to HealthRouter instead of the value itself so
// routes registered now can still see it once startup finishes, since
// route handlers only run later, at request time.
let presenceManager = null;

// Use routes - all painting routes will be prefixed with /api/paintings
app.use('/auth', require('./src/controllers/AuthController'));
app.use('/paintings', paintingRoutes);
app.use('/health', require('./src/routes/HealthRouter')(paintingRoutes.mqttService, () => presenceManager));
// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});
let mqttService
// Start server
const PORT = process.env.PORT || 5000;
const server = createServer(app);

const wss = initializeWebSocket(server);
console.log('WebSocket server initialized');

server.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectDB();
    await seedUsers();
    await deleteAllFrameFolders();
    console.log("Connected to MongoDB");

    // camera is the real default (PRESENCE_SOURCE=camera) — the ESP32 distance
    // sensor hardware this used to gate on is retired. One poller per painting
    // that has a camera_device assigned; the manager rescans the paintings
    // collection on a timer, so paintings added or (re)assigned a camera while
    // the server is running are picked up without a restart.
    if (process.env.PRESENCE_SOURCE === 'camera') {
        presenceManager = new PresenceManager(paintingRoutes.mqttService);
        presenceManager.start();
        console.log('PRESENCE_SOURCE=camera: presenceManager started');
    } else {
        console.log(`PRESENCE_SOURCE=${process.env.PRESENCE_SOURCE || 'sensor'}: presenceManager not started (sensor-driven flow only)`);
    }
});

app.on('error', (error) => {
    console.error('Server error:', error);
});

module.exports = app;