import { useEffect, useState } from 'react';
import axios from 'axios';
import { useGetPaintingsQuery } from '../utils/apiSlice';
import ExclamationTriangleIcon from '@heroicons/react/24/solid/ExclamationTriangleIcon';
import { useTranslation } from '../i18n';

// Plain axios, not utils/axios's shared instance - see SystemHealthStrip.js
// for why (that instance alerts() on every failed request).
const h = typeof window !== 'undefined' ? window.location.hostname : '192.168.68.135';
const BASE_URL = process.env.REACT_APP_BASE_URL || `http://${h}:3001`;
const POLL_MS = 10000;

// Top-level "something needs attention" banner (section 5 of the polish
// pass): today this covers a painting's camera failing to report, since
// that's the one signal presenceService actually has live data for (see
// PresenceManager.getStatusSummary). The ESP32 controller's own heartbeat
// (m5stack/<sys_id>/status) isn't part of this yet - the firmware that
// would publish it hasn't been flashed, so there's no real signal to
// surface; adding a "controller offline" indicator now would just show
// permanently-offline for every painting with no way to tell that apart
// from a genuine fault.
function OfflineBanner() {
    const { t } = useTranslation();
    const { data: paintingsResp } = useGetPaintingsQuery();
    const [cameraStatus, setCameraStatus] = useState([]);

    useEffect(() => {
        let alive = true;
        const poll = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/health/paintings`, { timeout: 4000 });
                if (!alive) return;
                setCameraStatus(res.data?.cameras || []);
            } catch (err) {
                // Backend unreachable is already surfaced loudly by
                // SystemHealthStrip - don't duplicate that alert here.
            }
        };
        poll();
        const id = setInterval(poll, POLL_MS);
        return () => { alive = false; clearInterval(id); };
    }, []);

    const paintings = paintingsResp?.data || [];
    const offline = cameraStatus
        .filter((c) => !c.camera_ok)
        .map((c) => {
            const painting = paintings.find((p) => p.sys_id === c.sys_id);
            return painting?.name || c.sys_id;
        });

    if (offline.length === 0) return null;

    return (
        <div
            role="alert"
            className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white font-semibold"
        >
            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <span>{t('offline.cameraBanner', { paintings: offline.join(', ') })}</span>
        </div>
    );
}

export default OfflineBanner;
