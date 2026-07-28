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
require_once __DIR__ . "/../models/Attendance.php";

$database = new Database();
$db = $database->connect();

$limit = isset($_GET["limit"]) ? (int) $_GET["limit"] : 100;
$model = new Attendance($db);
echo json_encode($model->findRecent($limit));
