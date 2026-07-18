#!/usr/bin/env python3
"""
Raspberry Pi 4 - Automatic WiFi Configuration System
Simple one-file solution (like M5Stack's robust_mqtt.py)

Handles:
- Automatic WiFi connection on boot
- Hotspot creation if WiFi not configured
- Web interface for WiFi setup
- Continuous WiFi monitoring
- Auto-recovery on disconnect
- Launches main program after WiFi setup
"""

import os
import sys
import time
import json
import subprocess
import socket
import signal
from flask import Flask, request, jsonify
from threading import Thread

# ============================================================
# GLOBAL VARIABLES
# ============================================================

wifi_connected = False
hotspot_active = False
saved_ssid = None
saved_password = None
main_program_process = None
web_server_thread = None
config_file = "/home/mike/Desktop/wifi_config.json"

# Configuration
HOTSPOT_SSID = "RaspberryPi-Config"
HOTSPOT_PASSWORD = "12345678"
HOTSPOT_IP = "192.168.4.1"
MAIN_PROGRAM_PATH = "/home/mike/Desktop/RPi4-Painting-MC/RPi4 - Master/rpi4_main.py"
CHECK_INTERVAL = 2  # Check WiFi every 2 seconds

# Flask app
app = Flask(__name__)

# ============================================================
# LOGGING FUNCTIONS (Like M5Stack)
# ============================================================

def log(emoji, message):
    """Log message with emoji (like M5Stack terminal output)"""
    timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] {emoji} {message}")

def log_start(msg):
    log("🚀", msg)

def log_wifi(msg):
    log("📡", msg)

def log_hotspot(msg):
    log("🌐", msg)

def log_web(msg):
    log("📱", msg)

def log_success(msg):
    log("✅", msg)

def log_error(msg):
    log("❌", msg)

def log_warning(msg):
    log("⚠️", msg)

def log_info(msg):
    log("💡", msg)

def log_test(msg):
    log("🔄", msg)

def log_config(msg):
    log("📋", msg)

# ============================================================
# CONFIGURATION MANAGEMENT (Like M5Stack save/load credentials)
# ============================================================

def ensure_config_dir():
    """Ensure config directory exists"""
    config_dir = os.path.dirname(config_file)
    os.makedirs(config_dir, exist_ok=True)

def load_wifi_config():
    """Load WiFi configuration from JSON file"""
    global saved_ssid, saved_password
    
    try:
        if os.path.exists(config_file):
            with open(config_file, 'r') as f:
                config = json.load(f)
                saved_ssid = config.get('ssid', '')
                saved_password = config.get('password', '')
                
                if saved_ssid and saved_password:
                    log_config(f"Loaded saved WiFi: {saved_ssid}")
                    return saved_ssid, saved_password
                else:
                    log_warning("Config file exists but is empty")
                    return None, None
        else:
            log_config("No saved WiFi configuration found")
            return None, None
            
    except Exception as e:
        log_error(f"Error loading WiFi config: {e}")
        return None, None

def save_wifi_config(ssid, password):
    """Save WiFi configuration to JSON file"""
    try:
        ensure_config_dir()
        
        config = {
            'ssid': ssid,
            'password': password,
            'saved_at': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)
        
        log_success(f"WiFi credentials saved: {ssid}")
        return True
        
    except Exception as e:
        log_error(f"Error saving WiFi config: {e}")
        return False

def clear_wifi_config():
    """Clear WiFi configuration"""
    global saved_ssid, saved_password
    
    try:
        if os.path.exists(config_file):
            os.remove(config_file)
            log_config("WiFi configuration cleared")
        
        saved_ssid = None
        saved_password = None
        return True
        
    except Exception as e:
        log_error(f"Error clearing WiFi config: {e}")
        return False

# ============================================================
# WIFI FUNCTIONS
# ============================================================

def connect_to_wifi(ssid, password):
    """Connect to WiFi using nmcli"""
    global wifi_connected
    
    log_wifi(f"Connecting to WiFi: {ssid}")
    
    try:
        # Use nmcli to connect
        log_wifi("Using nmcli to connect...")
        
        result = subprocess.run(
            ['nmcli', 'device', 'wifi', 'connect', ssid, 'password', password],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            log_success(f"Connected to WiFi: {ssid}")
            
            # Wait longer for connection to stabilize and get IP address
            log_info("Waiting for connection to stabilize...")
            time.sleep(5)
            
            # Verify connection with multiple attempts
            verification_attempts = 3
            for attempt in range(verification_attempts):
                log_info(f"Verification attempt {attempt + 1}/{verification_attempts}")
                if check_wifi_status():
                    wifi_connected = True
                    log_success("WiFi connection verified and ready!")
                    return True
                else:
                    if attempt < verification_attempts - 1:
                        log_info("Verification failed, retrying in 2 seconds...")
                        time.sleep(2)
            
            log_error("Connection succeeded but verification failed after all attempts")
            wifi_connected = False
            return False
        else:
            error_msg = result.stderr.strip() if result.stderr else "Unknown error"
            log_error(f"WiFi connection failed: {error_msg}")
            wifi_connected = False
            return False
        
    except subprocess.TimeoutExpired:
        log_error("WiFi connection timed out (30 seconds)")
        wifi_connected = False
        return False
    except Exception as e:
        log_error(f"Error connecting to WiFi: {e}")
        wifi_connected = False
        return False

def check_wifi_status():
    """Check if wlan0 is connected to a real WiFi network (not hotspot)"""
    try:
        # First check if wlan0 is connected to a network
        result = subprocess.run(
            ['nmcli', '-t', '-f', 'DEVICE,STATE', 'device', 'status'],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        wlan0_connected = False
        for line in result.stdout.split('\n'):
            if line.startswith('wlan0:'):
                if 'connected' in line.lower():
                    wlan0_connected = True
                    break
        
        if not wlan0_connected:
            return False
        
        # Check if it's connected to a real WiFi network (not our hotspot)
        result = subprocess.run(
            ['nmcli', '-t', '-f', 'NAME,TYPE', 'connection', 'show', '--active'],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        # Look for active WiFi connections (not our hotspot)
        for line in result.stdout.split('\n'):
            if ('wifi' in line.lower() or '802-11-wireless' in line.lower()) and 'raspberrypi-config' not in line.lower():
                # Connected to a real WiFi network
                return True
        
        # No real WiFi connection found
        return False
        
    except Exception as e:
        log_error(f"Error checking WiFi status: {e}")
        return False

def disconnect_wifi():
    """Disconnect from WiFi"""
    global wifi_connected
    
    try:
        subprocess.run(['nmcli', 'device', 'disconnect', 'wlan0'], 
                      capture_output=True, check=False)
        wifi_connected = False
        log_wifi("Disconnected from WiFi")
        return True
    except Exception as e:
        log_error(f"Error disconnecting WiFi: {e}")
        return False

def scan_networks():
    """Scan for available WiFi networks using iwlist"""
    log_wifi("Scanning for WiFi networks...")
    
    try:
        result = subprocess.run(
            ['iwlist', 'wlan0', 'scan'],
            capture_output=True,
            text=True,
            timeout=20
        )
        
        if result.returncode != 0:
            log_error("Network scan failed")
            return []
        
        # Parse scan results
        networks = []
        lines = result.stdout.split('\n')
        current_network = {}
        
        for line in lines:
            line = line.strip()
            
            if line.startswith('Cell'):
                if current_network and current_network.get('ssid'):
                    networks.append(current_network)
                current_network = {'ssid': '', 'signal': 0}
            
            elif 'ESSID:' in line:
                import re
                match = re.search(r'ESSID:"([^"]*)"', line)
                if match:
                    ssid = match.group(1)
                    if ssid:
                        current_network['ssid'] = ssid
            
            elif 'Signal level=' in line:
                import re
                match = re.search(r'Signal level=(-?\d+)', line)
                if match:
                    signal = int(match.group(1))
                    # Convert to percentage (roughly)
                    signal_percent = max(0, min(100, 100 + signal + 30))
                    current_network['signal'] = signal_percent
        
        # Add last network
        if current_network and current_network.get('ssid'):
            networks.append(current_network)
        
        # Sort by signal strength
        networks.sort(key=lambda x: x.get('signal', 0), reverse=True)
        
        log_success(f"Found {len(networks)} WiFi networks")
        return networks
        
    except Exception as e:
        log_error(f"Network scan error: {e}")
        return []

# ============================================================
# HOTSPOT FUNCTIONS
# ============================================================

def start_hotspot():
    """Start WiFi hotspot using hostapd and dnsmasq"""
    global hotspot_active
    
    log_hotspot(f"Starting WiFi hotspot: {HOTSPOT_SSID}")
    
    try:
        # Step 1: Disconnect from any WiFi
        log_hotspot("Disconnecting from existing WiFi...")
        subprocess.run(['nmcli', 'device', 'disconnect', 'wlan0'], 
                      capture_output=True, check=False)
        time.sleep(1)
        
        # Step 2: Configure wlan0 with static IP
        log_hotspot(f"Configuring wlan0 with IP {HOTSPOT_IP}...")
        subprocess.run(['ip', 'addr', 'flush', 'dev', 'wlan0'], check=False)
        subprocess.run(['ip', 'addr', 'add', f'{HOTSPOT_IP}/24', 'dev', 'wlan0'], check=True)
        subprocess.run(['ip', 'link', 'set', 'wlan0', 'up'], check=True)
        time.sleep(1)
        
        # Step 3: Start hostapd
        log_hotspot("Starting hostapd...")
        subprocess.run(['systemctl', 'unmask', 'hostapd'], check=False)
        subprocess.run(['systemctl', 'restart', 'hostapd'], check=True)
        time.sleep(2)
        
        # Step 4: Start dnsmasq
        log_hotspot("Starting dnsmasq...")
        subprocess.run(['systemctl', 'restart', 'dnsmasq'], check=True)
        time.sleep(1)
        
        hotspot_active = True
        log_success(f"Hotspot active: {HOTSPOT_SSID}")
        log_hotspot(f"IP: {HOTSPOT_IP}")
        log_hotspot(f"Password: {HOTSPOT_PASSWORD}")
        
        return True
        
    except subprocess.CalledProcessError as e:
        log_error(f"Failed to start hotspot: {e}")
        return False
    except Exception as e:
        log_error(f"Unexpected error starting hotspot: {e}")
        return False

def stop_hotspot():
    """Stop WiFi hotspot"""
    global hotspot_active
    
    log_hotspot("Stopping WiFi hotspot...")
    
    try:
        # Stop hostapd
        subprocess.run(['systemctl', 'stop', 'hostapd'], check=False)
        
        # Stop dnsmasq
        subprocess.run(['systemctl', 'stop', 'dnsmasq'], check=False)
        
        # Flush IP
        subprocess.run(['ip', 'addr', 'flush', 'dev', 'wlan0'], check=False)
        
        hotspot_active = False
        log_success("Hotspot stopped")
        
        return True
        
    except Exception as e:
        log_error(f"Error stopping hotspot: {e}")
        return False

# ============================================================
# FLASK WEB SERVER (Embedded like M5Stack web server)
# ============================================================

@app.route('/')
def index():
    """Serve WiFi configuration page (HTML embedded)"""
    log_web("User accessed configuration page")
    
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🍓 RPi4 WiFi Setup</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            .container {
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                max-width: 500px;
                width: 100%;
                padding: 30px;
            }
            h1 {
                color: #667eea;
                text-align: center;
                margin-bottom: 10px;
            }
            .subtitle {
                text-align: center;
                color: #666;
                margin-bottom: 30px;
                font-size: 14px;
            }
            .form-group {
                margin-bottom: 20px;
            }
            label {
                display: block;
                color: #333;
                font-weight: 600;
                margin-bottom: 8px;
                font-size: 14px;
            }
            input[type="text"],
            input[type="password"] {
                width: 100%;
                padding: 12px 15px;
                border: 2px solid #e0e0e0;
                border-radius: 10px;
                font-size: 16px;
                transition: border-color 0.3s;
            }
            input:focus {
                outline: none;
                border-color: #667eea;
            }
            .password-wrapper {
                position: relative;
                display: flex;
                align-items: center;
            }
            .password-wrapper input {
                flex: 1;
                padding-right: 100px;
            }
            .password-toggle {
                position: absolute;
                right: 10px;
                background: #667eea;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
            }
            .btn {
                width: 100%;
                padding: 15px;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 10px;
                transition: all 0.3s;
            }
            .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
            }
            .btn-secondary {
                background: #f0f0f0;
                color: #333;
            }
            .message {
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 20px;
                display: none;
            }
            .message.success {
                background: #d4edda;
                color: #155724;
                border: 2px solid #c3e6cb;
            }
            .message.error {
                background: #f8d7da;
                color: #721c24;
                border: 2px solid #f5c6cb;
            }
            .message.info {
                background: #d1ecf1;
                color: #0c5460;
                border: 2px solid #bee5eb;
            }
            .loading {
                text-align: center;
                display: none;
                margin: 20px 0;
            }
            .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 0 auto;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🍓 Raspberry Pi WiFi Setup</h1>
            <p class="subtitle">Configure your WiFi connection</p>
            
            <div id="message" class="message"></div>
            
            <div class="loading" id="loading">
                <div class="spinner"></div>
                <p style="margin-top: 10px;">Testing connection...</p>
            </div>
            
            <form id="wifiForm">
                <div class="form-group">
                    <label for="ssid">WiFi Network (SSID)</label>
                    <input type="text" id="ssid" name="ssid" placeholder="Enter WiFi name" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="password-wrapper">
                        <input type="password" id="password" name="password" placeholder="Enter WiFi password">
                        <button type="button" class="password-toggle" onclick="togglePassword()">Show</button>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary">✅ Connect to WiFi</button>
            </form>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                <p>🔧 After successful connection, your program will start automatically</p>
            </div>
        </div>
        
        <script>
            function showMessage(message, type) {
                const messageDiv = document.getElementById('message');
                messageDiv.textContent = message;
                messageDiv.className = 'message ' + type;
                messageDiv.style.display = 'block';
            }
            
            function showLoading(show) {
                document.getElementById('loading').style.display = show ? 'block' : 'none';
            }
            
            function togglePassword() {
                const passwordInput = document.getElementById('password');
                const toggleBtn = document.querySelector('.password-toggle');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    toggleBtn.textContent = 'Hide';
                } else {
                    passwordInput.type = 'password';
                    toggleBtn.textContent = 'Show';
                }
            }
            
            document.getElementById('wifiForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const ssid = document.getElementById('ssid').value;
                const password = document.getElementById('password').value;
                
                if (!ssid) {
                    showMessage('Please enter a WiFi network name', 'error');
                    return;
                }
                
                showLoading(true);
                showMessage('Testing WiFi connection... This may take up to 30 seconds.', 'info');
                
                try {
                    const response = await fetch('/configure', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ ssid, password })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        showMessage('✅ WiFi connected successfully! Your program is starting...', 'success');
                        
                        // Disable form
                        document.getElementById('wifiForm').querySelectorAll('input, button').forEach(el => {
                            el.disabled = true;
                        });
                    } else {
                        showMessage('❌ Connection failed: ' + (data.error || 'Unknown error'), 'error');
                    }
                } catch (error) {
                    showMessage('❌ Error: ' + error.message, 'error');
                } finally {
                    showLoading(false);
                }
            });
        </script>
    </body>
    </html>
        """
    
    return html

@app.route('/configure', methods=['POST'])
def configure_wifi():
    """Handle WiFi configuration from web form"""
    try:
        data = request.get_json()
        ssid = data.get('ssid', '')
        password = data.get('password', '')
        
        log_config(f"Received WiFi configuration: {ssid}")
        
        if not ssid:
            return jsonify({
                'success': False,
                'error': 'SSID is required'
            })
        
        # Test the connection BEFORE saving
        log_test(f"Testing connection to '{ssid}'...")
        
        if connect_to_wifi(ssid, password):
            # Connection successful - save it
            save_wifi_config(ssid, password)
            
            log_success("WiFi configured successfully!")
            
            # Return success first, then stop hotspot after delay
            response = jsonify({
                'success': True,
                'message': f'Successfully connected to {ssid}!'
            })
            
            # Schedule hotspot stop and main program launch after user sees message
            import threading
            def delayed_action():
                time.sleep(2)  # Give user time to see success message
                stop_hotspot()
                launch_main_program()
            
            threading.Thread(target=delayed_action, daemon=True).start()
            
            return response
        else:
            # Connection failed - don't save
            log_error("WiFi connection test failed")
            return jsonify({
                'success': False,
                'error': f'Failed to connect to "{ssid}". Please check the SSID and password, then try again.'
            })
            
    except Exception as e:
        log_error(f"Configuration error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        })

# Captive portal redirects
@app.route('/generate_204')
@app.route('/gen_204')
@app.route('/hotspot-detect.html')
@app.route('/connectivity-check.html')
def captive_portal():
    """Handle captive portal detection"""
    from flask import redirect
    return redirect('/')

# ============================================================
# WEB SERVER THREAD
# ============================================================

def start_web_server():
    """Start Flask web server in background thread"""
    global web_server_thread
    
    log_web("Starting Flask web server on port 80...")
    
    try:
        # Kill any existing processes using port 80
        log_web("Checking for processes using port 80...")
        try:
            subprocess.run(['fuser', '-k', '80/tcp'], 
                          capture_output=True, check=False, timeout=5)
            time.sleep(1)
        except Exception as e:
            log_warning(f"Could not kill port 80 processes: {e}")
        
        def run_flask():
            app.run(host='0.0.0.0', port=80, debug=False, use_reloader=False)
        
        web_server_thread = Thread(target=run_flask, daemon=True)
        web_server_thread.start()
        
        time.sleep(2)
        log_success(f"Web server started on {HOTSPOT_IP}")
        return True
        
    except Exception as e:
        log_error(f"Failed to start web server: {e}")
        return False

# ============================================================
# MAIN PROGRAM LAUNCH
# ============================================================

def launch_main_program():
    """Launch the main RPi4 program (your rpi4_main.py)"""
    global main_program_process
    
    log_start("Launching main program...")
    
    try:
        if os.path.exists(MAIN_PROGRAM_PATH):
            log_info(f"Starting {MAIN_PROGRAM_PATH}...")
            main_program_process = subprocess.Popen(
                ['python3', MAIN_PROGRAM_PATH],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            log_success("Main program launched successfully!")
            return True
        else:
            log_warning(f"Main program not found: {MAIN_PROGRAM_PATH}")
            log_info("System will continue without launching main program")
            return False
            
    except Exception as e:
        log_error(f"Failed to launch main program: {e}")
        return False

def stop_main_program():
    """Stop the main program gracefully"""
    global main_program_process
    
    if main_program_process:
        log_info("Stopping main program...")
        try:
            main_program_process.terminate()
            main_program_process.wait(timeout=10)
            log_success("Main program stopped")
        except:
            main_program_process.kill()
            log_warning("Main program killed (forced)")
        
        main_program_process = None

# ============================================================
# SETUP MODE
# ============================================================

def enter_setup_mode():
    """Enter WiFi setup mode (hotspot + web interface)"""
    log_info("Entering WiFi setup mode...")
    
    # Start hotspot
    if start_hotspot():
        # Start web server
        if start_web_server():
            log_success("Setup mode active!")
            log_info(f"Connect to '{HOTSPOT_SSID}' and go to http://{HOTSPOT_IP}")
            return True
        else:
            log_error("Failed to start web server")
            return False
    else:
        log_error("Failed to start hotspot")
        return False

# ============================================================
# MAIN MONITORING LOOP (Like M5Stack main loop)
# ============================================================

def wifi_monitoring_loop():
    """Main monitoring loop - checks WiFi status continuously"""
    global wifi_connected, hotspot_active
    
    log_start("Starting WiFi monitoring loop...")
    log_info(f"Checking WiFi status every {CHECK_INTERVAL} seconds")
    
    while True:
        try:
            # Always check WiFi status, but handle results differently based on state
            is_connected = check_wifi_status()
            
            if is_connected:
                # WiFi is connected
                if not wifi_connected:
                    log_success("WiFi connection detected!")
                    wifi_connected = True
                    
                    # If we were in hotspot mode, stop it and start main program
                    # But only if we have a saved config (not manual connection)
                    if hotspot_active:
                        ssid, password = load_wifi_config()
                        if ssid and password:
                            log_info("WiFi connected with saved config, stopping hotspot...")
                            stop_hotspot()
                            launch_main_program()
                        else:
                            log_info("Manual WiFi connection detected, keeping hotspot for user to configure...")
            else:
                # WiFi is disconnected
                if wifi_connected:
                    log_warning("WiFi connection lost!")
                    wifi_connected = False
                    
                    # Stop main program
                    stop_main_program()
                    
                    # Clear bad config
                    clear_wifi_config()
                    
                    # Start setup mode (only if not already in hotspot mode)
                    if not hotspot_active:
                        log_warning("Restarting setup mode due to WiFi disconnect...")
                        enter_setup_mode()
            
            # Sleep before next check
            time.sleep(CHECK_INTERVAL)
            
        except KeyboardInterrupt:
            log_info("Monitoring loop stopped by user")
            break
        except Exception as e:
            log_error(f"Monitoring loop error: {e}")
            time.sleep(CHECK_INTERVAL)

# ============================================================
# BOOT SEQUENCE
# ============================================================

def boot_sequence():
    """Main boot sequence (like M5Stack boot logic)"""
    log_start("🍓 Raspberry Pi 4 - WiFi Auto-Configuration")
    log_start("=" * 50)
    
    # Set up signal handlers
    signal.signal(signal.SIGTERM, handle_shutdown)
    signal.signal(signal.SIGINT, handle_shutdown)
    
    # Load WiFi configuration
    ssid, password = load_wifi_config()
    
    if ssid and password:
        log_config(f"Found saved WiFi: {ssid}")
        log_test("Testing WiFi connection...")
        
        # Try to connect
        if connect_to_wifi(ssid, password):
            log_success("WiFi connected successfully!")
            
            # Launch main program
            launch_main_program()
            
            # Start monitoring loop (this will run forever)
            wifi_monitoring_loop()
        else:
            log_warning("Saved WiFi connection failed")
            clear_wifi_config()
            log_info("Entering setup mode...")
            enter_setup_mode()
            # Start monitoring loop (this will run forever)
            wifi_monitoring_loop()
    else:
        log_info("No WiFi configuration found")
        log_info("Entering setup mode...")
        enter_setup_mode()
        # Start monitoring loop (this will run forever)
        wifi_monitoring_loop()

# ============================================================
# SIGNAL HANDLERS
# ============================================================

def handle_shutdown(signum, frame):
    """Handle shutdown signals gracefully"""
    log_info(f"Received signal {signum}, shutting down...")
    
    # Stop main program
    stop_main_program()
    
    # Stop hotspot
    if hotspot_active:
        stop_hotspot()
    
    log_success("Shutdown complete")
    sys.exit(0)

def handle_main_program_stop(signum, frame):
    """Handle main program stopping (but keep monitoring)"""
    log_info(f"Main program stopped, continuing monitoring...")
    
    # Stop main program but don't exit the service
    stop_main_program()
    
    # Keep the monitoring loop running

# ============================================================
# MAIN ENTRY POINT
# ============================================================

def main():
    """Main entry point"""
    
    # Check root permissions
    if os.geteuid() != 0:
        print("❌ This script requires root permissions")
        print("💡 Run with: sudo python3 rpi_wifi_auto.py")
        sys.exit(1)
    
    # Setup signal handlers
    signal.signal(signal.SIGINT, handle_shutdown)
    signal.signal(signal.SIGTERM, handle_shutdown)
    
    try:
        # Run boot sequence
        boot_sequence()
        
    except Exception as e:
        log_error(f"Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

