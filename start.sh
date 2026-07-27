#!/bin/bash

echo "========================================="
echo "Starting Student Management System"
echo "========================================="
echo ""

if [ -f ".env" ]; then
  set -a
  source ".env"
  set +a
fi
DB_HOST=${DB_HOST:-localhost}
DB_NAME=${DB_NAME:-student_management}
DB_USER=${DB_USER:-root}
DB_PASS=${DB_PASS:-''}

echo "1. Checking MySQL database..."
if [ -n "$DB_PASS" ]; then
  mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME; SHOW TABLES;" > /dev/null 2>&1
else
  mysql -h "$DB_HOST" -u "$DB_USER" -e "USE $DB_NAME; SHOW TABLES;" > /dev/null 2>&1
fi
if [ $? -ne 0 ]; then
    echo "   Database not found. Creating it..."
    if [ -n "$DB_PASS" ]; then
      mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" < backend/database/schema.sql
    else
      mysql -h "$DB_HOST" -u "$DB_USER" < backend/database/schema.sql
    fi
    echo "   Database created and populated"
else
    echo "   Database '$DB_NAME' already exists"
fi

echo ""
echo "2. Starting PHP API server on port 8000..."
echo "   API will be available at: http://localhost:8000"
cd "$(dirname "$0")"

# Check if port 8000 is in use
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "   Port 8000 is already in use. Trying port 8001..."
    php -S 0.0.0.0:8001 -t backend &
    PHP_PORT=8001
else
    php -S 0.0.0.0:8000 -t backend &
    PHP_PORT=8000
fi

PHP_PID=$!
sleep 2

echo ""
echo "3. Starting React frontend on port 3000..."
echo "   Frontend will be available at: http://localhost:3000"
cd frontend

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install --silent
fi

npm start &
REACT_PID=$!

echo ""
echo "========================================="
echo "Servers are running!"
echo "========================================="
echo "Frontend: http://localhost:3000"
echo "API: http://localhost:$PHP_PORT"
echo ""
echo "Default login credentials:"
echo "  Username: admin"
echo "  Password: admin"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "========================================="

# Function to stop servers
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $PHP_PID 2>/dev/null
    kill $REACT_PID 2>/dev/null
    echo "Servers stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for processes
wait