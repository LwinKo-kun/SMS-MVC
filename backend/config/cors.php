<?php
/**
 * CORS Configuration Helper
 * Dynamically allows access from localhost and any local network device
 */

function setCorsHeaders() {
    // Get the origin from the request
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // Define a regular expression to match localhost, 127.0.0.1, or local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    $localPattern = '/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}):\d+$/';
    
    // Check if the request origin matches our local development pattern
    if (!empty($origin) && preg_match($localPattern, $origin)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        // Fallback for non-matching origins
        header("Access-Control-Allow-Origin: http://localhost:3000");
    }
    
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Max-Age: 86400"); // 24 hours
    
    // Handle preflight OPTIONS request and terminate immediately
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit(0);
    }
}