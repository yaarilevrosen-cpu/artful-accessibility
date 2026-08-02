import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import axios from 'axios'
import { useGetPaintingsQuery } from '../../utils/apiSlice'
import VideoCameraIcon from '@heroicons/react/24/solid/VideoCameraIcon'

// Resolves the backend/inference host from whatever address the page
// was loaded from, so LAN and Tailscale both work with one build.
const h = typeof window !== 'undefined' ? window.location.hostname : '192.168.68.135';


const INFERENCE_BASE_URL = process.env.REACT_APP_INFERENCE_URL || `http://${h}:5001`
const POLL_INTERVAL_MS = 300

function LiveDetection() {
    const dispatch = useDispatch()
    const { data: paintingsResp } = useGetPaintingsQuery()
    // Only paintings with a camera assigned can actually be viewed here.
    const paintingsWithCamera = useMemo(
        () => (paintingsResp?.data || []).filter((p) => !!p.camera_device),
        [paintingsResp]
    )

    const [selectedSysId, setSelectedSysId] = useState(null)
    const [status, setStatus] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        dispatch(setPageTitle({ title: "זיהוי בזמן אמת" }))
    }, [dispatch])

    // Default to the first painting that has a camera, once the list loads.
    useEffect(() => {
        if (selectedSysId === null && paintingsWithCamera.length > 0) {
            setSelectedSysId(paintingsWithCamera[0].sys_id)
        }
    }, [paintingsWithCamera, selectedSysId])

    const selectedPainting = paintingsWithCamera.find((p) => p.sys_id === selectedSysId) || null
    const cameraDevice = selectedPainting?.camera_device || null
    const deviceQuery = cameraDevice ? `?device=${encodeURIComponent(cameraDevice)}` : ''

    useEffect(() => {
        if (!cameraDevice) {
            setStatus(null)
            setError(null)
            return
        }
        let alive = true
        let id = null

        const poll = async () => {
            try {
                const res = await axios.get(`${INFERENCE_BASE_URL}/status${deviceQuery}`, { timeout: 5000 })
                if (!alive) return
                setStatus(res.data)
                setError(null)
            } catch (err) {
                if (alive) setError(err.message)
            }
            if (alive) id = setTimeout(poll, POLL_INTERVAL_MS)
        }
        poll()
        return () => { alive = false; if (id) clearTimeout(id) }
    }, [cameraDevice, deviceQuery])

    const wheelchair = status?.detected
    const present = status?.present
    const conf = wheelchair ? status?.confidence : status?.present_confidence

    let label = 'לא זוהה איש'
    let badge = 'badge-ghost'
    if (wheelchair) { label = 'זוהה כיסא גלגלים'; badge = 'badge-success' }
    else if (present) { label = 'זוהה אדם'; badge = 'badge-warning' }

    return (
        <div className="p-4" dir="rtl">
            <div className="flex items-center gap-2 mb-4">
                <VideoCameraIcon className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">מצלמה חיה וזיהוי</h1>
            </div>

            {paintingsWithCamera.length > 1 && (
                <div className="mb-4 max-w-2xl">
                    <label className="block text-sm font-medium mb-1">ציור</label>
                    <select
                        className="select select-bordered w-full max-w-xs"
                        value={selectedSysId ?? ''}
                        onChange={(e) => setSelectedSysId(Number(e.target.value))}
                    >
                        {paintingsWithCamera.map((p) => (
                            <option key={p.sys_id} value={p.sys_id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {paintingsWithCamera.length === 0 ? (
                <div className="alert alert-warning max-w-2xl">
                    <span>אין ציור עם מצלמה משויכת. יש להגדיר Camera Device בעריכת הציור.</span>
                </div>
            ) : (
                <div className="card bg-base-100 shadow-xl max-w-2xl">
                    <div className="card-body items-center">
                        <h2 className="card-title">{selectedPainting?.name}</h2>
                        <img
                            src={`${INFERENCE_BASE_URL}/stream${deviceQuery}`}
                            alt="שידור מצלמה חי"
                            className="rounded-lg w-full max-w-md border"
                        />

                        <div className="mt-2 flex items-center gap-2 text-xs opacity-60">
                            <span
                                className={`inline-block h-2.5 w-2.5 rounded-full ${status?.camera_ok ? 'bg-success' : 'bg-error'}`}
                                title={status?.camera_ok ? 'המצלמה תקינה' : 'המצלמה אינה מגיבה'}
                            />
                            <span>{status?.camera_ok ? 'המצלמה תקינה' : 'המצלמה מנותקת'}</span>
                            <span>·</span>
                            <span>{(status?.fps ?? 0).toFixed(1)} fps</span>
                        </div>

                        <div className={`mt-4 badge badge-lg ${badge}`}>{label}</div>

                        <div className="mt-2 text-sm opacity-70">
                            רמת ביטחון: {((conf || 0) * 100).toFixed(1)}%
                        </div>

                        <div className="mt-3 flex gap-4 text-xs opacity-60">
                            <span>אדם: {present ? 'כן' : 'לא'}</span>
                            <span>כיסא גלגלים: {wheelchair ? 'כן' : 'לא'}</span>
                        </div>

                        {error && (
                            <div className="alert alert-error mt-4">
                                <span>שגיאה: {error}</span>
                            </div>
                        )}
                        {status?.error && (
                            <div className="alert alert-error mt-4">
                                <span>שגיאת מצלמה: {status.error}</span>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    )
}

export default LiveDetection
