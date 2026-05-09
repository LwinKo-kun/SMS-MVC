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

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    $data = [];
}

$studentId = (int) ($data["student_id"] ?? 0);
$courseId = (int) ($data["course_id"] ?? 0);
$enrollDate = trim((string) ($data["enroll_date"] ?? date("Y-m-d")));

if ($studentId <= 0 || $courseId <= 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "student_id and course_id required"]);
    exit;
}

require_once __DIR__ . "/../config/Database.php";

$database = new Database();
$db = $database->connect();

$sql = "INSERT INTO enrollments (student_id, course_id, enroll_date)
        VALUES (:sid, :cid, :ed)";

try {
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ":sid" => $studentId,
        ":cid" => $courseId,
        ":ed" => $enrollDate,
    ]);
    echo json_encode(["status" => "success"]);
} catch (PDOException $e) {
    $msg = $e->getMessage();
    if (strpos($msg, "Duplicate") !== false || strpos($msg, "1062") !== false) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Student is already enrolled in this course."]);
        exit;
    }
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $msg]);
}
