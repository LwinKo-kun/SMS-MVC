#!/bin/bash

echo "========================================="
echo "Student Management System Setup"
echo "========================================="
echo ""

# Check if running on Ubuntu/Debian
if [ -f /etc/debian_version ]; then
    echo "Detected Debian/Ubuntu system"
    DISTRO="debian"
else
    echo "Warning: This script is optimized for Ubuntu/Debian"
    echo "You may need to adjust package manager commands"
    DISTRO="other"
fi

echo ""
echo "1. Installing system dependencies..."

if [ "$DISTRO" = "debian" ]; then
    sudo apt update
    
    # Check and install PHP
    if ! command -v php &> /dev/null; then
        echo "Installing PHP..."
        sudo apt install -y php php-mysql php-curl php-mbstring
    else
        echo "PHP already installed"
    fi
    
    # Check and install MySQL/MariaDB
    if ! command -v mysql &> /dev/null; then
        echo "Installing MariaDB..."
        sudo apt install -y mariadb-server mariadb-client
    else
        echo "MySQL/MariaDB already installed"
    fi
    
    # Check and install Node.js
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
    else
        echo "Node.js already installed"
    fi
fi

echo ""
echo "2. Setting up database..."

# Check if MySQL service is running
if ! sudo systemctl is-active --quiet mariadb && ! sudo systemctl is-active --quiet mysql; then
    echo "Starting database service..."
    if [ "$DISTRO" = "debian" ]; then
        sudo systemctl start mariadb 2>/dev/null || sudo systemctl start mysql 2>/dev/null
        sudo systemctl enable mariadb 2>/dev/null || sudo systemctl enable mysql 2>/dev/null
    fi
fi

# Create database (using root with no password)
echo "Creating database..."
sudo mysql -u root << 'EOF' || echo "Database setup may have failed. Please check MySQL credentials."
CREATE DATABASE IF NOT EXISTS student_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF

echo ""
echo "3. Importing database schema..."
if [ -f "backend/database/schema.sql" ]; then
    # Use root with no password
    sudo mysql -u root student_management < backend/database/schema.sql 2>/dev/null || {
        echo "Failed to import schema. Trying without sudo..."
        mysql -u root student_management < backend/database/schema.sql
    }
    echo "Database schema imported"
else
    echo "Error: schema.sql not found at backend/database/schema.sql"
    exit 1
fi

echo ""
echo "4. Updating configuration for Linux..."
# Backup original config
cp backend/config/Database.php backend/config/Database.php.backup

# Keep database configuration as default (root with no password)
echo "Keeping default database configuration (root with no password)..."

echo ""
echo "5. Setting up frontend..."
if [ -f "frontend/package.json" ]; then
    cd frontend
    echo "Installing Node.js dependencies..."
    npm install --silent
    cd ..
else
    echo "Warning: frontend/package.json not found"
fi

echo ""
echo "6. Creating startup scripts..."

# Create development startup script
cat > start_dev.sh << 'EOF'
#!/bin/bash
echo "Starting development servers..."
echo ""
echo "1. Starting PHP API server on port 8000..."
echo "   API: http://localhost:8000"
cd "$(dirname "$0")"
php -S 0.0.0.0:8000 -t backend &
PHP_PID=$!

echo ""
echo "2. Starting React frontend on port 3000..."
echo "   Frontend: http://localhost:3000"
cd frontend
npm start &
REACT_PID=$!

echo ""
echo "========================================="
echo "Servers are running!"
echo "========================================="
echo "Frontend: http://localhost:3000"
echo "API: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "========================================="

# Wait for Ctrl+C
trap "echo 'Stopping servers...'; kill $PHP_PID $REACT_PID 2>/dev/null; exit 0" INT
wait
EOF

chmod +x start_dev.sh

# Create XAMPP compatibility script
cat > xampp_setup.sh << 'EOF'
#!/bin/bash
echo "XAMPP Compatibility Setup"
echo ""
echo "For XAMPP on Windows:"
echo "1. Copy the entire project to: C:/xampp/htdocs/SMS-MVC/"
echo "2. Restore original database config:"
echo "   cp backend/config/Database.php.backup backend/config/Database.php"
echo "3. Start XAMPP (Apache + MySQL)"
echo "4. Import backend/database/schema.sql via phpMyAdmin"
echo "5. Access: http://localhost/SMS-MVC/frontend/public/index.html"
echo ""
echo "To switch back to Linux setup:"
echo "   ./setup.sh"
EOF

chmod +x xampp_setup.sh

echo ""
echo "========================================="
echo "SETUP COMPLETE!"
echo "========================================="
echo ""
echo "To start the application in development mode:"
echo "  ./start_dev.sh"
echo ""
echo "For XAMPP setup instructions:"
echo "  ./xampp_setup.sh"
echo ""
echo "Application will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  API: http://localhost:8000"
echo ""
echo "Default login credentials:"
echo "  Username: admin"
echo "  Password: admin"
echo ""
echo "Database credentials:"
echo "  Username: root (no password)"
echo "  Database: student_management"
echo ""
echo "To restore XAMPP configuration:"
echo "  cp backend/config/Database.php.backup backend/config/Database.php"
echo "========================================="