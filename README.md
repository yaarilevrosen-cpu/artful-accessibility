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
