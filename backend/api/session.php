<?php

// Include CORS configuration
require_once __DIR__ . "/../config/cors.php";
setCorsHeaders();

header("Content-Type: application/json");

session_start();

$response = [
    "loggedIn" => false
];

if (
    isset($_SESSION['loggedIn']) &&
    $_SESSION['loggedIn'] === true
) {

    $response = [
        "loggedIn" => true,
        "user" => $_SESSION['user']
    ];
}

echo json_encode($response);

?>