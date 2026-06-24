<?php
/**
 * Test script to verify PHP and database setup
 */

echo "=== Student Management System Setup Test ===\n\n";

// Test 1: PHP Version
echo "1. PHP Version: " . phpversion() . "\n";

// Test 2: PHP Extensions
$required_extensions = ['pdo_mysql', 'mysqli', 'json', 'mbstring'];
echo "2. PHP Extensions:\n";
foreach ($required_extensions as $ext) {
    echo "   - $ext: " . (extension_loaded($ext) ? "✓ Installed" : "✗ Missing") . "\n";
}

// Test 3: Database Connection
echo "\n3. Database Connection Test:\n";

try {
    $host = "localhost";
    $dbname = "student_management";
    $username = "root";
    $password = "";
    
    // Try PDO connection with root (no password)
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "   - PDO Connection: ✓ Successful\n";
    
    // Test query
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "   - Tables found: " . count($tables) . " tables\n";
    
    if (count($tables) > 0) {
        echo "   - Table list: " . implode(", ", $tables) . "\n";
    }
    
} catch (PDOException $e) {
    echo "   - Connection Failed: " . $e->getMessage() . "\n";
}

// Test 4: API Endpoints
echo "\n4. API Endpoints Test:\n";
$api_files = [
    'session.php',
    'login.php',
    'get_students.php',
    'get_courses.php'
];

foreach ($api_files as $file) {
    $file_path = __DIR__ . "/backend/api/$file";
    if (file_exists($file_path)) {
        echo "   - $file: ✓ Found\n";
    } else {
        echo "   - $file: ✗ Missing\n";
    }
}

// Test 5: Frontend Files
echo "\n5. Frontend Files Test:\n";
$frontend_files = [
    'frontend/src/App.js',
    'frontend/package.json',
    'frontend/public/index.html'
];

foreach ($frontend_files as $file) {
    $file_path = __DIR__ . "/$file";
    if (file_exists($file_path)) {
        echo "   - $file: ✓ Found\n";
    } else {
        echo "   - $file: ✗ Missing\n";
    }
}

echo "\n=== Test Complete ===\n\n";

echo "Recommendations:\n";
echo "1. Database configuration should be: username='root', password='' (empty)\n";
echo "2. Run: mysql -u root student_management < backend/database/schema.sql\n";
echo "3. This matches XAMPP default configuration\n";

?>