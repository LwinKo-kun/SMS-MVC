<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

session_start();

if (empty($_SESSION["loggedIn"])) {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

require_once __DIR__ . "/../config/Database.php";
require_once __DIR__ . "/../models/Report.php";
require_once __DIR__ . "/../models/Grade.php";

$database = new Database();
$db = $database->connect();

$report = new Report($db);
$grades = new Grade($db);

echo json_encode([
    "stats" => $report->getSummaryStats(),
    "enrollments" => $report->getRecentEnrollments(50),
    "attendance_by_course" => $report->getAttendanceSummaryByCourse(),
    "grades" => $grades->findRecent(100),
    "grade_overview" => $report->getGradeOverview(),
]);
