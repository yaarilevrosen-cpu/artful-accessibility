import glob as _glob
import time as _t


def resolve_camera_device(by_id_pattern="/dev/v4l/by-id/*index0",
                           max_attempts=10, initial_delay=0.5, max_delay=5.0,
                           glob_fn=_glob.glob, sleep_fn=_t.sleep, log=print):
    """Retry-with-backoff glob for the camera's stable by-id path.

    A cold boot or a transport (different USB hub/port) can mean the
    camera hasn't enumerated yet when this runs. Globbing once and
    falling straight through to device index 0 (a different, possibly
    wrong, physical device) locks the inference server onto the wrong
    camera indefinitely, since nothing re-globs afterwards. Retries with
    exponential backoff before giving up and returning the index-0
    fallback as a last resort.
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
    log(f"WARNING: camera never enumerated via {by_id_pattern} after "
        f"{max_attempts} attempts; falling back to device index 0")
    return 0
