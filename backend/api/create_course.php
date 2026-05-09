<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

session_start();

if (empty($_SESSION["loggedIn"])) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

require_once __DIR__ . "/../config/Database.php";
require_once __DIR__ . "/../models/Course.php";

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    $data = [];
}

$database = new Database();
$db = $database->connect();

$course = new Course($db);
$result = $course->create($data);

if (!empty($result["success"])) {
    echo json_encode([
        "status" => "success",
        "message" => "Course created",
    ]);
    exit;
}

http_response_code(400);
echo json_encode([
    "status" => "error",
    "message" => $result["message"] ?? "Could not create course",
]);
