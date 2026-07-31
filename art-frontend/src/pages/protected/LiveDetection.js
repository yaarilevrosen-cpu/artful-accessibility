import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import axios from 'axios'
import backendAxios from '../../utils/axios'
import VideoCameraIcon from '@heroicons/react/24/solid/VideoCameraIcon'

const INFERENCE_BASE_URL = process.env.REACT_APP_INFERENCE_URL || 'http://192.168.68.135:5001'
const POLL_INTERVAL_MS = 300
const LIVE_SYS_ID = 1784479996299

function LiveDetection() {
    const dispatch = useDispatch()
    const [status, setStatus] = useState(null)
    const [error, setError] = useState(null)
    const [lastCommand, setLastCommand] = useState(null)
    const [commandError, setCommandError] = useState(null)
    const [sending, setSending] = useState(false)

    const sendHeightCommand = async (value) => {
        setSending(true)
        setCommandError(null)
        try {
            await backendAxios.post(`/paintings/${LIVE_SYS_ID}/height`, { value })
            setLastCommand({ value, ts: new Date() })
        } catch (err) {
            setCommandError(err.message || 'שליחת הפקודה נכשלה')
        } finally {
            setSending(false)
        }
    }

    useEffect(() => {
        dispatch(setPageTitle({ title: "זיהוי בזמן אמת" }))
        let alive = true
        let id = null

        const poll = async () => {
            try {
                const res = await axios.get(`${INFERENCE_BASE_URL}/status`, { timeout: 5000 })
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
    }, [dispatch])

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

            <div className="card bg-base-100 shadow-xl max-w-2xl">
                <div className="card-body items-center">
                    <img
                        src={`${INFERENCE_BASE_URL}/stream`}
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

                    <div className="divider">שליטה ידנית</div>

                    <div className="flex gap-3">
                        <button
                            className="btn btn-primary"
                            disabled={sending}
                            onClick={() => sendHeightCommand(1)}
                        >
                            הנמך את הציור
                        </button>
                        <button
                            className="btn btn-outline"
                            disabled={sending}
                            onClick={() => sendHeightCommand(0)}
                        >
                            הרם את הציור
                        </button>
                    </div>

                    {lastCommand && (
                        <div className="mt-2 text-xs opacity-60">
                            פקודה אחרונה שנשלחה: {lastCommand.value === 1 ? 'הנמכה' : 'הרמה'} בשעה{' '}
                            {lastCommand.ts.toLocaleTimeString()}
                        </div>
                    )}

                    {commandError && (
                        <div className="alert alert-error mt-2">
                            <span>שגיאה: {commandError}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LiveDetection
