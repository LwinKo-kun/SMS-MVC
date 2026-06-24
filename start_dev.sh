#!/bin/bash
echo "Starting development servers..."
echo ""
echo "1. Starting PHP API server on port 8000..."
echo "   Local API: http://localhost:8000"
echo "   Network API: http://192.168.26.138:8000"
cd "$(dirname "$0")"
php -S 0.0.0.0:8000 -t backend &
PHP_PID=$!

echo ""
echo "2. Starting React frontend on port 3000..."
echo "   Local Frontend: http://localhost:3000"
echo "   Network Frontend: http://192.168.26.138:3000"
cd frontend
npm start &
REACT_PID=$!

echo ""
echo "========================================="
echo "Servers are running!"
echo "========================================="
echo "Local Access:"
echo "  Frontend: http://localhost:3000"
echo "  API: http://localhost:8000"
echo ""
echo "Network Access (other devices):"
echo "  Frontend: http://192.168.26.138:3000"
echo "  API: http://192.168.26.138:8000"
echo ""
echo "Default Login Credentials:"
echo "  Username: admin"
echo "  Password: admin"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "========================================="

# Wait for Ctrl+C
trap "echo 'Stopping servers...'; kill $PHP_PID $REACT_PID 2>/dev/null; exit 0" INT
wait
