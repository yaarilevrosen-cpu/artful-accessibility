// One-off, idempotent, reversible migration: sets camera_device on a
// painting to the /dev/v4l/by-id/... path its camera resolves to.
// Additive only — never touches any other field, safe to re-run.
//
// Usage (run inside the backend container so it shares MONGODB_URI):
//   docker compose exec backend node scripts/migrate_camera_device.js <sys_id> <device_path>
//   docker compose exec backend node scripts/migrate_camera_device.js <sys_id> --revert
require('dotenv').config();
const mongoose = require('mongoose');
const Painting = require('../src/models/PaintingSystem');

async function main() {
    const [sysIdArg, deviceArg] = process.argv.slice(2);
    if (!sysIdArg || !deviceArg) {
        console.error('Usage: node scripts/migrate_camera_device.js <sys_id> <device_path|--revert>');
        process.exit(1);
    }
    const sys_id = parseInt(sysIdArg, 10);
    const revert = deviceArg === '--revert';

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/painting-system');

    const painting = await Painting.findOne({ sys_id });
    if (!painting) {
        console.error(`No painting found with sys_id ${sys_id}`);
        await mongoose.disconnect();
        process.exit(1);
    }

    if (revert) {
        painting.camera_device = null;
        await painting.save();
        console.log(`Reverted: sys_id ${sys_id} camera_device cleared.`);
    } else {
        const before = painting.camera_device;
        painting.camera_device = deviceArg;
        await painting.save();
        console.log(`sys_id ${sys_id}: camera_device ${before ? `"${before}"` : '(unset)'} -> "${deviceArg}"`);
    }

    await mongoose.disconnect();
}

main().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
