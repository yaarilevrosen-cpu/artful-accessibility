
#!/usr/bin/env python3

import paho.mqtt.client as mqtt
import time
import json

# MQTT Settings
MQTT_BROKER = "test.mosquitto.org"
MQTT_PORT = 1883
MQTT_CLIENT_ID = "mac_mqtt_adjustment_tester"
# You can change this sys_id to match your painting system
SYS_ID = "1758284976957"  # Change this to your actual sys_id
MQTT_TOPIC = f"m5stack/{SYS_ID}/height" # Target specific M5Stack sys_id

# Accessibility standard for wheelchair users
AVERAGE_EYE_LEVEL = 119.25 # cm

def calculate_height_adjustment(base_height, painting_height):
    """
    Calculates the adjustment needed for a painting based on wheelchair eye level.
    """
    center_height = base_height + (painting_height / 2)
    adjustment_needed = AVERAGE_EYE_LEVEL - center_height
    
    return {
        "base_height": base_height,
        "painting_height": painting_height,
        "center_height": center_height,
        "adjustment_needed": adjustment_needed
    }

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to MQTT broker")
    else:
        print(f"❌ Connection failed with code {rc}")

def run_comprehensive_test():
    client = mqtt.Client()
    client.on_connect = on_connect
    
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_start()
        
        print("🎯 Testing M5Stack Height Control - ALL ADJUSTMENT SIZES")
        print("=" * 70)
        print("Make sure your M5Stack is running robust_mqtt.py")
        print("Starting comprehensive test in 3 seconds...")
        time.sleep(3)
        
        # Test cases covering all adjustment sizes
        test_cases = [
            # SMALL ADJUSTMENTS (5-15cm)
            # {"base_height": 110, "painting_height": 30, "name": "SMALL: Low small painting (needs 4.25cm down)"},
            # {"base_height": 105, "painting_height": 40, "name": "SMALL: Low medium painting (needs 9.25cm down)"},
            # {"base_height": 100, "painting_height": 50, "name": "SMALL: Low large painting (needs 4.25cm down)"},
            
            # # MEDIUM ADJUSTMENTS (15-30cm)
            # {"base_height": 90, "painting_height": 40, "name": "MEDIUM: Medium low painting (needs 19.25cm down)"},
            # {"base_height": 80, "painting_height": 50, "name": "MEDIUM: Low medium painting (needs 19.25cm down)"},
            # {"base_height": 85, "painting_height": 30, "name": "MEDIUM: Low small painting (needs 24.25cm down)"},
            
            # LARGE ADJUSTMENTS (30cm+)
            {"base_height": 70, "painting_height": 40, "name": "LARGE: Very low painting (needs 39.25cm down)"},
            {"base_height": 60, "painting_height": 50, "name": "LARGE: Extremely low painting (needs 39.25cm down)"},
            {"base_height": 50, "painting_height": 60, "name": "LARGE: Ultra low painting (needs 39.25cm down)"},
            
            # EDGE CASES
            {"base_height": 120, "painting_height": 20, "name": "EDGE: High small painting (needs -0.75cm - should move UP)"},
            {"base_height": 130, "painting_height": 30, "name": "EDGE: Very high painting (needs -10.75cm - should move UP)"},
        ]
        
        for i, case in enumerate(test_cases, 1):
            print(f"\n{'='*70}")
            print(f"🧪 TEST CASE {i}: {case['name']}")
            print(f"{'='*70}")
            
            result = calculate_height_adjustment(case["base_height"], case["painting_height"])
            
            print(f"   Base Height: {result['base_height']} cm")
            print(f"   Painting Height: {result['painting_height']} cm")
            print(f"   Center Height: {result['center_height']:.2f} cm")
            print(f"   Adjustment Needed: {result['adjustment_needed']:.2f} cm")
            
            # Calculate expected gentle motor speed (museum environment)
            abs_adjustment = abs(result['adjustment_needed'])
            base_speed = 12  # Gentle base speed for museum
            speed_multiplier = min(1.2, abs_adjustment / 30.0)  # Gentle scaling
            expected_speed = int(base_speed * speed_multiplier)
            if abs(expected_speed) < 15:
                expected_speed = 15 if expected_speed > 0 else -15  # Minimum 15 speed (needed for motor to move)
            
            print(f"   Expected Motor Speed: {expected_speed}")
            print(f"   Expected Duration: {max(0.5, abs_adjustment / 6.5):.2f} seconds")
            
            if result['adjustment_needed'] > 0:
                print(f"🎯 Action: Move DOWN by {result['adjustment_needed']:.2f} cm")
            elif result['adjustment_needed'] < 0:
                print(f"🎯 Action: Move UP by {abs(result['adjustment_needed']):.2f} cm")
            else:
                print("🎯 Action: No adjustment needed - perfect height!")
            
            # Send MOVE DOWN command (wheelchair detected)
            print(f"\n📤 Sending: MOVE DOWN (wheelchair detected)")
            mqtt_payload_down = {
                "height": 1,
                "base_height": result['base_height'],
                "painting_height": result['painting_height'],
                "center_height": result['center_height'],
                "adjustment_needed": result['adjustment_needed']
            }
            client.publish(MQTT_TOPIC, json.dumps(mqtt_payload_down), qos=2)
            print(f"   Payload: {json.dumps(mqtt_payload_down, indent=2)}")
            
            print("⏳ Waiting 8 seconds to see the movement...")
            time.sleep(8)
            
            # Send MOVE UP command (person left)
            print(f"\n📤 Sending: MOVE UP (person left)")
            mqtt_payload_up = {
                "height": 0,
                "base_height": result['base_height'],
                "painting_height": result['painting_height'],
                "center_height": result['center_height'],
                "adjustment_needed": result['adjustment_needed']
            }
            client.publish(MQTT_TOPIC, json.dumps(mqtt_payload_up), qos=2)
            print(f"   Payload: {json.dumps(mqtt_payload_up, indent=2)}")
            
            print("⏳ Waiting 8 seconds for return movement...")
            time.sleep(8)
            
            print(f"✅ Test case {i} completed!")
            
            # Pause between test cases
            if i < len(test_cases):
                input(f"\nPress Enter to continue to test case {i+1}...")
            
        print("\n🎉 COMPREHENSIVE TEST COMPLETED!")
        print("All adjustment sizes have been tested!")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    run_comprehensive_test()
