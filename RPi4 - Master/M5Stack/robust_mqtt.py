from m5stack import *
from m5stack_ui import *
from uiflow import *
import module, json, time
from umqtt.simple import MQTTClient
import wifiCfg
import network
import socket
import _thread

# Clean up any previous session to prevent memory conflicts
try:
    print("🧹 Cleaning up previous session...")
    # Try to disconnect any existing MQTT connections
    try:
        if 'mqtt' in dir():
            mqtt.disconnect()
    except:
        pass
    # Small delay to let cleanup complete
    time.sleep(0.5)
except:
    pass

# --- WiFi Hotspot Configuration ---
HOTSPOT_SSID = "M5Stack-Config"
HOTSPOT_PASSWORD = "12345678"
HOTSPOT_IP = "192.168.4.1"
HOTSPOT_PORT = 80

# WiFi credentials storage
saved_ssid = None
saved_password = None
wifi_connected = False
hotspot_active = False
setup_skipped = False  # Flag to prevent re-entering setup mode after skip

# MQTT connection tracking
mqtt_connected = False
mqtt = None  # MQTT client instance

# Button press tracking for long press detection
button_c_press_time = 0
button_c_long_press_threshold = 2000  # 2 seconds
button_a_press_time = 0
button_a_long_press_threshold = 3000  # 3 seconds for restart
button_b_press_time = 0  # Button B for manual up command
button_b_long_press_threshold = 3000  # 3 seconds for showing instructions screen

# WiFi readiness tracking
wifi_ready_logged = False  # Flag to only log readiness once

# Instructions display tracking
instructions_shown = False  # Flag to only show instructions once on boot

# Base motor speed (gentle museum profile)
BASE_SPEED = 12

# Keeps track of whether WiFi is on or off
wifi_on = False

# Keep instruction screen shown for 2 min after Long B is pressed
keep_instruction_screen_shown = False

def load_wifi_credentials():
    """Load saved WiFi credentials"""
    global saved_ssid, saved_password
    try:
        with open("wifi_config.json", 'r') as f:
            config = json.loads(f.read())
            saved_ssid = config['ssid']
            saved_password = config['password']
            print("✅ Loaded saved WiFi:", saved_ssid)
            return True
    except Exception as e:
        print("❌ No saved WiFi credentials:", e)
        return False

def save_wifi_credentials(ssid, password):
    """Save WiFi credentials and update M5Stack configuration"""
    global saved_ssid, saved_password
    try:
        # Save to our file
        config = {'ssid': ssid, 'password': password}
        with open("wifi_config.json", 'w') as f:
            f.write(json.dumps(config))
        saved_ssid = ssid
        saved_password = password
        
        # Also try to connect using network module
        print("🔧 Attempting to connect to WiFi...")
        # Show connecting status
        update_wifi_status("Connecting")  # Now safe with label4 check
        try:
            sta_if = network.WLAN(network.STA_IF)
            sta_if.active(True)
            sta_if.connect(ssid, password)
            print("✅ WiFi connection initiated:", ssid)
        except Exception as wifi_error:
            print("⚠️ Could not initiate WiFi connection:", wifi_error)
        
        print("✅ Saved WiFi credentials:", ssid)
        return True
    except Exception as e:
        print("❌ Error saving credentials:", e)
        return False
    
def clear_wifi_credentials():
    """Clear saved WiFi credentials"""
    global saved_ssid, saved_password
    try:
        import uos
        # Try to remove from multiple possible locations
        file_paths = ["wifi_config.json", "/flash/wifi_config.json", "/wifi_config.json"]
        removed_count = 0
        
        for file_path in file_paths:
            try:
                uos.remove(file_path)
                print("✅ Removed:", file_path)
                removed_count += 1
            except:
                pass  # File doesn't exist, that's fine
        
        saved_ssid = None
        saved_password = None
        
        if removed_count > 0:
            print("✅ Cleared WiFi credentials from " + str(removed_count) + " locations")
        else:
            print("ℹ️ No WiFi credentials found to clear")
        
        return True
    except Exception as e:
        print("❌ Error clearing credentials:", e)
        return False

def create_main_labels():
    """Create the main MQTT system labels (always visible)"""
    global label0, label1, label2, label3, label4, label_speed, label_base_speed, button_a_label, button_b_label, button_c_label
    
    try:
        # Create main system labels
        label0 = M5Label('MQTT Real', x=15, y=40, color=0x000, font=FONT_MONT_30)
        label1 = M5Label('Status', x=15, y=70, color=0x000, font=FONT_MONT_30)
        label2 = M5Label('Motor', x=15, y=100, color=0x000, font=FONT_MONT_30)
        label3 = M5Label('Commands', x=15, y=130, color=0x666, font=FONT_MONT_30)
        label4 = M5Label('WiFi: ?', x=130, y=10, color=0x666, font=FONT_MONT_18)
        button_a_label = M5Label("A", x=58, y=210, color=0x000, font=FONT_MONT_18)
        button_b_label = M5Label("B", x=151, y=210, color=0x000, font=FONT_MONT_18)
        button_c_label = M5Label("C", x=243, y=210, color=0x000, font=FONT_MONT_18)
        # Display current motor speed under the adjustment line
        label_speed = M5Label('Speed: ', x=15, y=160, color=0x666, font=FONT_MONT_30)
        label_base_speed = M5Label('B-Speed: ' + str(BASE_SPEED), x=10, y=10, color=0x666, font=FONT_MONT_18)

        print("✅ Main labels created successfully")
        return True
    except Exception as e:
        print("❌ Error creating main labels:", e)
        return False

def update_wifi_status(status="?", ssid=""):
    """Update WiFi status - show on M5Stack display using label4 like other labels"""
    global label4
    try:
        # Use set_text() method like other labels do
        if status == "Connected":
            if ssid:
                label4.set_text('WiFi: ' + ssid[:8])  # Show first 8 chars of SSID
                print("✅ WiFi connected:", ssid[:8])
            else:
                label4.set_text('WiFi: Connected')
                print("✅ WiFi connected")
        elif status == "Failed":
            label4.set_text("WiFi: Failed")
            print("❌ WiFi connection failed")
        elif status == "Connecting":
            label4.set_text("WiFi: Connecting...")
            print("🔄 WiFi connecting...")
        else:
            label4.set_text('WiFi: ?')
            print("❓ WiFi status unknown")
        
        return True
    except Exception as e:
        print("❌ Error updating WiFi status:", e)
        return False

def restart_m5stack():
    """Restart the M5Stack"""
    try:
        print("🔄 Restarting M5Stack in 3 seconds...")
        print("💡 This will apply the new WiFi configuration")
        label0.set_text("Restarting...")
        label1.set_text("3 seconds...")
        time.sleep(3)
        print("🔄 Executing restart...")
        import machine
        machine.reset()
    except Exception as e:
        print("❌ Restart error:", e)
        # Fallback restart method
        try:
            print("🔄 Trying fallback restart...")
            import uos
            uos.dupterm(None, 1)
            time.sleep(1)
            machine.reset()
        except Exception as fallback_error:
            print("❌ Fallback restart failed:", fallback_error)

def check_wifi_status():
    """Check current WiFi connection status - only update if status actually changed"""
    global wifi_connected
    try:
        import network
        sta_if = network.WLAN(network.STA_IF)
        current_status = sta_if.isconnected()
        
        # Only update wifi_connected if status actually changed
        if current_status and not wifi_connected:
            print("✅ WiFi reconnected!")
            wifi_connected = True
        elif not current_status and wifi_connected:
            # Add a small delay to avoid false disconnections
            time.sleep(0.5)
            if not sta_if.isconnected():  # Double-check after delay
                print("❌ WiFi disconnected!")
                wifi_connected = False
        
        return current_status
    except Exception as e:
        print("❌ WiFi status check error:", e)
        # Don't automatically set wifi_connected = False on error
        return wifi_connected

def show_instructions_screen():
    """Show instructions screen after WiFi connection"""
    global keep_instruction_screen_shown
    try:
        print("🎉 System initialized! Starting main loop...")
        print("🎮 Button controls:")
        print("   A = Manual move down")
        print("   B = Manual move up")
        print("   C = Stop motor")
        print("   Long press A = Restart M5Stack")
        print("   Long press B = Show Instructions")
        print("   Long press C = WiFi setup (web interface)")
        
        # Clear screen and show instructions
        screen.set_screen_bg_color(0xFFFFFF)
        
        # Instructions text (smaller font for better fit)
        # Clear main labels and create new ones with smaller font
        label0.set_text("")
        label1.set_text("")
        label2.set_text("")
        label3.set_text("")
        # We don't clear label4 (WiFi indicator)
        if 'label_speed' in globals() and label_speed:
            label_speed.set_text("")
        # Also clear setup hint labels if they exist
        if 'label5' in globals() and label5:
            label5.set_text("")
        if 'label6' in globals() and label6:
            label6.set_text("")
        if 'label7' in globals() and label7:
            label7.set_text("")
            
        # Create instruction labels with smaller font (use unique local names)
        instr_ready = M5Label("System Ready", x=15, y=40, color=0x000, font=FONT_MONT_18)
        instr_a = M5Label("A = Move Down", x=15, y=65, color=0x000, font=FONT_MONT_18)
        instr_b = M5Label("B = Move Up", x=15, y=85, color=0x000, font=FONT_MONT_18)
        instr_c = M5Label("C = Stop Motor", x=15, y=105, color=0x000, font=FONT_MONT_18)
        # Long press instructions
        instr_long_a = M5Label("Long A = Restart", x=15, y=125, color=0x666, font=FONT_MONT_18)
        instr_long_b = M5Label("Long B = Show Instructions", x=15, y=145, color=0x666, font=FONT_MONT_18)
        instr_long_c = M5Label("Long C = WiFi Setup", x=15, y=165, color=0x666, font=FONT_MONT_18)
        # Continue hint
        instr_continue = M5Label("Press any button to continue", x=40, y=185, color=0x666, font=FONT_MONT_18)

        # Wait for any button press or 20 seconds timeout
        start_time = time.ticks_ms()
        if keep_instruction_screen_shown == True:
            print("⏰ Setting timeout to 2 minutes because long press b was pressed")
            timeout_duration = 120000 # 2 minutes because long press b was pressed
        else:
            print("⏰ Setting timeout to normal 20 seconds")
            timeout_duration = 20000 # 20 seconds
        
        while True:
            # Check for button press
            if btnA.wasPressed() or btnB.wasPressed() or btnC.wasPressed():
                break
            
            # Check for timeout (20 seconds)
            if (time.ticks_ms() - start_time) > timeout_duration:
                print("⏰ Instructions timeout - continuing automatically")
                break
            
            wait_ms(50)
        
        # Clean up temporary labels and restore main screen
        instr_ready.set_text("")
        instr_a.set_text("")
        instr_b.set_text("")
        instr_c.set_text("")
        instr_continue.set_text("")
        instr_long_a.set_text("")
        instr_long_b.set_text("")
        instr_long_c.set_text("")

        # Restore main labels
        label0.set_text('MQTT Real')
        label1.set_text('Status')
        label2.set_text('Motor')
        label3.set_text('Commands')
        
        print("✅ Instructions completed, starting main program...")
        
        # Reset the keep_instruction_screen_shown flag
        keep_instruction_screen_shown = False
        
    except Exception as e:
        print("❌ Instructions screen error:", e)
        # Restore main labels on error
        label0.set_text('MQTT Real')
        label1.set_text('Status')
        label2.set_text('Motor')
        label3.set_text('Commands')

def connect_to_wifi(ssid, password, max_retries=2):
    """Connect to WiFi with built-in retry and interface reset (unified path)."""
    global wifi_connected
    try:
        import network
        
        for attempt in range(max_retries):
            print("🔄 WiFi connection attempt " + str(attempt + 1) + "/" + str(max_retries))
            print("🔌 Connecting to WiFi...")
            print("📡 SSID:", ssid)
            print("🔑 Password length:", len(password))
            
            # Show WiFi connection status on display
            update_wifi_status("Connecting")  # Now safe with simplified function
            
            sta_if = network.WLAN(network.STA_IF)
            
            # On first attempt, reset interface
            if attempt == 0:
                try:
                    print("🔄 Resetting WiFi interface...")
                    sta_if.active(False)
                    time.sleep(2)
                    sta_if.active(True)
                    time.sleep(2)
                    print("✅ WiFi interface reset complete")
                except Exception as re:
                    print("⚠️ WiFi reset warning:", re)
            else:
                # Ensure interface active on subsequent attempts
                if not sta_if.active():
                    sta_if.active(True)
                    time.sleep(1)
            
            # Stop hotspot if it's running (can't connect to WiFi while hotspot is active)
            # if hotspot_active:
            #     print("🔄 Stopping hotspot before WiFi connection...")
            #     stop_hotspot()
            #     time.sleep(3)
            
            # Disconnect if already connected
            if sta_if.isconnected():
                print("📡 Disconnecting from existing WiFi...")
                try:
                    sta_if.disconnect()
                except:
                    pass
                time.sleep(2)
            
            # Ensure STA is active
            if not sta_if.active():
                print("📡 Activating WiFi...")
                sta_if.active(True)
                time.sleep(2)
            
            # Connect
            print("🔗 Connecting to WiFi...")
            try:
                sta_if.connect(ssid, password)
            except Exception as ce:
                print("⚠️ Connect call failed:", ce)
            
            # Debug before waiting
            debug_wifi_status()
            
            # Wait for connection
            max_wait = 12
            while not sta_if.isconnected() and max_wait > 0:
                time.sleep(1)
                max_wait -= 1
                print("⏳ Waiting... (" + str(max_wait) + "s left)")
                try:
                    print("📊 Status:", sta_if.status())
                except:
                    print("📊 Status: unknown")
            
            if sta_if.isconnected():
                print("✅ WiFi connected successfully!")
                print("📡 IP:", sta_if.ifconfig()[0])
                
                # Extra DHCP wait: association may be up but IP still 0.0.0.0
                dhcp_wait = 12
                while sta_if.ifconfig()[0] == "0.0.0.0" and dhcp_wait > 0:
                    print("⏳ Waiting for DHCP... (" + str(dhcp_wait) + "s left)")
                    time.sleep(1)
                    dhcp_wait -= 1
                
                print("📡 IP after DHCP:", sta_if.ifconfig()[0])
                # Update WiFi status label by recreating it
                update_wifi_status("Connected", ssid)
                # Strict readiness check - only proceed if truly ready
                if is_wifi_ready():
                    wifi_connected = True
                    print("✅ WiFi is fully ready - proceeding")
                    return True
                else:
                    print("❌ WiFi connected but not ready - treating as failure")
                    # Disconnect and reset for retry
                    try:
                        sta_if.disconnect()
                        sta_if.active(False)
                        time.sleep(1)
                        sta_if.active(True)
                        time.sleep(1)
                    except:
                        pass
                    wifi_connected = False
            else:
                print("❌ WiFi connection failed on attempt", attempt + 1)
                wifi_connected = False
                # Update WiFi status label by recreating it
                update_wifi_status("Failed")
                if attempt < max_retries - 1:
                    print("⏳ Waiting 3 seconds before retry...")
                    time.sleep(3)
                    print("🔁 Proceeding to next retry attempt")
        
        print("❌ All WiFi connection attempts failed")
        return False
    except Exception as e:
        print("❌ WiFi connection error:", e)
        wifi_connected = False
        return False

def start_hotspot():
    """Start WiFi hotspot for configuration"""
    global hotspot_active
    try:
        print("🔧 Starting WiFi hotspot:", HOTSPOT_SSID)
        
        # Reset WiFi interface first (like turning WiFi off/on on phone)
        if not wifi_on:
            reset_wifi_interface()
        
        # Create Access Point interface
        ap_if = network.WLAN(network.AP_IF)
        ap_if.active(True)
        
        # Configure the Access Point with password and WPA2 security
        ap_if.config(essid=HOTSPOT_SSID, password=HOTSPOT_PASSWORD, authmode=3)
        
        # Set IP configuration
        ap_if.ifconfig((HOTSPOT_IP, '255.255.255.0', HOTSPOT_IP, HOTSPOT_IP))
        
        # Wait for AP to start
        time.sleep(3)
        
        if ap_if.active():
            hotspot_active = True
            print("✅ Hotspot active:", HOTSPOT_SSID)
            print("📡 IP:", HOTSPOT_IP)
            print("🔑 Password:", HOTSPOT_PASSWORD)
            return True
        else:
            print("❌ Failed to start hotspot")
            return False
    except Exception as e:
        print("❌ Hotspot error:", e)
        return False

def stop_hotspot():
    """Stop WiFi hotspot"""
    global hotspot_active
    try:
        ap_if = network.WLAN(network.AP_IF)
        ap_if.active(False)
        hotspot_active = False
        print("✅ Hotspot stopped")
    except Exception as e:
        print("❌ Error stopping hotspot:", e)

def web_server_thread():
    """Run web server in separate thread"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind(('0.0.0.0', HOTSPOT_PORT))
        s.listen(1)
        print("🌐 Web server started on", HOTSPOT_IP + ":" + str(HOTSPOT_PORT))
        
        while hotspot_active:
            try:
                # Set socket to non-blocking with timeout for button checking
                s.settimeout(0.1)  # 100ms timeout
                conn, addr = s.accept()
                print("📱 Client connected:", addr)
                
                request = conn.recv(1024).decode('utf-8')
                print("📨 Request:", request[:100] + "...")
                
                if 'GET /' in request:
                    send_web_page(conn)
                elif 'POST /configure' in request:
                    handle_wifi_configuration(conn, request)
                else:
                    send_404(conn)
                
                conn.close()
                
            except OSError as e:
                # Timeout or no connection - check buttons
                if e.args[0] == 110:  # ETIMEDOUT
                    check_setup_buttons()
                    continue
                else:
                    print("❌ Socket error:", e)
            except Exception as e:
                print("❌ Server error:", e)
                if 'conn' in locals():
                    conn.close()
    except Exception as e:
        print("❌ Server setup error:", e)
    finally:
        s.close()

def send_web_page(conn):
    """Send configuration web page"""
    html = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>M5Stack WiFi Configuration</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; background: #f0f0f0; }
                .container { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #333; text-align: center; margin-bottom: 30px; }
                .form-group { margin-bottom: 20px; }
                label { display: block; margin-bottom: 5px; font-weight: bold; color: #555; }
                input[type="text"], input[type="password"] { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 5px; font-size: 16px; box-sizing: border-box; }

                /* Updated password section - button below input */
                .password-container { display: flex; flex-direction: column; width: 100%; }
                .password-container input[type="password"], .password-container input[type="text"] {
                    border-radius: 5px;
                    border: 2px solid #ddd;
                }
                .password-container button {
                    margin-top: 8px;
                    background: #f8f9fa;
                    border: 2px solid #ddd;
                    padding: 8px 12px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #666;
                    border-radius: 5px;
                    align-self: center;
                    width: 50%;
                    transition: background 0.2s, color 0.2s;
                }
                .password-container button:hover { background: #007bff; color: #fff; }

                input:focus { border-color: #007bff; outline: none; }
                button { width: 100%; padding: 15px; background: #007bff; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; margin-top: 10px; }
                button:hover { background: #0056b3; }
                .status { margin-top: 20px; padding: 10px; border-radius: 5px; text-align: center; display: none; }
                .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
                .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
                .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>M5Stack WiFi Setup</h1>
                <form id="wifiForm">
                    <div class="form-group">
                        <label for="ssid">WiFi Network Name (SSID):</label>
                        <input type="text" id="wifi_ssid" name="wifi_ssid" required placeholder="Enter WiFi name">
                    </div>
                    <div class="form-group">
                        <label for="password">WiFi Password:</label>
                        <div class="password-container">
                            <input type="password" id="wifi_password" name="wifi_password" required placeholder="Enter WiFi password">
                            <button type="button" id="togglePassword">Show</button>
                        </div>
                    </div>
                    <button type="submit">Connect to WiFi</button>
                </form>
                <div id="status" class="status"></div>
                <div class="info" style="margin-top: 20px; padding: 15px; border-radius: 5px;">
                    <strong>Instructions:</strong><br>
                    1. Enter your WiFi network name and password<br>
                    2. Click "Connect to WiFi"<br>
                    3. M5Stack will save the settings<br>
                    4. M5Stack will connect to WiFi after 10-15 seconds
                    <br><strong>Note:</strong><br>
                    1. If you are connected to WiFi, you can skip the setup by long pressing Button C (3 seconds)<br>
                    2. If you want to restart the M5Stack, you can long press Button A (3 seconds)<br>
                    3. If Credentials are not sending, please check your WiFi connection to the M5Stack and try again<br>
                    4. Connect to SSID: M5Stack-Config and Password: 12345678<br>
                </div>
            </div>
            <script>
                // Password visibility toggle
                document.getElementById('togglePassword').addEventListener('click', function() {
                    const passwordInput = document.getElementById('wifi_password');
                    const toggleButton = document.getElementById('togglePassword');
                    
                    if (passwordInput.type === 'password') {
                        passwordInput.type = 'text';
                        toggleButton.textContent = 'Hide Password';
                    } else {
                        passwordInput.type = 'password';
                        toggleButton.textContent = 'Show Password';
                    }
                });
                
                document.getElementById('wifiForm').addEventListener('submit', function(e) {
                    e.preventDefault();
                    const ssid = document.getElementById('wifi_ssid').value;
                    const password = document.getElementById('wifi_password').value;
                    const status = document.getElementById('status');
                    
                    if (!ssid || !password) {
                        showStatus('Please enter both WiFi name and password', 'error');
                        return;
                    }
                    
                    showStatus('Connecting to WiFi...', 'info');
                    
                    fetch('/configure', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'wifi_ssid=' + encodeURIComponent(ssid) + '&wifi_password=' + encodeURIComponent(password)
                    })
                    .then(response => response.text())
                    .then(data => {
                        if (data.includes('SUCCESS')) {
                            showStatus('WiFi connected successfully! M5Stack is now online.', 'success');
                        } else {
                            showStatus('Connection failed. Please check your credentials.', 'error');
                        }
                    })
                    .catch(error => {
                        showStatus('Error: ' + error.message, 'error');
                    });
                });
                
                function showStatus(message, type) {
                    const status = document.getElementById('status');
                    status.textContent = message;
                    status.className = 'status ' + type;
                    status.style.display = 'block';
                }
            </script>
        </body>
        </html>
        """
    
    response = "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: " + str(len(html)) + "\r\n\r\n" + html
    conn.send(response.encode('utf-8'))

def handle_wifi_configuration(conn, request):
    """Handle WiFi configuration request - using WORKING logic from test"""
    try:
        print("📝 Processing web form submission...")
        
        # Debug: Print the full request to see what we're getting
        print("🔍 Full POST request:")
        print("=" * 40)
        print(request)
        print("=" * 40)
        
        # Initialize variables
        ssid = ""
        password = ""
        
        # Extract credentials from POST data using WORKING method from test
        if "wifi_ssid=" in request and "wifi_password=" in request:
            print("✅ Found wifi_ssid and wifi_password in request")
            
            # Method 1: Look for form data in the body (WORKING method from test)
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
                
                if save_wifi_credentials(ssid, password):
                    print("✅ WiFi credentials saved successfully!")
                    print("🔄 Attempting to connect to new WiFi with retry logic (same as boot)...")
                    if try_wifi_connection_with_retry(ssid, password, max_retries=2):
                        print("✅ Connected to new WiFi! Stopping hotspot... Sending success response...")
                        response = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nSUCCESS: WiFi connected and saved!"
                        conn.send(response.encode('utf-8'))
                        conn.close()  # Close connection before stopping hotspot
                        print("🔄 Stopping hotspot...")
                        time.sleep(2)
                        stop_hotspot()
                        return True
                    else:
                        print("❌ Failed to connect after retries. Keeping setup active for retry.")
                        response = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nERROR: Connection failed. Please check credentials and try again."
                        conn.send(response.encode('utf-8'))
                        conn.close()  # Close connection
                        return False
                else:
                    response = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nERROR: Failed to save credentials"
                    conn.send(response.encode('utf-8'))
                    return False
            else:
                print("❌ Empty credentials received after parsing")
                print("🔍 Final SSID: '" + ssid + "'")
                print("🔍 Final password length: " + str(len(password)))
                response = "HTTP/1.1 400 Bad Request\r\nContent-Type: text/plain\r\n\r\nERROR: Empty credentials received"
                conn.send(response.encode('utf-8'))
                return False
        else:
            print("❌ No credentials found in POST data")
            print("🔍 Looking for 'wifi_ssid=' in request: " + str("wifi_ssid=" in request))
            print("🔍 Looking for 'wifi_password=' in request: " + str("wifi_password=" in request))
            response = "HTTP/1.1 400 Bad Request\r\nContent-Type: text/plain\r\n\r\nERROR: Invalid form data"
            conn.send(response.encode('utf-8'))
            return False
    except Exception as e:
        print("❌ Configuration error:", e)
        response = "HTTP/1.1 500 Internal Server Error\r\nContent-Type: text/plain\r\n\r\nERROR: Server error"
        conn.send(response.encode('utf-8'))
        return False

def send_404(conn):
    """Send 404 error"""
    response = "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n404 Not Found"
    conn.send(response.encode('utf-8'))

def debug_wifi_status():
    """Debug WiFi interface status"""
    try:
        import network
        sta_if = network.WLAN(network.STA_IF)
        print("🔍 WiFi Debug Info:")
        print("📡 Active:", sta_if.active())
        print("📡 Connected:", sta_if.isconnected())
        if sta_if.isconnected():
            print("📡 IP:", sta_if.ifconfig()[0])
        print("📡 Status:", sta_if.status())
        return True
    except Exception as e:
        print("❌ WiFi debug error:", e)
        return False

def is_wifi_ready():
    """Strict WiFi readiness check - only return True when truly ready"""
    global wifi_ready_logged
    try:
        import network
        import socket
        sta_if = network.WLAN(network.STA_IF)
        
        # Check basic connection
        if not sta_if.active() or not sta_if.isconnected():
            wifi_ready_logged = False  # Reset flag when not ready
            return False
        
        # Check IP is valid (not 0.0.0.0)
        ip = sta_if.ifconfig()[0]
        if ip == "0.0.0.0":
            wifi_ready_logged = False  # Reset flag when not ready
            return False
        
        # # Test DNS resolution
        # try:
        #     socket.getaddrinfo("test.mosquitto.org", 1883)
        #     print("🔍 WiFi not ready: DNS resolution failed")
        #     return False
        # except:
        #     pass  # DNS test passed
        
        # Only log readiness once per connection
        if not wifi_ready_logged:
            print("✅ WiFi READY: Active=True, Connected=True, IP=" + ip + ", DNS=OK")
            wifi_ready_logged = True
        
        return True
    except Exception as e:
        print("❌ WiFi readiness check error:", e)
        wifi_ready_logged = False
        return False

def reset_wifi_interface():
    """Reset WiFi interface completely"""
    try:
        print("🔄 Resetting WiFi interface...")
        import network
        sta_if = network.WLAN(network.STA_IF)
        
        # Deactivate and reactivate WiFi
        sta_if.active(False)
        time.sleep(2)
        sta_if.active(True)
        time.sleep(2)
        
        print("✅ WiFi interface reset complete")
        debug_wifi_status()
        return True
    except Exception as e:
        print("❌ WiFi reset error:", e)
        return False

def try_wifi_connection_with_retry(ssid, password, max_retries=2):
    """Wrapper that delegates retries to connect_to_wifi to avoid double loops."""
    return connect_to_wifi(ssid, password, max_retries=max_retries)

def check_setup_buttons():
    """Check for button presses in setup mode"""
    global button_a_label, button_b_label, button_b_press_time, button_c_label, button_a_press_time, button_c_press_time
    global keep_instruction_screen_shown, hotspot_active, setup_skipped, mqtt
    # Check for button A press (restart)
    if btnA.isPressed() and button_a_press_time == 0:
        button_a_press_time = time.ticks_ms()
        print("🎮 Button A pressed in setup mode")
    
    # Check for button B press (show instructions)
    if btnB.isPressed() and button_b_press_time == 0:
        button_b_press_time = time.ticks_ms()
        print("🎮 Button B pressed in setup mode")
    
    # Check for button C press (skip setup)
    if btnC.isPressed() and button_c_press_time == 0:
        button_c_press_time = time.ticks_ms()
        print("🎮 Button C pressed in setup mode")
    
    # Check for long press on button A (restart)
    if button_a_press_time > 0:
        if (time.ticks_ms() - button_a_press_time) > button_a_long_press_threshold:
            button_a_press_time = 0  # Reset
            print("🎮 Button A long press in setup mode - Restarting M5Stack")
            label0.set_text("Restarting...")
            label1.set_text("3 seconds...")
            restart_m5stack()
        elif not btnA.isPressed():  # Button released before threshold
            button_a_press_time = 0  # Reset

    # Check for long press on button B (show instructions)
    if button_b_press_time > 0:
        if (time.ticks_ms() - button_b_press_time) > button_b_long_press_threshold:
            button_b_press_time = 0  # Reset
            print("🎮 Button B long press in setup mode - Showing instructions")
            # Note: MQTT is already disconnected at the start of wifi_setup_mode()
            label0.set_text("Skipping setup...")
            label1.set_text("Going to instructions...")
            setup_skipped = True  # Set flag to prevent re-entering setup
            hotspot_active = False
            keep_instruction_screen_shown = True
            # Clear all setup labels
            label2.set_text("")
            label3.set_text("")
            label4.set_text("")
            label5.set_text("")
            label6.set_text("")
            label7.set_text("")
            # Clear button labels
            try:
                button_a_label.set_text("")
                button_b_label.set_text("")
                button_c_label.set_text("")
            except:
                pass
            time.sleep(1)
        elif not btnB.isPressed():  # Button released before threshold
            button_b_press_time = 0  # Reset
    # Check for long press on button C (skip setup)
    if button_c_press_time > 0:
        if (time.ticks_ms() - button_c_press_time) > button_c_long_press_threshold:
            button_c_press_time = 0  # Reset
            print("🎮 Button C long press in setup mode - Skipping WiFi setup")
            # Note: MQTT is already disconnected at the start of wifi_setup_mode()
            label0.set_text("Skipping setup...")
            label1.set_text("Going to main...")
            setup_skipped = True  # Set flag to prevent re-entering setup
            hotspot_active = False
            keep_instruction_screen_shown = False  # Reset instruction flag (user chose to skip, not show instructions)
            # Clear all setup labels
            label2.set_text("")
            label3.set_text("")
            label4.set_text("")
            label5.set_text("")
            label6.set_text("")
            label7.set_text("")
            # Clear button labels
            try:
                button_a_label.set_text("")
                button_b_label.set_text("")
                button_c_label.set_text("")
            except:
                pass
            time.sleep(1)
        elif not btnC.isPressed():  # Button released before threshold
            button_c_press_time = 0  # Reset

def wifi_setup_mode(force=False):
    """Handle WiFi setup mode - blocking until WiFi is truly ready.
    If force=True, open setup even if already connected."""
    global hotspot_active, label0, label1, label2, label3, label4, label5, label6, label7, button_a_label,button_b_label, button_c_label
    global button_a_press_time, button_b_press_time, button_c_press_time, keep_instruction_screen_shown
    global mqtt, mqtt_connected
    
    # Disconnect MQTT before entering setup mode to prevent EHOSTUNREACH errors
    if mqtt_connected:
        try:
            print("🔌 Disconnecting MQTT before setup mode...")
            mqtt.disconnect()
            mqtt_connected = False
        except:
            pass
    
    # Reset all button press times when entering setup mode (clear any previous presses from main loop)
    button_a_press_time = 0
    button_b_press_time = 0
    button_c_press_time = 0
    
    print("🔧 Starting WiFi setup mode...")
    
    # If WiFi is already connected and not forced, just return
    if wifi_connected and not force:
        print("✅ WiFi already connected, skipping setup mode")
        return
    
    # Keep setup active until WiFi is truly ready, or forced entry
    while force or (not wifi_connected or not is_wifi_ready()):
        # Clear screen and any existing labels
        screen.clean_screen()
        screen.set_screen_bg_color(0x000000)
        
        # Create labels for WiFi setup display
        label0 = M5Label("WiFi Setup", x=15, y=20, color=0xFFFFFF)
        label1 = M5Label("SSID: " + HOTSPOT_SSID, x=15, y=50, color=0xFFFFFF)
        label2 = M5Label("Password: " + HOTSPOT_PASSWORD, x=15, y=80, color=0xFFFFFF)
        label3 = M5Label("Open Browser With IP: " + HOTSPOT_IP, x=15, y=110, color=0xFFFFFF)
        label4 = M5Label("WiFi: ?", x=130, y=10, color=0xFFFFFF, font=FONT_MONT_18)
        label5 = M5Label("Long press A to restart", x=15, y=135, color=0xFFFF00, font=FONT_MONT_18)
        label7 = M5Label("Long press B to show instructions", x=15, y=155, color=0xFFFF00, font=FONT_MONT_18)
        label6 = M5Label("Long press C to skip", x=15, y=175, color=0xFFFF00, font=FONT_MONT_18)
        
        button_a_label = M5Label("A", x=60, y=210, color=0xFFFFFF, font=FONT_MONT_18)
        button_b_label = M5Label("B", x=150, y=210, color=0xFFFFFF, font=FONT_MONT_18)
        button_c_label = M5Label("C", x=240, y=210, color=0xFFFFFF, font=FONT_MONT_18)
        if wifi_connected and saved_ssid:
            update_wifi_status("Connected", saved_ssid)
        else:
            update_wifi_status("?")
        if start_hotspot():
            # Start web server directly (blocking) - returns when hotspot_active becomes False
            try:
                web_server_thread()
            except Exception as e:
                print("❌ Web server error:", e)
            # finally:
            #     try:
            #         print("🔄 Stopping hotspot...")
            #         stop_hotspot()
            #     except Exception as se:
            #         print("⚠️ Hotspot stop warning:", se)
        
        # If still not ready, loop again (keep setup running)
        if not wifi_connected or not is_wifi_ready():
            print("❌ Still not ready after setup cycle, keeping setup mode active...")
            time.sleep(1)
            force = False  # only force first entry
            continue
        
        # Ready: restore main screen and exit
        screen.set_screen_bg_color(0xFFFFFF)
        
        # Stop hotspot before exiting setup mode
        print("🔄 Stopping hotspot before exiting setup mode...")
        try:
            stop_hotspot()
        except Exception as e:
            print("❌ Error stopping hotspot:", e)
        
        # Clear setup labels before recreating main labels
        try:
            label5.set_text("")
            label6.set_text("")
            label7.set_text("")
            button_a_label.set_text("")
            button_b_label.set_text("")
            button_c_label.set_text("")
        except:
            pass
        
        # Recreate labels with correct colors (black text on white background)
        create_main_labels()
        
        if wifi_connected and saved_ssid:
            update_wifi_status("Connected", saved_ssid)
        else:
            update_wifi_status("?")
        
        # Show instructions only if long B was pressed (not for long C skip)
        if keep_instruction_screen_shown:
            show_instructions_screen()
            keep_instruction_screen_shown = False  # Reset after showing
        break

# --- Hardware ---
go_plus_2 = module.get(module.GOPLUS2)

# --- UI ---
screen = M5Screen(); screen.clean_screen(); screen.set_screen_bg_color(0xFFFFFF)
create_main_labels()  # Create all main system labels

# Show instructions screen on boot (only once)
if not instructions_shown:
    wait_ms(300)  # Small delay to ensure labels are rendered
    show_instructions_screen()
    instructions_shown = True

# --- WiFi Initialization ---
# Note: You may see "MQTTException -> Connection keep time has been exceeded" during boot
# This is normal - it's just cleaning up old connections from previous sessions
print("🚀 Starting M5Stack Painting System...")
print("=" * 50)

# Check if WiFi is connected (let M5Stack handle connection automatically)
print("🔄 Checking WiFi connection...")
if load_wifi_credentials():
    print("📋 Found saved WiFi credentials:", saved_ssid)
    print("💡 M5Stack will connect to WiFi automatically in Internet Mode")
    if try_wifi_connection_with_retry(saved_ssid, saved_password, max_retries=2):
        print("✅ WiFi is connected!")
    else:
        print("❌ WiFi connection failed after retries.")
        print("🔄 Clearing old credentials and starting fresh...")
        clear_wifi_credentials()
        print("📱 Connect to 'M5Stack-Config' WiFi and go to http://192.168.4.1")
        wifi_setup_mode()
        # Guard: ensure WiFi is ready after setup
        # if not wifi_connected or not is_wifi_ready():
        #     print("❌ WiFi not ready after setup, re-entering setup mode...")
        #     wifi_setup_mode()
else:
    print("❌ No saved WiFi credentials. Starting hotspot mode...")
    print("📱 Connect to 'M5Stack-Config' WiFi and go to http://192.168.4.1")
    wifi_setup_mode()


# --- Height Control Variables ---
current_position = 0  # Current motor position
adjustment_amount = 0  # Calculated adjustment from backend
NORMAL_HEIGHT = 0
WHEELCHAIR_HEIGHT = -50  # Fallback speed if no calculation
# BASE_SPEED now defined at top of file

# --- Wheelchair Detection State ---
wheelchair_detected = False  # Track if wheelchair was detected
wheelchair_adjustment = 0  # Store the adjustment amount for wheelchair

# --- Command Queue for missed commands ---
command_queue = []
last_command_time = 0
command_timeout = 10000  # 10 seconds timeout for commands

# --- MQTT ---
MQTT_BROKER = "test.mosquitto.org"
MQTT_PORT   = 1883
MQTT_TOPIC_GENERAL = b"m5stack/+/height"  # Subscribe to all height topics
MQTT_TOPIC_SPECIFIC = None  # Will be set when we get sys_id
# Create unique MQTT client ID using timestamp to avoid "client already connected" errors on restart
CLIENT_ID   = b"m5stack_painting_" + str(time.ticks_ms()).encode()

# System ID management
current_sys_id = None

# Connection state (mqtt_connected is defined at the top with other globals)
last_reconnect_attempt = 0
reconnect_interval = 5000  # 5 seconds

def move_painting(direction, adjustment_amount):
    """
    Universal motor control function for moving painting up or down
    direction: "down" or "up" 
    adjustment_amount: distance to move (always positive)
    """
    global current_position, base_speed
    
    if adjustment_amount <= 0:
        print("⚠️ No movement needed:", adjustment_amount, "cm")
        return
    
    # Calculate gentle motor speed for museum environment
    # Gentle movement: slower speeds, longer duration for smooth operation
    base_speed = BASE_SPEED  # Use global base speed constant
    speed_multiplier = min(1.2, adjustment_amount / 30.0)  # Gentle scaling: every 30cm = 1.2x max, much flatter curve
    motor_speed = int(base_speed * speed_multiplier)
    
    # Set direction: negative for DOWN, positive for UP
    if direction == "down":
        motor_speed = -motor_speed  # Negative = move DOWN (wheelchair mode)
    elif direction == "up":
        motor_speed = motor_speed   # Positive = move UP (return to original)
    else:
        print("❌ Invalid direction:", direction, ". Use 'down' or 'up'")
        return
    
    # Ensure gentle minimum speed (museum environment but still functional)
    if abs(motor_speed) < 15:
        motor_speed = -15 if motor_speed < 0 else 15  # Minimum 15 speed (needed for motor to move)
    
    # Calculate longer duration for smooth museum movement
    # Gentle timing: 10cm = 1.5 seconds of movement (slower than before)
    duration = max(0.5, adjustment_amount / 6.5)  # At least 0.5 seconds, much slower movement
    
    # Update display based on direction
    if direction == "down":
        label1.set_text("Wheelchair Mode");
        label2.set_text("Motor: DOWN"); 
        label3.set_text("Adj: " + str(adjustment_amount) + "cm (" + str(duration) + "s)")
        label_speed.set_text("Speed: " + str(motor_speed))
        label_base_speed.set_text("B-Speed: " + str(BASE_SPEED))
        print("🎯 WHEELCHAIR DETECTED! Moving DOWN by", adjustment_amount, "cm at speed", motor_speed, "for", duration, "seconds")
    else:  # up
        label1.set_text("Normal Mode");
        label2.set_text("Motor: UP");
        label3.set_text("Adj: " + str(adjustment_amount) + "cm (" + str(duration) + "s)")
        label_speed.set_text("Speed: " + str(motor_speed))
        label_base_speed.set_text("B-Speed: " + str(BASE_SPEED))
        print("👋 PERSON LEFT! Moving UP by", adjustment_amount, "cm at speed", motor_speed, "for", duration, "seconds to return to original position")
    
    # Start the motor
    go_plus_2.set_motor_speed(go_plus_2.MA, motor_speed)
    
    # Wait for the calculated duration with countdown
    remaining_time = duration
    while remaining_time > 0:
        wait_ms(100)  # Check every 100ms
        remaining_time -= 0.1
        if remaining_time > 0:
            label3.set_text("Adj: " + str(adjustment_amount) + "cm (" + str(round(remaining_time, 1)) + "s)")
    
    # Stop the motor
    go_plus_2.set_motor_speed(go_plus_2.MA, 0)
    if 'label_speed' in globals() and label_speed:
        label_speed.set_text("Speed: " + str(BASE_SPEED))
    if 'label_base_speed' in globals() and label_base_speed:
        label_base_speed.set_text("B-Speed: " + str(BASE_SPEED))
    
    # Update position based on direction
    if direction == "down":
        current_position -= adjustment_amount
        print("DOWN movement completed. New position:", current_position)
    else:  # up
        current_position += adjustment_amount
        print("UP movement completed. New position:", current_position)

def move_painting_down():
    global adjustment_amount, wheelchair_detected, wheelchair_adjustment
    # For wheelchair users, we always need to move DOWN regardless of adjustment sign
    # Use absolute value of adjustment for movement calculation
    abs_adjustment = abs(adjustment_amount)
    
    if abs_adjustment > 0:
        # Store wheelchair state and adjustment
        wheelchair_detected = True
        wheelchair_adjustment = abs_adjustment
        
        # Use the universal motor function
        move_painting("down", abs_adjustment)
        
        print("Original adjustment was:", adjustment_amount, "cm (negative means painting too high)")
        
    else:
        # Fallback for no adjustment needed
        motor_speed = WHEELCHAIR_HEIGHT
        label1.set_text("Wheelchair Mode"); label2.set_text("Motor: DOWN"); label3.set_text("Height: DOWN")
        go_plus_2.set_motor_speed(go_plus_2.MA, motor_speed)
        wait_ms(1000)  # Run for 1 second
        go_plus_2.set_motor_speed(go_plus_2.MA, 0)

def move_painting_up():
    global wheelchair_detected, wheelchair_adjustment
    # Only move up if wheelchair was previously detected
    if wheelchair_detected and wheelchair_adjustment > 0:
        # Use the stored wheelchair adjustment amount
        abs_adjustment = wheelchair_adjustment
        
        # Use the universal motor function
        move_painting("up", abs_adjustment)
        
        # Reset wheelchair state
        wheelchair_detected = False
        wheelchair_adjustment = 0
        print("✅ Returned to original position. Wheelchair state reset.")
    else:
        # Regular person left - no motor movement needed
        print("👋 Regular person left - no motor movement needed")
        label1.set_text("Normal Mode"); label2.set_text("Motor: IDLE"); label3.set_text("No movement")

def stop_motor():
    go_plus_2.set_motor_speed(go_plus_2.MA, 0)
    label1.set_text("Stopped"); 
    label2.set_text("Motor: STOP"); 
    label3.set_text("Height: STOP")
    label_speed.set_text("Speed: " + str(BASE_SPEED))
    label_base_speed.set_text("B-Speed: " + str(BASE_SPEED))

def process_command_queue():
    """Process commands from the queue one at a time"""
    global command_queue, adjustment_amount
    
    if len(command_queue) > 0:
        command = command_queue.pop(0)  # Get first command
        cmd = command["cmd"]
        
        # Update adjustment_amount if data is available
        if "data" in command and "adjustment_needed" in command["data"]:
            adjustment_amount = float(command["data"]["adjustment_needed"])
        
        print("🎯 Processing command:", cmd, "Adjustment:", adjustment_amount)
        
        # Execute command (only 0 and 1 are valid)
        if cmd == 1:
            print("🎯 Executing: MOVE DOWN (wheelchair)")
            label0.set_text("MQTT: Wheelchair"); move_painting_down()
        elif cmd == 0:
            print("🎯 Executing: MOVE UP (person left)")
            label0.set_text("MQTT: Person Left"); move_painting_up()
        else:
            print("❌ Invalid command value:", cmd, "- ignoring")
            label3.set_text("Invalid: " + str(cmd))
        
        print("✅ Command processed. Remaining in queue:", len(command_queue))

def on_mqtt_message(topic, msg):
    global last_command_time, current_sys_id, MQTT_TOPIC_SPECIFIC
    try:
        print("RX topic:", topic.decode(), "payload:", msg, "type:", type(msg))
        last_command_time = time.ticks_ms()
        
        # Extract sys_id from topic (m5stack/{sys_id}/height)
        topic_str = topic.decode()
        if "/height" in topic_str:
            parts = topic_str.split("/")
            if len(parts) >= 3:
                new_sys_id = parts[1]  # Extract sys_id from m5stack/{sys_id}/height
                if current_sys_id != new_sys_id:
                    current_sys_id = new_sys_id
                    MQTT_TOPIC_SPECIFIC = ("m5stack/" + current_sys_id + "/height").encode()
                    print("🎯 New sys_id detected: " + current_sys_id)
                    print("📡 Now listening to: " + MQTT_TOPIC_SPECIFIC.decode())
                    label0.set_text("MQTT: " + current_sys_id[:8])  # Show first 8 chars of sys_id
        
        # Handle different message formats
        if msg == b'0' or msg == b'1':
            # Valid direct numeric commands
            cmd = int(msg)
            print("✅ Valid direct command:", cmd)
            # Add to queue for processing
            command_queue.append({"cmd": cmd, "timestamp": last_command_time})
        elif msg in [b'70', b'2', b'3', b'4', b'5', b'6', b'7', b'8', b'9']:
            # Invalid commands - ignore them
            print("❌ Ignoring invalid command:", msg)
            label3.set_text("Invalid: " + msg.decode())
            return
        else:
            # JSON format
            try:
                data = json.loads(msg)
                cmd = int(data.get("height", 0))
                
                # Extract painting measurements if available
                global adjustment_amount
                if "adjustment_needed" in data:
                    adjustment_amount = float(data["adjustment_needed"])
                    print("✅ Valid JSON command:", cmd, "Adjustment:", adjustment_amount, "cm")
                    print("📏 Painting measurements - Base:", data.get("base_height"), "Height:", data.get("painting_height"), "Center:", data.get("center_height"))
                else:
                    adjustment_amount = 0
                    print("✅ Valid JSON command:", cmd, "(no measurements)")
                
                # Add to queue for processing
                command_queue.append({"cmd": cmd, "timestamp": last_command_time, "data": data})
                    
            except json.JSONDecodeError as je:
                print("❌ JSON decode error:", je, "for payload:", msg)
                label3.set_text("JSON Error")
                return
        
        print("📋 Command added to queue. Queue length:", len(command_queue))
            
    except Exception as e:
        print("❌ MQTT parse error:", e, "for payload:", msg)
        label1.set_text("Parse Error")
        label3.set_text("Error: " + str(e)[:10])

def connect_mqtt():
    global mqtt, mqtt_connected, MQTT_BROKER, MQTT_PORT
    
    # Prevent multiple simultaneous connection attempts
    if mqtt_connected:
        print("⚠️ MQTT already connected, skipping connection attempt")
        return True
    
    try:
        print("🔗 Testing internet connectivity...")
        import socket
        try:
            # Test DNS resolution first
            socket.getaddrinfo("test.mosquitto.org", 1883)
            print("✅ DNS resolution successful")
        except Exception as dns_error:
            print("❌ DNS resolution failed:", dns_error)
            print("🔧 Trying alternative MQTT broker...")
            # Try a different MQTT broker as fallback
            MQTT_BROKER = "broker.hivemq.com"
            MQTT_PORT = 1883
            print("🔄 Using fallback broker:", MQTT_BROKER)
        
        mqtt = MQTTClient(client_id=CLIENT_ID, server=MQTT_BROKER, port=MQTT_PORT, keepalive=60)
        mqtt.set_callback(on_mqtt_message)
        mqtt.connect()
        mqtt.subscribe(MQTT_TOPIC_GENERAL)  # Subscribe to all height topics
        print("Connected & subscribed to", MQTT_TOPIC_GENERAL)
        print("Waiting for sys_id from backend...")
        label1.set_text("Waiting for sys_id..."); label3.set_text("Commands: Ready")
        mqtt_connected = True
        return True
    except Exception as e:
        print("MQTT connect error:", e)
        label1.set_text("MQTT Error")
        mqtt_connected = False
        return False

def check_mqtt_connection():
    global last_reconnect_attempt, mqtt_connected
    current_time = time.ticks_ms()
    
    if not mqtt_connected and (current_time - last_reconnect_attempt) > reconnect_interval:
        last_reconnect_attempt = current_time
        print("Attempting MQTT reconnection...")
        if connect_mqtt():
            print("MQTT reconnected successfully!")
        else:
            print("MQTT reconnection failed, will retry in 5 seconds")

# Initialize
label0.set_text("MQTT Real");
label1.set_text("MQTT Connecting...");
label2.set_text("Motor: READY");
label3.set_text("Starting...")
if 'label_base_speed' in globals() and label_base_speed:
    label_base_speed.set_text("B-Speed: " + str(BASE_SPEED))

# Only proceed if WiFi is connected
if not wifi_connected and not setup_skipped:
    print("❌ WiFi not connected, entering setup mode...")
    wifi_setup_mode()
elif setup_skipped:
    print("⚠️ WiFi setup was skipped, continuing without WiFi connection...")

# Initial MQTT connection (only if WiFi is connected)
if wifi_connected and is_wifi_ready():
    print("⏳ Waiting for WiFi to stabilize before MQTT connection...")
    wait_ms(3000)  # Wait 3 seconds for WiFi to be fully ready
    connect_mqtt()
elif setup_skipped:
    print("⚠️ WiFi setup was skipped, MQTT connection disabled")
    # Update display to show no MQTT connection
    label0.set_text("MQTT Off")
    label1.set_text("No WiFi")
    

# Instructions are shown by show_instructions_screen() function

while True:
    # Check WiFi connection status
    check_wifi_status()
    
    # Check if we need to attempt WiFi reconnection
    if not wifi_connected or not is_wifi_ready():
        # Only try reconnection if we have credentials and not in hotspot mode and not skipped
        if saved_ssid and saved_password and not hotspot_active and not setup_skipped:
            print("🔄 WiFi disconnected, starting hotspot mode...")
            print("📱 Connect to 'M5Stack-Config' to reconfigure WiFi")
            wifi_setup_mode()
            continue
        elif not hotspot_active and not setup_skipped:
            print("❌ No WiFi connection, starting hotspot mode...")
            wifi_setup_mode()
            continue
        elif setup_skipped:
            # WiFi was skipped, just continue without WiFi
            pass
    
    # Check MQTT connection and reconnect if needed
    if wifi_connected and is_wifi_ready():
        check_mqtt_connection()
    
    # Process MQTT messages
    if mqtt_connected:
        try:
            mqtt.check_msg()
        except Exception as e:
            print("MQTT loop error:", e)
            mqtt_connected = False
            label1.set_text("Reconnecting...")
    else:
        # WiFi not connected - show status
        if not mqtt_connected:
            label1.set_text("No WiFi")
    
    # Process command queue (one command at a time)
    process_command_queue()
    
    # Manual controls
    if btnA.wasPressed(): 
        button_a_press_time = time.ticks_ms()
        label0.set_text("Manual: Down"); 
        command_queue.append({"cmd": 1, "timestamp": time.ticks_ms()})
    
    if btnB.wasPressed(): 
        button_b_press_time = time.ticks_ms()
        wheelchair_detected = True
        wheelchair_adjustment = 1
        label0.set_text("Manual: Up"); 
        command_queue.append({"cmd": 0, "timestamp": time.ticks_ms()})
    
    # Handle button C press (short press = stop, long press = WiFi setup)
    if btnC.wasPressed(): 
        button_c_press_time = time.ticks_ms()
        label0.set_text("Manual: Stop"); 
        stop_motor()
    

    # Check for long press on button C (WiFi setup)
    if button_c_press_time > 0:
        wifi_on = True
        if (time.ticks_ms() - button_c_press_time) > button_c_long_press_threshold:
            button_c_press_time = 0  # Reset
            print("🎮 Button C long press - Starting WiFi setup")
            # Call setup directly in forced mode, like before
            wifi_setup_mode(force=True)
            # After WiFi setup, try to connect MQTT if WiFi is now connected
            if wifi_connected and is_wifi_ready():
                connect_mqtt()
        elif not btnC.isPressed():  # Button released before threshold
            button_c_press_time = 0  # Reset
    
    wait_ms(50)  # Faster loop for better responsiveness