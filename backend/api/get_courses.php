<?php

// Include CORS configuration
require_once __DIR__ . "/../config/cors.php";
setCorsHeaders();
header("Content-Type: application/json");

session_start();

if (empty($_SESSION["loggedIn"])) {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

require_once __DIR__ . "/../config/Database.php";
require_once __DIR__ . "/../models/Course.php";

$database = new Database();
$db = $database->connect();

$courseModel = new Course($db);
echo json_encode($courseModel->findAll());
