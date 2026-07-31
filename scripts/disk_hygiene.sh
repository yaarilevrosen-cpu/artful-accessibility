#!/bin/bash
# Daily disk hygiene for the museum accessibility system:
# delete saved detection frames older than DAYS_TO_KEEP.
#
# Docker's own json-file log rotation (max-size/max-file, configured in
# docker-compose.yaml) handles the backend/frontend/mosquitto/mongodb
# container logs — do NOT truncate those log files directly from here.
# A truncate-based rotation was tried and abandoned: it left `docker logs`
# permanently hung for the container until the container was restarted,
# which is worse than the disk usage problem it was meant to solve.
#
# Usage: disk_hygiene.sh [--dry-run]

set -uo pipefail

DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

FRAMES_DIR="/home/museum/artful-accessibility/art-backend/src/camera/frames"
DAYS_TO_KEEP=7

LOG_FILE="/home/museum/artful-accessibility/logs/disk-hygiene.log"
LOG_FILE_MAX_LINES=5000

mkdir -p "$(dirname "$LOG_FILE")"

log() { echo "[$(date -Iseconds)] $*" | tee -a "$LOG_FILE"; }

log "=== disk hygiene run start (dry_run=${DRY_RUN}) ==="

if [ -d "$FRAMES_DIR" ]; then
    STALE=$(find "$FRAMES_DIR" -type f -mtime +"$DAYS_TO_KEEP" -print)
    if [ -n "$STALE" ]; then
        COUNT=$(echo "$STALE" | wc -l)
        log "Frames older than ${DAYS_TO_KEEP}d (${COUNT} files):"
        echo "$STALE" | tee -a "$LOG_FILE"
        if [ "$DRY_RUN" -eq 0 ]; then
            find "$FRAMES_DIR" -type f -mtime +"$DAYS_TO_KEEP" -delete
            find "$FRAMES_DIR" -mindepth 1 -type d -empty -delete
            log "Deleted ${COUNT} stale frame file(s)."
        else
            log "[dry-run] would delete the ${COUNT} file(s) listed above."
        fi
    else
        log "No frames older than ${DAYS_TO_KEEP}d."
    fi
else
    log "Frames dir $FRAMES_DIR does not exist, nothing to prune."
fi

log "=== disk hygiene run end ==="

if [ "$DRY_RUN" -eq 0 ] && [ -f "$LOG_FILE" ]; then
    tail -n "$LOG_FILE_MAX_LINES" "$LOG_FILE" > "${LOG_FILE}.tmp" 2>/dev/null && mv "${LOG_FILE}.tmp" "$LOG_FILE"
fi
