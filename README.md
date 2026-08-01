# Artful Accessibility

Museum accessibility system: a camera detects whether a visitor is in a
wheelchair, and the painting physically lowers to their eye level.

## Configuring the host IP address

The Jetson's LAN IP is used by the frontend and backend to reach each
other and the inference server. It is centralized in a single place:

1. Edit `.env` at the repo root and set `HOST_IP` to the Jetson's
   current IP address. A commented-out Tailscale address is included
   for remote access — uncomment it (and comment out the LAN line)
   instead of adding a new variable.

   ```
   HOST_IP=192.168.68.135
   # HOST_IP=100.86.254.69
   ```

2. Recreate the Docker services so they pick up the new value:

   ```
   docker compose up -d
   ```

   `docker-compose.yaml` reads `${HOST_IP}` and passes it to the
   frontend build (`REACT_APP_BASE_URL`, `REACT_APP_SOCKET_URL`,
   `REACT_APP_INFERENCE_URL`) and to the backend (`HOST_IP`, used to
   reach the host-side inference server on port 5001). The MQTT broker
   is reached by its Docker service name (`art_mosquitto`), not by
   `HOST_IP`, since the backend talks to it over the internal Docker
   network.

Every place that reads `HOST_IP` also has a hardcoded fallback matching
the last known IP, so nothing breaks if `.env` is missing — but the
`.env` file is the one place to change it going forward.

Note: the ESP32 painting-motor firmware is not part of this repo and
has its own configuration for reaching the MQTT broker.

## Presence source: camera (default) vs sensor

Presence detection (when the painting lowers/raises) is driven by the
Jetson camera: `art-backend/src/services/presenceService.js` polls the
inference server's `http://$HOST_IP:5001/status` twice a second and
drives arrival/departure. This is the actual, currently-deployed
system — the original ESP32 ultrasonic-distance-sensor hardware
(`RPi4 - Master/`) is retired and no longer installed.

This is controlled by the `PRESENCE_SOURCE` environment variable, read
in `art-backend/index.js`:

- `PRESENCE_SOURCE=camera` (or unset) — default. Behaviour as
  described above.
- `PRESENCE_SOURCE=sensor` — reverts to the ESP32's MQTT `sensor`
  topic driving arrival/departure instead. Kept selectable only in
  case that hardware is ever reinstalled; not exercised on the
  current deployment.

Both paths call the same `handleVisitorArrived` /
`handleVisitorLeft` methods on `mqttService`, so painting state,
viewing stats, and MQTT height commands behave identically regardless
of source. Set it in `.env` and run `docker compose up -d` to switch.
