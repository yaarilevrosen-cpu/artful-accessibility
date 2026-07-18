# Simple WiFi test for M5Stack
# Upload this file and run it to test WiFi connection

import network
import time

def test_wifi_connection():
    print("🔧 M5Stack WiFi Test")
    print("=" * 30)
    
    # Get WiFi credentials
    ssid = input("Enter WiFi SSID: ")
    password = input("Enter WiFi Password: ")
    
    print("\n🔄 Testing WiFi connection...")
    
    # Initialize WiFi
    sta_if = network.WLAN(network.STA_IF)
    
    # Activate WiFi
    if not sta_if.active():
        print("📡 Activating WiFi...")
        sta_if.active(True)
        time.sleep(2)
    
    # Disconnect if already connected
    if sta_if.isconnected():
        print("📡 Disconnecting from existing WiFi...")
        sta_if.disconnect()
        time.sleep(2)
    
    # Connect
    print("🔗 Connecting to WiFi...")
    sta_if.connect(ssid, password)
    
    # Wait for connection
    max_wait = 15
    while not sta_if.isconnected() and max_wait > 0:
        time.sleep(1)
        max_wait -= 1
        print("⏳ Waiting... (" + str(max_wait) + "s left)")
        
        try:
            status = sta_if.status()
            print("📊 Status:", status)
        except:
            print("📊 Status: unknown")
    
    if sta_if.isconnected():
        print("✅ WiFi connected successfully!")
        print("📡 IP:", sta_if.ifconfig()[0])
        return True
    else:
        print("❌ WiFi connection failed!")
        return False

if __name__ == "__main__":
    test_wifi_connection()
