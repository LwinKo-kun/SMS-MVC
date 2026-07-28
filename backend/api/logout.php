<?php

// Include CORS configuration
require_once __DIR__ . "/../config/cors.php";
setCorsHeaders();

header("Content-Type: application/json");

session_start();

session_unset();

session_destroy();

echo json_encode([
    "status" => "success"
]);

?>