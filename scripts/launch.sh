#!/bin/bash

# Kill any existing Electron instances
echo "Cleaning up existing instances..."
pkill -f "electron ." 2>/dev/null || true

# Wait a moment for processes to clean up
sleep 1

# Create logs directory if it doesn't exist
mkdir -p logs

# Get current date for log file
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H-%M-%S)

# Launch the Electron app with logging
echo "Launching MoodbooM menu..."
npm run electron > "logs/menu-${DATE}-${TIME}.log" 2>&1 &

# Store the PID
echo $! > logs/menu.pid

# Wait a bit and check if it's running
sleep 3

if node check-menu.js | grep -q "RUNNING"; then
    echo "✅ Menu launched successfully!"
    echo "📁 Log file: logs/menu-${DATE}-${TIME}.log"
    echo "🆔 PID: $(cat logs/menu.pid)"
else
    echo "❌ Menu failed to launch!"
    echo "Check logs/menu-${DATE}-${TIME}.log for details"
    exit 1
fi