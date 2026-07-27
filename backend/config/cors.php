<?php
/**
 * CORS Configuration Helper
 * Allows access from localhost and local network devices
 */

function setCorsHeaders() {
    // Get the origin from the request
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // List of allowed origins
    $allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        // Add your local IP address
        'http://192.168.26.112:3000',
        'http://192.168.26.112:3001',
    ];
    
    // Check if origin is in allowed list
    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        // For development, you can use wildcard, but it's less secure
        // header("Access-Control-Allow-Origin: *");
        // Instead, we'll allow localhost only if origin not in list
        header("Access-Control-Allow-Origin: http://localhost:3000");
    }
    
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Max-Age: 86400"); // 24 hours
    
    // Handle preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}
?>