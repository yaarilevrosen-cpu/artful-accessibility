import { useEffect, useState } from 'react';
import axios from 'axios';
import CpuChipIcon from '@heroicons/react/24/outline/CpuChipIcon';
import ServerIcon from '@heroicons/react/24/outline/ServerIcon';
import CircleStackIcon from '@heroicons/react/24/outline/CircleStackIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/solid/ExclamationTriangleIcon';
import PaintBrushIcon from '@heroicons/react/24/outline/PaintBrushIcon';
import { useTranslation } from '../i18n';

// Deliberately uses plain axios, not utils/axios's shared instance - that
// instance's response interceptor pops a blocking window.alert() on every
// failed request, which would fire every poll interval while the backend
// is down. This strip should degrade quietly to "unknown", not spam alerts.
const h = typeof window !== 'undefined' ? window.location.hostname : '192.168.68.135';
const BASE_URL = process.env.REACT_APP_BASE_URL || `http://${h}:3001`;
const POLL_MS = 15000;

// Jetson Orin Nano thermal throttling begins in the 90s (C); these
// thresholds flag "worth watching" and "act now" well before that point.
const TEMP_WARM_C = 65;
const TEMP_HOT_C = 80;
const DISK_LOW_PCT = 85;
const DISK_CRITICAL_PCT = 95;

function formatUptime(seconds, t) {
    if (seconds === null || seconds === undefined) return t('health.unknown');
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return t('health.uptimeDaysHours', { days, hours });
    if (hours > 0) return t('health.uptimeHoursMinutes', { hours, minutes });
    return t('health.uptimeMinutes', { minutes });
}

function tempSeverity(tempC) {
    if (tempC === null || tempC === undefined) return 'unknown';
    if (tempC >= TEMP_HOT_C) return 'hot';
    if (tempC >= TEMP_WARM_C) return 'warm';
    return 'normal';
}

const SEVERITY_STYLE = {
    normal: 'text-emerald-600 dark:text-emerald-400',
    warm: 'text-amber-600 dark:text-amber-400',
    hot: 'text-red-600 dark:text-red-400',
    unknown: 'text-gray-400',
};

function Metric({ icon, label, value, severity, severityLabel }) {
    return (
        <div className="flex items-center gap-1.5" title={label}>
            {icon}
            <span className="hidden sm:inline text-gray-500 dark:text-gray-400">{label}:</span>
            <span className={`font-semibold ${SEVERITY_STYLE[severity || 'unknown']}`}>
                {value}
                {severityLabel && <span className="ms-1 text-[10px] font-normal opacity-80">({severityLabel})</span>}
            </span>
        </div>
    );
}

function UpDownIndicator({ up, upLabel, downLabel }) {
    return up ? (
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircleIcon className="w-4 h-4" aria-hidden="true" />
            {upLabel}
        </span>
    ) : (
        <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
            <XCircleIcon className="w-4 h-4" aria-hidden="true" />
            {downLabel}
        </span>
    );
}

function SystemHealthStrip() {
    const { t } = useTranslation();
    const [health, setHealth] = useState(null);
    const [reachable, setReachable] = useState(true);

    useEffect(() => {
        let alive = true;
        const poll = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/health/system`, { timeout: 4000 });
                if (!alive) return;
                setHealth(res.data);
                setReachable(true);
            } catch (err) {
                if (!alive) return;
                setReachable(false);
            }
        };
        poll();
        const id = setInterval(poll, POLL_MS);
        return () => { alive = false; clearInterval(id); };
    }, []);

    if (!reachable || !health) {
        return (
            <div className="flex items-center gap-2 px-4 py-1.5 text-xs bg-red-50 dark:bg-red-950 border-b border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 font-semibold">
                <ExclamationTriangleIcon className="w-4 h-4" aria-hidden="true" />
                {t('health.backendUnreachable')}
            </div>
        );
    }

    const cpuSeverity = tempSeverity(health.cpu_temp_c);
    const gpuSeverity = tempSeverity(health.gpu_temp_c);
    const diskPct = health.disk?.used_pct;
    const diskSeverity = diskPct === null || diskPct === undefined
        ? 'unknown'
        : diskPct >= DISK_CRITICAL_PCT ? 'hot' : diskPct >= DISK_LOW_PCT ? 'warm' : 'normal';
    const severityLabel = (sev) => ({
        normal: t('health.severity.normal'),
        warm: t('health.severity.warm'),
        hot: t('health.severity.hot'),
        unknown: t('health.severity.unknown'),
    }[sev]);

    return (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-4 py-1.5 text-xs bg-base-200 border-b border-base-300 overflow-x-auto">
            <Metric
                icon={<CpuChipIcon className="w-4 h-4 text-gray-500" aria-hidden="true" />}
                label={t('health.cpu')}
                value={health.cpu_temp_c !== null ? `${health.cpu_temp_c}°C` : t('health.unknown')}
                severity={cpuSeverity}
                severityLabel={severityLabel(cpuSeverity)}
            />
            <Metric
                icon={<CpuChipIcon className="w-4 h-4 text-gray-500" aria-hidden="true" />}
                label={t('health.gpu')}
                value={health.gpu_temp_c !== null ? `${health.gpu_temp_c}°C` : t('health.unknown')}
                severity={gpuSeverity}
                severityLabel={severityLabel(gpuSeverity)}
            />
            <Metric
                icon={<CircleStackIcon className="w-4 h-4 text-gray-500" aria-hidden="true" />}
                label={t('health.disk')}
                value={health.disk ? t('health.diskValue', { free: health.disk.free_gb, total: health.disk.total_gb }) : t('health.unknown')}
                severity={diskSeverity}
                severityLabel={severityLabel(diskSeverity)}
            />
            <Metric
                icon={<ClockIcon className="w-4 h-4 text-gray-500" aria-hidden="true" />}
                label={t('health.uptime')}
                value={formatUptime(health.uptime_seconds, t)}
                severity="normal"
            />
            <div className="flex items-center gap-1.5">
                <ServerIcon className="w-4 h-4 text-gray-500" aria-hidden="true" />
                <span className="hidden sm:inline text-gray-500 dark:text-gray-400">{t('health.inferenceServer')}:</span>
                <UpDownIndicator up={health.inference_server_up} upLabel={t('health.online')} downLabel={t('health.offline')} />
            </div>
            <div className="flex items-center gap-1.5">
                <ServerIcon className="w-4 h-4 text-gray-500" aria-hidden="true" />
                <span className="hidden sm:inline text-gray-500 dark:text-gray-400">{t('health.broker')}:</span>
                <UpDownIndicator up={health.mqtt_broker_up} upLabel={t('health.online')} downLabel={t('health.offline')} />
            </div>
            <div className="flex items-center gap-1.5">
                <PaintBrushIcon className="w-4 h-4 text-gray-500" aria-hidden="true" />
                <span className="text-gray-500 dark:text-gray-400">{t('health.activePaintings')}:</span>
                <span className="font-semibold">{health.active_paintings ?? t('health.unknown')}</span>
            </div>
        </div>
    );
}

export default SystemHealthStrip;
