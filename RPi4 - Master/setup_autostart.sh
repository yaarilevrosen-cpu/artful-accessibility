#!/bin/bash

# RPi4 Painting System Auto-Start Setup Script
# This script sets up the Raspberry Pi to automatically run rpi4_main.py on boot

echo "Setting up RPi4 Painting System auto-start..."

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "Please do not run this script as root. Run as pi user."
    exit 1
fi

# Check if we're in the correct directory
if [ ! -f "rpi4_main.py" ]; then
    echo "Error: rpi4_main.py not found. Please run this script from the RPi4 - Master directory."
    exit 1
fi

# Get current user
CURRENT_USER=$(whoami)
echo "Current user: $CURRENT_USER"

# Create a wrapper script to handle the spaces in directory names
echo "Creating wrapper script..."
cat > /home/$CURRENT_USER/start_rpi4_painting.sh << 'EOF'
#!/bin/bash
cd "/home/mike/Desktop/RPi4-Painting-MC/RPi4 - Master"
exec /usr/bin/python3 rpi4_main.py
EOF

chmod +x /home/$CURRENT_USER/start_rpi4_painting.sh

# Create the service file
echo "Creating systemd service file for user: $CURRENT_USER..."
sudo tee /etc/systemd/system/rpi4-painting.service > /dev/null << EOF
[Unit]
Description=RPi4 Painting System
After=network.target
Wants=network.target

[Service]
Type=simple
User=$CURRENT_USER
Group=$CURRENT_USER
ExecStart=/home/$CURRENT_USER/start_rpi4_painting.sh
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=rpi4-painting

# Environment variables
Environment=PYTHONUNBUFFERED=1

# Security settings
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd daemon
echo "Reloading systemd daemon..."
sudo systemctl daemon-reload

# Enable the service
echo "Enabling rpi4-painting service..."
sudo systemctl enable rpi4-painting.service

# Start the service
echo "Starting rpi4-painting service..."
sudo systemctl start rpi4-painting.service

# Check service status
echo "Checking service status..."
sudo systemctl status rpi4-painting.service --no-pager

echo ""
echo "Setup complete!"
echo ""
echo "Service commands:"
echo "  Check status:    sudo systemctl status rpi4-painting"
echo "  Start service:   sudo systemctl start rpi4-painting"
echo "  Stop service:    sudo systemctl stop rpi4-painting"
echo "  Restart service: sudo systemctl restart rpi4-painting"
echo "  View logs:       journalctl -u rpi4-painting -f"
echo "  Disable service: sudo systemctl disable rpi4-painting"
echo ""
echo "The service will now start automatically when the Raspberry Pi boots."
echo "To view real-time logs, run: journalctl -u rpi4-painting -f"
