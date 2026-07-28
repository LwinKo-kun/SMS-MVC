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

require_once __DIR__ . "/../controllers/StudentController.php";

$controller = new StudentController();

$students = $controller->index();

echo json_encode($students);

?>