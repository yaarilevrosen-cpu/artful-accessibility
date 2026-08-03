// Reads host state through the narrow read-only mounts set up in
// docker-compose.yaml (see the backend service's volumes). Every function
// here is defensive: a missing/unreadable path (e.g. running outside the
// Jetson, or the mounts not present) returns null instead of throwing, so
// the health strip degrades to "unknown" rather than crashing the endpoint.
const fs = require('fs');
const path = require('path');

const THERMAL_ROOT = '/host/sys/devices/virtual/thermal';
const UPTIME_FILE = '/host/proc/uptime';
const DISK_ROOT = '/host/disk';

function readThermalZoneTemp(matchType) {
    try {
        const zones = fs.readdirSync(THERMAL_ROOT).filter((n) => n.startsWith('thermal_zone'));
        for (const zone of zones) {
            const typePath = path.join(THERMAL_ROOT, zone, 'type');
            const tempPath = path.join(THERMAL_ROOT, zone, 'temp');
            const type = fs.readFileSync(typePath, 'utf8').trim().toLowerCase();
            if (type.includes(matchType)) {
                const raw = fs.readFileSync(tempPath, 'utf8').trim();
                if (!raw) continue; // some Jetson zones (e.g. cv0-thermal) report empty
                const millideg = parseInt(raw, 10);
                if (Number.isNaN(millideg)) continue;
                return Math.round((millideg / 1000) * 10) / 10;
            }
        }
    } catch (err) {
        return null;
    }
    return null;
}

function getCpuTempC() {
    return readThermalZoneTemp('cpu');
}

function getGpuTempC() {
    return readThermalZoneTemp('gpu');
}

function getUptimeSeconds() {
    try {
        const raw = fs.readFileSync(UPTIME_FILE, 'utf8').trim();
        const seconds = parseFloat(raw.split(' ')[0]);
        return Number.isNaN(seconds) ? null : Math.round(seconds);
    } catch (err) {
        return null;
    }
}

function getDiskFree() {
    try {
        const stats = fs.statfsSync(DISK_ROOT);
        const totalBytes = stats.blocks * stats.bsize;
        const freeBytes = stats.bavail * stats.bsize;
        const usedPct = totalBytes > 0 ? Math.round(((totalBytes - freeBytes) / totalBytes) * 100) : null;
        return {
            total_gb: Math.round((totalBytes / 1024 / 1024 / 1024) * 10) / 10,
            free_gb: Math.round((freeBytes / 1024 / 1024 / 1024) * 10) / 10,
            used_pct: usedPct,
        };
    } catch (err) {
        return null;
    }
}

module.exports = { getCpuTempC, getGpuTempC, getUptimeSeconds, getDiskFree };
