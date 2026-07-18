# Test file to debug REAL web interface credential saving
# This will actually start a web server and receive credentials from web form

import json
import time
import network
import socket
import _thread

# Web server variables
HOTSPOT_SSID = "M5Stack-Test"
HOTSPOT_PASSWORD = "12345678"
HOTSPOT_IP = "192.168.4.1"
HOTSPOT_PORT = 80
hotspot_active = False
received_credentials = None

def start_test_hotspot():
    """Start a test hotspot for web interface"""
    global hotspot_active
    try:
        print("🔧 Starting test hotspot: " + HOTSPOT_SSID)
        
        import network
        ap = network.WLAN(network.AP_IF)
        ap.active(True)
        ap.config(essid=HOTSPOT_SSID, password=HOTSPOT_PASSWORD, authmode=3)
        
        # Wait for AP to start
        time.sleep(3)
        
        # Set IP manually if needed
        ap_config = ap.ifconfig()
        if ap_config[0] == '0.0.0.0':
            ap.ifconfig(('192.168.4.1', '255.255.255.0', '192.168.4.1', '192.168.4.1'))
        
        print("✅ Test hotspot active: " + HOTSPOT_SSID)
        print("📡 IP: " + HOTSPOT_IP)
        print("🔑 Password: " + HOTSPOT_PASSWORD)
        print("🌐 Connect and go to: http://192.168.4.1")
        
        hotspot_active = True
        return True
    except Exception as e:
        print("❌ Hotspot error: " + str(e))
        return False

def web_server_thread():
    """Web server to receive credentials from real web form"""
    global received_credentials
    try:
        print("🌐 Starting web server on " + HOTSPOT_IP + ":" + str(HOTSPOT_PORT))
        
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind((HOTSPOT_IP, HOTSPOT_PORT))
        s.listen(1)
        s.settimeout(1)
        
        print("✅ Web server started")
        
        while hotspot_active:
            try:
                conn, addr = s.accept()
                conn.settimeout(5)
                
                print("📱 Client connected: " + str(addr))
                
                # Receive request
                request = conn.recv(1024).decode('utf-8')
                print("📨 Request received: " + request.split('\n')[0])
                
                if "POST /configure" in request:
                    # Parse credentials from POST data
                    print("📝 Processing web form submission...")
                    
                    # Debug: Print the full request to see what we're getting
                    print("🔍 Full POST request:")
                    print("=" * 40)
                    print(request)
                    print("=" * 40)
                    
                    # Initialize variables
                    ssid = ""
                    password = ""
                    
                    # Extract credentials from POST data
                    if "wifi_ssid=" in request and "wifi_password=" in request:
                        print("✅ Found wifi_ssid and wifi_password in request")
                        
                        # Try different parsing methods
                        # Method 1: Look for form data in the body
                        if "\r\n\r\n" in request:
                            body = request.split("\r\n\r\n")[1]
                            print("🔍 POST body: " + body)
                            
                            # Parse form data
                            if "wifi_ssid=" in body:
                                ssid_part = body.split("wifi_ssid=")[1].split("&")[0]
                                ssid = ssid_part.replace("+", " ").replace("%20", " ")
                                print("🔍 Extracted SSID: '" + ssid + "'")
                            
                            if "wifi_password=" in body:
                                password_part = body.split("wifi_password=")[1].split("&")[0]
                                password = password_part.replace("+", " ").replace("%20", " ")
                                print("🔍 Extracted password length: " + str(len(password)))
                        
                        # Method 2: Try parsing from headers (fallback)
                        if not ssid or not password:
                            print("🔄 Trying header parsing method...")
                            lines = request.split('\n')
                            for line in lines:
                                if "wifi_ssid=" in line:
                                    ssid_part = line.split("wifi_ssid=")[1].split("&")[0]
                                    ssid = ssid_part.replace("+", " ").replace("%20", " ")
                                    print("🔍 Header SSID: '" + ssid + "'")
                                elif "wifi_password=" in line:
                                    password_part = line.split("wifi_password=")[1].split("&")[0]
                                    password = password_part.replace("+", " ").replace("%20", " ")
                                    print("🔍 Header password length: " + str(len(password)))
                        
                        if ssid and password:
                            print("📝 Received from web: SSID='" + ssid + "', Password length=" + str(len(password)))
                            
                            # Store credentials for testing
                            received_credentials = {'ssid': ssid, 'password': password}
                            
                            # Send response
                            response = "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n"
                            response += "<html><body><h1>Credentials Received!</h1>"
                            response += "<p>SSID: " + ssid + "</p>"
                            response += "<p>Password length: " + str(len(password)) + "</p>"
                            response += "<p>Now testing connection...</p></body></html>"
                            
                            conn.send(response.encode('utf-8'))
                            conn.close()
                            
                            print("✅ Web credentials received and stored!")
                            break
                        else:
                            print("❌ Empty credentials received after parsing")
                            print("🔍 Final SSID: '" + ssid + "'")
                            print("🔍 Final password length: " + str(len(password)))
                    else:
                        print("❌ No credentials found in POST data")
                        print("🔍 Looking for 'wifi_ssid=' in request: " + str("wifi_ssid=" in request))
                        print("🔍 Looking for 'wifi_password=' in request: " + str("wifi_password=" in request))
                else:
                    # Send config page
                    send_config_page(conn)
                    conn.close()
                    
            except Exception as e:
                if "ETIMEDOUT" not in str(e):
                    print("❌ Web server error: " + str(e))
                continue
        
        s.close()
        print("🌐 Web server stopped")
        
    except Exception as e:
        print("❌ Web server thread error: " + str(e))

def send_config_page(conn):
    """Send the web configuration page"""
    html = """HTTP/1.1 200 OK
Content-Type: text/html

<!DOCTYPE html>
<html>
<head>
    <title>M5Stack Test - WiFi Configuration</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f0f0f0; }
        .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        h2 { color: #333; text-align: center; }
        input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; }
        button { width: 100%; padding: 15px; background: #007bff; color: white; border: none; border-radius: 5px; font-size: 16px; }
        button:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <h2>🧪 M5Stack Test - WiFi Setup</h2>
        <p>This is a test to debug web interface credential saving.</p>
        <form method="POST" action="/configure">
            <label>WiFi Name (SSID):</label>
            <input type="text" name="wifi_ssid" placeholder="Enter your WiFi name" required>
            
            <label>WiFi Password:</label>
            <input type="password" name="wifi_password" placeholder="Enter your WiFi password" required>
            
            <button type="submit">🔗 Test Connection</button>
        </form>
    </div>
</body></html>"""
    conn.send(html.encode('utf-8'))

def test_web_credentials():
    """Test credentials received from REAL web interface"""
    print("🧪 Testing REAL Web Interface Credential Saving")
    print("=" * 50)
    
    # Start hotspot
    if not start_test_hotspot():
        print("❌ Failed to start test hotspot")
        return False
    
    # Start web server
    try:
        _thread.start_new_thread(web_server_thread, ())
    except Exception as e:
        print("❌ Failed to start web server: " + str(e))
        return False
    
    # Wait for credentials from web
    print("⏳ Waiting for credentials from web interface...")
    print("📱 Connect to WiFi: " + HOTSPOT_SSID + " (Password: " + HOTSPOT_PASSWORD + ")")
    print("🌐 Go to: http://192.168.4.1")
    
    timeout = 60  # 1 minute timeout
    while received_credentials is None and timeout > 0:
        time.sleep(1)
        timeout -= 1
        if timeout % 10 == 0:
            print("⏳ Still waiting... (" + str(timeout) + "s left)")
    
    if received_credentials is None:
        print("❌ Timeout waiting for web credentials")
        return False
    
    # Test the received credentials
    ssid = received_credentials['ssid']
    password = received_credentials['password']
    
    print("\n📝 Testing with web-received credentials:")
    print("📝 SSID: '" + ssid + "'")
    print("📝 Password length: " + str(len(password)))
    
    # Test 1: Save credentials like web interface
    print("\n🔧 Test 1: Saving credentials like web interface...")
    try:
        config = {'ssid': ssid, 'password': password}
        with open("wifi_config.json", 'w') as f:
            f.write(json.dumps(config))
        print("✅ Credentials saved successfully")
    except Exception as e:
        print("❌ Error saving credentials: " + str(e))
        return False
    
    # Test 2: Load credentials back
    print("\n🔧 Test 2: Loading saved credentials...")
    try:
        with open("wifi_config.json", 'r') as f:
            loaded_config = json.loads(f.read())
        loaded_ssid = loaded_config['ssid']
        loaded_password = loaded_config['password']
        print("✅ Loaded SSID: '" + loaded_ssid + "'")
        print("✅ Loaded password length: " + str(len(loaded_password)))
        
        # Check if they match
        if loaded_ssid == ssid and loaded_password == password:
            print("✅ Credentials match perfectly!")
        else:
            print("❌ Credentials don't match!")
            print("Original SSID: '" + ssid + "' vs Loaded: '" + loaded_ssid + "'")
            print("Original password length: " + str(len(password)) + " vs Loaded: " + str(len(loaded_password)))
            return False
    except Exception as e:
        print("❌ Error loading credentials: " + str(e))
        return False
    
    # Test 3: Try WiFi connection with loaded credentials
    print("\n🔧 Test 3: Testing WiFi connection with loaded credentials...")
    try:
        sta_if = network.WLAN(network.STA_IF)
        
        # Activate WiFi
        if not sta_if.active():
            print("📡 Activating WiFi...")
            sta_if.active(True)
            time.sleep(2)
        
        # Disconnect if connected
        if sta_if.isconnected():
            print("📡 Disconnecting from existing WiFi...")
            sta_if.disconnect()
            time.sleep(2)
        
        # Connect with loaded credentials
        print("🔗 Connecting with loaded credentials...")
        sta_if.connect(loaded_ssid, loaded_password)
        
        # Wait for connection
        max_wait = 15
        while not sta_if.isconnected() and max_wait > 0:
            time.sleep(1)
            max_wait -= 1
            print("⏳ Waiting... (" + str(max_wait) + "s left)")
            
            try:
                status = sta_if.status()
                print("📊 Status: " + str(status))
            except:
                print("📊 Status: unknown")
        
        if sta_if.isconnected():
            print("✅ WiFi connected successfully with loaded credentials!")
            print("📡 IP: " + sta_if.ifconfig()[0])
            return True
        else:
            print("❌ WiFi connection failed with loaded credentials!")
            return False
            
    except Exception as e:
        print("❌ WiFi connection error: " + str(e))
        return False

def test_hotspot_transition():
    """Test the hotspot to WiFi transition process"""
    print("\n🧪 Testing Hotspot to WiFi Transition")
    print("=" * 50)
    
    # Simulate hotspot being active
    print("🔧 Simulating hotspot active state...")
    
    # Test stopping hotspot (simulate)
    print("🔄 Stopping hotspot...")
    time.sleep(2)
    
    # Test WiFi interface reset
    print("🔄 Resetting WiFi interface...")
    try:
        sta_if = network.WLAN(network.STA_IF)
        sta_if.active(False)
        time.sleep(2)
        sta_if.active(True)
        time.sleep(2)
        print("✅ WiFi interface reset complete")
    except Exception as e:
        print("❌ WiFi reset error: " + str(e))
        return False
    
    # Test connection after reset
    print("🔧 Testing connection after hotspot reset...")
    return test_credential_saving()

if __name__ == "__main__":
    print("🚀 M5Stack REAL Web Interface Test")
    print("This will test credentials received from actual web form")
    print()
    
    # Test with real web interface
    if test_web_credentials():
        print("\n✅ REAL web interface test PASSED!")
        print("🎉 Web credentials work perfectly!")
    else:
        print("\n❌ REAL web interface test FAILED!")
        print("🔍 Check the detailed output above for issues")
    
    print("\n🎯 Real web test complete!")
