# 🍓 Raspberry Pi 4 - Simple WiFi Auto-Configuration

## 🎯 One-File Solution (Like M5Stack!)

Simple, automatic WiFi configuration system that works just like your M5Stack's WiFi setup.

---

## 📦 What You Get

**3 Files Total:**
1. `rpi_wifi_auto.py` - Main WiFi manager (~600 lines)
2. `rpi-wifi-auto.service` - Systemd service
3. `install_wifi_auto.sh` - One-command installation

**That's it! Simple and clean.**

---

## 🚀 How It Works

### **On Boot:**
```
1. Check for saved WiFi config
2. If found → Connect to WiFi → Launch rpi4_main.py ✅
3. If not found → Start hotspot → Wait for user
```

### **WiFi Monitoring:**
```
Loop every 2 seconds:
  - WiFi connected? → Continue
  - WiFi disconnected? → Stop main program
                       → Start hotspot
                       → Wait for reconfiguration
```

### **User Configuration:**
```
1. Connect to "RaspberryPi-Config" WiFi (password: 12345678)
2. Open http://192.168.4.1
3. Enter WiFi credentials
4. System tests connection (real test!)
5. If successful → Save config
                 → Stop hotspot
                 → Connect to WiFi
                 → Launch rpi4_main.py ✅
6. If failed → Show error, stay in hotspot mode
```

---

## 📱 Installation

### **On Raspberry Pi:**

```bash
cd ~/Desktop

# Copy all files to Desktop first
# Then:

sudo bash install_wifi_auto.sh
```

**Done! Now reboot:**

```bash
sudo reboot
```

---

## ✅ What Happens After Reboot

1. **System boots**
2. **rpi_wifi_auto.py starts** automatically
3. **Checks for WiFi config**
4. **No config?** → Creates hotspot "RaspberryPi-Config"
5. **You connect** via phone/laptop
6. **Configure WiFi** at http://192.168.4.1
7. **System connects** to your WiFi
8. **Launches rpi4_main.py** automatically!
9. **Monitors WiFi** every 2 seconds
10. **If WiFi drops** → Hotspot appears automatically!

---

## 🎊 Integration with Your Code

### **Your `rpi4_main.py` stays EXACTLY the same!**

No changes needed! The WiFi manager:
- ✅ Ensures WiFi is connected first
- ✅ Launches your program automatically
- ✅ Monitors WiFi in background
- ✅ Restarts setup if WiFi fails

### **Your Program Flow:**
```
rpi4_main.py starts
    ↓
Waits for backend MQTT
    ↓
Receives sys_id
    ↓
Starts ultrasonic sensor
    ↓
Starts camera
    ↓
Runs normally!
```

If WiFi disconnects:
```
rpi_wifi_auto.py detects disconnect (within 2 seconds!)
    ↓
Stops rpi4_main.py gracefully
    ↓
Starts hotspot
    ↓
User reconnects via web
    ↓
Launches rpi4_main.py again!
```

---

## 🔍 Monitoring

```bash
# View live logs
sudo journalctl -u rpi-wifi-auto -f

# Check service status
sudo systemctl status rpi-wifi-auto

# Check WiFi
iwconfig wlan0

# Restart service
sudo systemctl restart rpi-wifi-auto
```

---

## 🧪 Testing

### **Test 1: First Boot (No WiFi)**
```bash
# Remove config
sudo rm /opt/artful-accessibility/config/wifi_config.json

# Restart
sudo systemctl restart rpi-wifi-auto

# Look for hotspot!
```

### **Test 2: WiFi Disconnect Recovery**
```bash
# Disconnect WiFi while system running
sudo nmcli device disconnect wlan0

# Within 2 seconds, hotspot should appear!
```

---

## 📊 Key Features

✅ **Simple** - One file, easy to understand
✅ **Automatic** - Works on boot, no manual intervention
✅ **Self-healing** - Auto-recovery on WiFi disconnect
✅ **Real testing** - Verifies WiFi actually works before saving
✅ **Fast response** - 2-second detection of disconnect
✅ **Web interface** - Beautiful, mobile-friendly
✅ **Launches your program** - Starts rpi4_main.py automatically
✅ **Like M5Stack** - Same structure and logic you know

---

## 🎯 File Structure

```
/opt/artful-accessibility/
├── rpi_wifi_auto.py      ← WiFi manager (this runs on boot)
├── rpi4_main.py          ← Your program (launched automatically)
├── sensor_logic.py       ← Your sensor code
├── camera.py             ← Your camera code
├── system_data.json      ← Your data
└── config/
    └── wifi_config.json  ← WiFi credentials
```

---

## 🔧 Customization

### **Change Hotspot Name/Password:**

Edit `/etc/hostapd/hostapd.conf`:
```ini
ssid=RaspberryPi-Config    # Change this
wpa_passphrase=12345678     # Change this
```

### **Change Main Program Path:**

Edit `rpi_wifi_auto.py`, line 29:
```python
MAIN_PROGRAM_PATH = "/opt/artful-accessibility/rpi4_main.py"
```

### **Change Check Interval:**

Edit `rpi_wifi_auto.py`, line 32:
```python
CHECK_INTERVAL = 2  # Seconds
```

---

## 🎉 That's It!

Simple, clean, and works just like your M5Stack!

**One file, one service, automatic operation!** 🍓

