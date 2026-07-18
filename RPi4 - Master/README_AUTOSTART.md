# RPi4 Painting System - Auto-Start Setup

This guide will help you set up your Raspberry Pi to automatically run the `rpi4_main.py` script when it boots up.

## What This Does

- **Automatic Startup**: The script runs immediately when the Raspberry Pi powers on
- **Auto-Restart**: If the script crashes, it automatically restarts after 5 seconds
- **Logging**: All output is logged and can be viewed in real-time
- **Safe**: No changes to your existing code or system

## Files Created

1. `rpi4-painting.service` - Systemd service configuration
2. `setup_autostart.sh` - Installation script
3. `rpi4-painting-logrotate.conf` - Log rotation configuration

## Setup Instructions

### Step 1: Transfer Files to Raspberry Pi

1. Copy all files to your Raspberry Pi in the correct directory:
   ```bash
   scp -r "RPi4 - Master" pi@raspberrypi.local:~/Desktop/RPi4-Painting-MC/
   ```

2. SSH into your Raspberry Pi:
   ```bash
   ssh pi@raspberrypi.local
   # Password: 12345
   ```

3. Navigate to the directory:
   ```bash
   cd Desktop/RPi4-Painting-MC/RPi4\ -\ Master/
   ```

### Step 2: Run the Setup Script

1. Make the setup script executable:
   ```bash
   chmod +x setup_autostart.sh
   ```

2. Run the setup script:
   ```bash
   ./setup_autostart.sh
   ```

The script will:
- Create the systemd service
- Enable auto-start on boot
- Start the service immediately
- Show you the status

### Step 3: Verify Everything Works

1. Check if the service is running:
   ```bash
   sudo systemctl status rpi4-painting
   ```

2. View real-time logs:
   ```bash
   journalctl -u rpi4-painting -f
   ```

3. Test auto-restart by stopping the service:
   ```bash
   sudo systemctl stop rpi4-painting
   # Wait 5 seconds, then check status again
   sudo systemctl status rpi4-painting
   ```

## Service Management Commands

| Command | Description |
|---------|-------------|
| `sudo systemctl status rpi4-painting` | Check service status |
| `sudo systemctl start rpi4-painting` | Start the service |
| `sudo systemctl stop rpi4-painting` | Stop the service |
| `sudo systemctl restart rpi4-painting` | Restart the service |
| `journalctl -u rpi4-painting -f` | View real-time logs |
| `journalctl -u rpi4-painting --since "1 hour ago"` | View logs from last hour |
| `sudo systemctl disable rpi4-painting` | Disable auto-start (if needed) |

## Log Management

- **Real-time logs**: `journalctl -u rpi4-painting -f`
- **Recent logs**: `journalctl -u rpi4-painting --since "1 hour ago"`
- **All logs**: `journalctl -u rpi4-painting`
- **Log rotation**: Configured to keep 7 days of logs

## Troubleshooting

### Service Won't Start
1. Check the service status: `sudo systemctl status rpi4-painting`
2. Check logs: `journalctl -u rpi4-painting`
3. Verify file paths are correct in the service file

### Script Crashes Repeatedly
1. Check logs for error messages: `journalctl -u rpi4-painting -f`
2. Test the script manually: `python3 rpi4_main.py`
3. Check if all dependencies are installed

### Disable Auto-Start
If you need to disable auto-start:
```bash
sudo systemctl disable rpi4-painting
sudo systemctl stop rpi4-painting
```

### Re-enable Auto-Start
To re-enable auto-start:
```bash
sudo systemctl enable rpi4-painting
sudo systemctl start rpi4-painting
```

## What Happens Now

1. **Power on Raspberry Pi** → Script starts automatically
2. **Script crashes** → Automatically restarts after 5 seconds
3. **All output** → Logged and viewable with `journalctl`
4. **No manual intervention** → Everything runs automatically

## Safety Notes

- ✅ **Safe**: No changes to your existing code
- ✅ **Reversible**: Can be disabled anytime
- ✅ **Non-intrusive**: Doesn't affect other system processes
- ✅ **Logged**: All output is captured and viewable

Your Raspberry Pi will now work exactly like your M5Stack - just power it on and it starts working automatically!
