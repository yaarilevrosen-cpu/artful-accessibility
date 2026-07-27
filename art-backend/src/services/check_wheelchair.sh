#!/bin/bash
# לוכד תמונה מ-/capture, שולח אותה ל-/detect, ומדפיס שורה אחת שמתחלפת
# עצירה: Ctrl+C

while true; do
    result=$(python3 -c "
import requests

try:
    cap = requests.get('http://localhost:5001/capture', timeout=5).json()
    img_b64 = cap.get('image')
    if not img_b64:
        print('capture_failed')
    else:
        det = requests.post('http://localhost:5001/detect', json={'image': img_b64}, timeout=5).json()
        detected = det.get('detected', 'N/A')
        conf = det.get('best_conf', det.get('confidence', 0))
        print(f'{detected}|{float(conf)*100:.1f}')
except Exception as e:
    print(f'error|{e}')
")
    printf "\r%-100s" "תוצאה: $result"
    sleep 1
done
