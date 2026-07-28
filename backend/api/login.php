<?php
// 1. Prevent any hidden PHP warnings or errors from corrupting the JSON output
ob_start(); 
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('html_errors', 0);

// 2. Include CORS configuration and set headers immediately
require_once __DIR__ . "/../config/cors.php";
setCorsHeaders();
header("Content-Type: application/json; charset=UTF-8");

// 3. Configure session parameters to allow cookie sharing across ports if necessary
session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'secure' => false,      // Set to true if running local HTTPS
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();

// 4. Secure Controller Loading
$controllerPath = __DIR__ . "/../controllers/AuthController.php";

if (!file_exists($controllerPath)) {
    ob_clean();
    echo json_encode(["status" => "error", "message" => "Controller file missing at: " . $controllerPath]);
    exit;
}

require_once $controllerPath;

// 5. Retrieve and validate incoming JSON input payload from React
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput);

if (!$data || empty($data->username) || empty($data->password)) {
    ob_clean();
    echo json_encode(["status" => "error", "message" => "Missing credentials in request body"]);
    exit;
}

// 6. Execute Login Logic
try {
    $auth = new AuthController();
    $user = $auth->login($data->username, $data->password);

    ob_clean(); // Wipe any stray output or notices from controllers
    
    if ($user) {
        $_SESSION['user'] = $user;
        $_SESSION['loggedIn'] = true;
        echo json_encode(["status" => "success", "user" => $user]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid username or password"]);
    }
} catch (Throwable $e) {
    ob_clean();
    echo json_encode(["status" => "error", "message" => "System Error: " . $e->getMessage()]);
}
?>