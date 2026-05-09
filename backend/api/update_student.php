<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
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

require_once __DIR__ . "/../controllers/StudentController.php";

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data) || empty($data["student_id"])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "student_id required"]);
    exit;
}

$controller = new StudentController();
$result = $controller->update($data);

if (!empty($result["success"])) {
    echo json_encode(["status" => "success"]);
    exit;
}

http_response_code(400);
echo json_encode([
    "status" => "error",
    "message" => $result["message"] ?? "Update failed",
]);
