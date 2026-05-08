<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
session_start();

// Simple Auth Guard
if (!isset($_SESSION['loggedIn'])) {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

require_once __DIR__ . "/../config/Database.php";
$conn = (new Database())->connect();
$method = $_SERVER['REQUEST_METHOD'];

if ($method == "GET") {
    $stmt = $conn->query("SELECT * FROM students");
    $data = $stmt->fetchAll();
    echo json_encode($data);
}

if ($method == "POST") {
    $data = json_decode(file_get_contents("php://input"));
    
    if(!isset($data->name)) {
        echo json_encode(["error" => "Name is required"]);
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO students (name, email, phone) VALUES (?, ?, ?)");
    $stmt->execute([$data->name, $data->email, $data->phone]);

    echo json_encode(["message" => "Student added successfully"]);
}
?>