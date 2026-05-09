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

require_once __DIR__ . "/../controllers/StudentController.php";

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = [];
}

$controller = new StudentController();
$result = $controller->store($data);

if (!empty($result["success"])) {
    $out = [
        "status" => "success",
        "message" => "Student created",
    ];
    if (!empty($result["student_id"])) {
        $out["student_id"] = $result["student_id"];
    }
    echo json_encode($out);
    exit;
}

http_response_code(400);
echo json_encode([
    "status" => "error",
    "message" => $result["message"] ?? "Could not create student",
]);
