<?php
// 1. Prevent ANY hidden text/warnings from leaking out
ob_start(); 
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('html_errors', 0);

// 2. Headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

session_start();

// 3. SECURE FILE LOADING
// If this file is missing, PHP usually crashes with an HTML error.
$controllerPath = __DIR__ . "/../controllers/AuthController.php";

if (!file_exists($controllerPath)) {
    ob_clean(); // Wipe the "File Not Found" HTML error
    echo json_encode(["status" => "error", "message" => "Controller file missing at: " . $controllerPath]);
    exit;
}

require_once $controllerPath;

// 4. Get Input
$data = json_decode(file_get_contents("php://input"));

if (!$data || empty($data->username) || empty($data->password)) {
    ob_clean();
    echo json_encode(["status" => "error", "message" => "Missing credentials"]);
    exit;
}

try {
    $auth = new AuthController();
    $user = $auth->login($data->username, $data->password);

    ob_clean(); // Clear any accidental echos from the controller
    if ($user) {
        $_SESSION['user'] = $user;
        $_SESSION['loggedIn'] = true;
        echo json_encode(["status" => "success", "user" => $user]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
    }
} catch (Throwable $e) { // Throwable catches both Errors and Exceptions
    ob_clean();
    echo json_encode(["status" => "error", "message" => "System Error: " . $e->getMessage()]);
}