import glob as _glob
import time as _t


def resolve_camera_device(by_id_pattern="/dev/v4l/by-id/*index0",
                           max_attempts=10, initial_delay=0.5, max_delay=5.0,
                           glob_fn=_glob.glob, sleep_fn=_t.sleep, log=print,
                           allow_index_fallback=True):
    """Retry-with-backoff glob for the camera's stable by-id path.

    A cold boot or a transport (different USB hub/port) can mean the
    camera hasn't enumerated yet when this runs. Globbing once and
    falling straight through to device index 0 (a different, possibly
    wrong, physical device) locks the inference server onto the wrong
    camera indefinitely, since nothing re-globs afterwards. Retries with
    exponential backoff before giving up.

    allow_index_fallback controls what happens when every attempt fails.
    The single default camera keeps the historical behaviour of falling
    back to device index 0 as a last resort. Additional cameras declared
    in cameras.json must NOT fall back to index 0 — with more than one
    camera configured, index 0 belongs to nobody in particular and two
    unresolved cameras falling back to it would silently open the same
    device (or steal it from a camera that resolved correctly). Those
    return None instead, so the caller can mark the camera as offline and
    keep retrying in the background.
    """
    delay = initial_delay
    for attempt in range(1, max_attempts + 1):
        matches = glob_fn(by_id_pattern)
        if matches:
            if attempt > 1:
                log(f"Camera enumerated on attempt {attempt}: {matches[0]}")
            return matches[0]
        if attempt < max_attempts:
            log(f"Camera not yet enumerated (attempt {attempt}/{max_attempts}), "
                f"retrying in {delay}s")
            sleep_fn(delay)
            delay = min(delay * 2, max_delay)
    if allow_index_fallback:
        log(f"WARNING: camera never enumerated via {by_id_pattern} after "
            f"{max_attempts} attempts; falling back to device index 0")
        return 0
    log(f"WARNING: camera never enumerated via {by_id_pattern} after "
        f"{max_attempts} attempts; marking offline (no index fallback)")
    return None
