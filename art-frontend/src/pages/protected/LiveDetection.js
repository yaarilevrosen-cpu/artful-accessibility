import { useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import axios from 'axios'
import VideoCameraIcon from '@heroicons/react/24/solid/VideoCameraIcon'

const INFERENCE_BASE_URL = 'http://192.168.68.133:5001'
const POLL_INTERVAL_MS = 50

function LiveDetection() {
    const dispatch = useDispatch()

    const [imageSrc, setImageSrc] = useState(null)
    const [detected, setDetected] = useState(null)
    const [confidence, setConfidence] = useState(0)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    const isMounted = useRef(true)

    useEffect(() => {
        dispatch(setPageTitle({ title: "Live Detection" }))
        isMounted.current = true

        const poll = async () => {
            try {
                const capRes = await axios.get(`${INFERENCE_BASE_URL}/capture`, { timeout: 8000 })
                const imgB64 = capRes.data?.image
                if (!imgB64) throw new Error("No image returned from /capture")

                const detRes = await axios.post(
                    `${INFERENCE_BASE_URL}/detect`,
                    { image: imgB64 },
                    { timeout: 8000, headers: { 'Content-Type': 'application/json' } }
                )

                if (!isMounted.current) return

                setImageSrc(`data:image/jpeg;base64,${imgB64}`)
                setDetected(detRes.data?.detected ?? null)
                setConfidence(detRes.data?.best_conf ?? detRes.data?.confidence ?? 0)
                setError(null)
                setLoading(false)
            } catch (err) {
                if (!isMounted.current) return
                setError(err.message || "Failed to reach inference server")
                setLoading(false)
            }
        }

        let timeoutId = null
        const scheduleNext = async () => {
            await poll()
            if (isMounted.current) {
                timeoutId = setTimeout(scheduleNext, POLL_INTERVAL_MS)
            }
        }
        scheduleNext()

        return () => {
            isMounted.current = false
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [dispatch])

    return (
        <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
                <VideoCameraIcon className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Live Camera & Detection</h1>
            </div>

            <div className="card bg-base-100 shadow-xl max-w-2xl">
                <div className="card-body items-center">
                    {loading && (
                        <div className="py-20">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="alert alert-error">
                            <span>{error}</span>
                        </div>
                    )}

                    {!loading && !error && imageSrc && (
                        <>
                            <img
                                src={imageSrc}
                                alt="Live camera feed"
                                className="rounded-lg w-full max-w-md border"
                            />
                            <div className={`mt-4 badge badge-lg ${detected ? 'badge-success' : 'badge-ghost'}`}>
                                {detected ? 'Wheelchair Detected' : 'No Wheelchair'}
                            </div>
                            <div className="mt-2 text-sm opacity-70">
                                Confidence: {(confidence * 100).toFixed(1)}%
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LiveDetection
