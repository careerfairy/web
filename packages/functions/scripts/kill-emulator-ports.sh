#!/bin/bash
# Kill processes running on Firebase emulator ports
# Uses native lsof/kill commands instead of npx kill-port
# This avoids the security risk of using npx with compromised packages

PORTS=(8080 9099 4000 5001 9199)

# Check if we're on macOS/Linux (lsof is available)
if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]]; then
   # Find and kill processes on each port
   for port in "${PORTS[@]}"; do
      # lsof -ti returns PIDs of processes using the port, or nothing if none
      PIDS=$(lsof -ti:$port 2>/dev/null || true)
      
      if [ -n "$PIDS" ]; then
         echo "Killing processes on port $port: $PIDS"
         echo "$PIDS" | xargs kill -9 2>/dev/null || true
      fi
   done
   echo "Done killing emulator ports"
else
   echo "Warning: This script is optimized for macOS/Linux. For Windows, use:"
   echo "  netstat -ano | findstr :PORT"
   echo "  taskkill /F /PID <PID>"
   exit 1
fi

