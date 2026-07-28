[200~#!/bin/bash
# להריץ על הג'טסון הישן (rosen@192.168.68.133) בלבד
set -e

echo "=================================================="
echo "1. סנכרון server.py החי מול הקובץ בריפו"
echo "=================================================="
NEED_PUSH=0
if diff -q ~/server.py ~/artful-accessibility/jetson-inference/server.py >/dev/null 2>&1; then
    echo "כבר מסונכרן, מדלג"
    else
        echo "לא מסונכרן - מעדכן..."
            mkdir -p ~/artful-accessibility/jetson-inference
                cp ~/server.py ~/artful-accessibility/jetson-inference/server.py
                    NEED_PUSH=1
                    fi

                    echo ""
                    echo "=================================================="
                    echo "2. וידוא שמשקולות המודל (best.pt) נמצאות בריפו"
                    echo "=================================================="
                    if [ -f ~/artful-accessibility/jetson-inference/weights/best.pt ]; then
                        echo "כבר שם, מדלג"
                        else
                            echo "חסר - מעתיק..."
                                mkdir -p ~/artful-accessibility/jetson-inference/weights
                                    cp ~/runs/detect/wheelchair_detector/weights/best.pt ~/artful-accessibility/jetson-inference/weights/
                                        NEED_PUSH=1
                                        fi

                                        echo ""
                                        echo "=================================================="
                                        echo "3. דחיפה ל-GitHub (רק אם היה שינוי)"
                                        echo "=================================================="
                                        if [ "$NEED_PUSH" = "1" ]; then
                                            cd ~/artful-accessibility
                                                git add -A
                                                    git commit -m "Sync server.py and weights for new Jetson deployment"
                                                        echo "מריץ git push - יבקש שם משתמש (yaarilevrosen-cpu) וטוקן"
                                                            git push
                                                            else
                                                                echo "אין שינויים לדחוף"
                                                                fi

                                                                echo ""
                                                                echo "=================================================="
                                                                echo "4. יצירת גיבוי MongoDB"
                                                                echo "=================================================="
                                                                MONGO=$(sudo docker ps --format '{{.Names}}' | grep -i mongo)
                                                                echo "קונטיינר מונגו שנמצא: $MONGO"
                                                                sudo docker exec "$MONGO" mongodump --db painting-system --archive=/tmp/painting-system.archive
                                                                sudo docker cp "$MONGO":/tmp/painting-system.archive ~/painting-system.archive
                                                                echo "גיבוי נשמר:"
                                                                ls -lh ~/painting-system.archive

                                                                echo ""
                                                                echo "=================================================="
                                                                echo "5. בדיקה סופית - כתובת ה-IP של המכונה הזו"
                                                                echo "=================================================="
                                                                echo "וודא שזו אכן 192.168.68.133 (הג'טסון הישן):"
                                                                hostname -I

                                                                echo ""
                                                                echo "=================================================="
                                                                echo "סיימנו! על הג'טסון החדש (museum@192.168.68.135),"
                                                                echo "קלוד קוד ימשוך מפה עם scp:"
                                                                echo "  scp rosen@192.168.68.133:~/painting-system.archive ~/"
                                                                echo "וגם ימשוך server.py + best.pt דרך git clone/pull מהריפו."
                                                                echo "=================================================="[201~]]
