<?php
// Include CORS configuration
require_once __DIR__ . "/../config/cors.php";
setCorsHeaders();
header("Content-Type: application/json");

require_once __DIR__ . "/../config/Database.php";
require_once __DIR__ . "/../models/Report.php";

$database = new Database();
$db = $database->connect();

$reportModel = new Report($db);
$stats = $reportModel->getSummaryStats();

echo json_encode($stats);
?>