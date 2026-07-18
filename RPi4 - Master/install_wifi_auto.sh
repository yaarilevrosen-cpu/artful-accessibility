#!/bin/bash
#
# Simple Installation Script for RPi4 WiFi Auto-Configuration
# One-file solution (like M5Stack)
#

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}🍓 Raspberry Pi 4 - WiFi Auto-Configuration${NC}"
echo -e "${BLUE}Simple One-File Installation${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root: sudo bash install_wifi_auto.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Running as root${NC}"
echo ""

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
apt-get update -qq
apt-get install -y hostapd dnsmasq wireless-tools python3-pip > /dev/null 2>&1
pip3 install --break-system-packages flask > /dev/null 2>&1
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Create directory
echo -e "${YELLOW}📁 Creating directory...${NC}"
mkdir -p /opt/artful-accessibility
mkdir -p /opt/artful-accessibility/config
echo -e "${GREEN}✅ Directory created${NC}"
echo ""

# Copy files
echo -e "${YELLOW}📋 Copying files...${NC}"
cp rpi_wifi_auto.py /opt/artful-accessibility/
chmod +x /opt/artful-accessibility/rpi_wifi_auto.py

# Copy rpi4_main.py if it exists
if [ -f "rpi4_main.py" ]; then
    cp rpi4_main.py /opt/artful-accessibility/
    echo -e "${GREEN}✅ Main program copied${NC}"
fi

# Copy sensor_logic.py if it exists
if [ -f "sensor_logic.py" ]; then
    cp sensor_logic.py /opt/artful-accessibility/
    echo -e "${GREEN}✅ Sensor logic copied${NC}"
fi

echo -e "${GREEN}✅ Files copied${NC}"
echo ""

# Install systemd service
echo -e "${YELLOW}⚙️  Installing systemd service...${NC}"
cp rpi-wifi-auto.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable rpi-wifi-auto.service
echo -e "${GREEN}✅ Service installed${NC}"
echo ""

# Configure hostapd
echo -e "${YELLOW}🌐 Configuring hostapd...${NC}"
cat > /etc/hostapd/hostapd.conf << 'EOF'
interface=wlan0
driver=nl80211
ssid=RaspberryPi-Config
hw_mode=g
channel=7
wmm_enabled=0
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_passphrase=12345678
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP
EOF

sed -i 's|#DAEMON_CONF=""|DAEMON_CONF="/etc/hostapd/hostapd.conf"|g' /etc/default/hostapd
systemctl unmask hostapd
echo -e "${GREEN}✅ Hostapd configured${NC}"
echo ""

# Configure dnsmasq
echo -e "${YELLOW}📡 Configuring dnsmasq...${NC}"
mv /etc/dnsmasq.conf /etc/dnsmasq.conf.backup 2>/dev/null || true
cat > /etc/dnsmasq.conf << 'EOF'
interface=wlan0
dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h
address=/gstatic.com/192.168.4.1
address=/captive.apple.com/192.168.4.1
EOF

echo -e "${GREEN}✅ Dnsmasq configured${NC}"
echo ""

# Summary
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}🎉 Installation Complete!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${YELLOW}📱 Usage:${NC}"
echo -e "   - Start now: ${BLUE}sudo systemctl start rpi-wifi-auto${NC}"
echo -e "   - Check status: ${BLUE}sudo systemctl status rpi-wifi-auto${NC}"
echo -e "   - View logs: ${BLUE}sudo journalctl -u rpi-wifi-auto -f${NC}"
echo -e "   - Or just: ${BLUE}sudo reboot${NC}"
echo ""
echo -e "${YELLOW}🌐 Setup:${NC}"
echo -e "   1. Connect to 'RaspberryPi-Config' WiFi"
echo -e "   2. Open http://192.168.4.1"
echo -e "   3. Configure your WiFi"
echo ""
echo -e "${GREEN}✅ Ready!${NC}"

