<?php
// 1. MUST BE AT THE VERY TOP
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// 2. Handle Preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

session_start();
header("Content-Type: application/json");

$response = ["loggedIn" => false];

if (isset($_SESSION['loggedIn']) && $_SESSION['loggedIn'] === true) {
    $response = [
        "loggedIn" => true,
        "user" => $_SESSION['user']
    ];
}

echo json_encode($response);