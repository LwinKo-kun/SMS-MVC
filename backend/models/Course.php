<?php

class Course {

    private $conn;
    private $table = "courses";

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function findAll(): array {
        $query = "SELECT course_id, course_name, course_code, credits, description,
                         start_date, duration_weeks, status, instructor,
                         DATE_ADD(start_date, INTERVAL duration_weeks WEEK) AS end_date
                  FROM " . $this->table . "
                  ORDER BY start_date ASC, course_name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param array<string, mixed> $row
     * @return array{success:bool, message?:string}
     */
    public function create(array $row): array {
        $name = trim((string) ($row["course_name"] ?? ""));
        $code = strtoupper(trim((string) ($row["course_code"] ?? "")));
        $code = preg_replace("/\s+/", "", $code);
        $credits = (int) ($row["credits"] ?? 3);
        $desc = trim((string) ($row["description"] ?? ""));
        $startRaw = trim((string) ($row["start_date"] ?? ""));
        $durationWeeks = (int) ($row["duration_weeks"] ?? 12);
        $status = trim((string) ($row["status"] ?? "active"));
        $instructor = trim((string) ($row["instructor"] ?? ""));

        if ($name === "" || $code === "") {
            return ["success" => false, "message" => "Course title and code are required"];
        }

        if ($startRaw === "") {
            return ["success" => false, "message" => "Start date is required"];
        }

        $startDt = date_create($startRaw);
        if (!$startDt) {
            return ["success" => false, "message" => "Invalid start date"];
        }
        $startSql = $startDt->format("Y-m-d");

        if ($durationWeeks < 1) {
            $durationWeeks = 1;
        }
        if ($durationWeeks > 104) {
            $durationWeeks = 104;
        }

        if ($credits < 1) {
            $credits = 1;
        }
        if ($credits > 12) {
            $credits = 12;
        }

        $allowedStatus = ["planned", "active", "completed", "cancelled"];
        if (!in_array($status, $allowedStatus, true)) {
            $status = "active";
        }

        $sql = "INSERT INTO " . $this->table . "
                (course_name, course_code, credits, description,
                 start_date, duration_weeks, status, instructor)
                VALUES
                (:name, :code, :credits, :desc, :start_date, :weeks, :status, :instructor)";

        try {
            $stmt = $this->conn->prepare($sql);
            $ok = $stmt->execute([
                ":name" => $name,
                ":code" => $code,
                ":credits" => $credits,
                ":desc" => $desc === "" ? null : $desc,
                ":start_date" => $startSql,
                ":weeks" => $durationWeeks,
                ":status" => $status,
                ":instructor" => $instructor === "" ? null : $instructor,
            ]);

            if (!$ok) {
                return ["success" => false, "message" => "Could not save course"];
            }

            return ["success" => true];
        } catch (PDOException $e) {
            $msg = $e->getMessage();
            if (
                strpos($msg, "Duplicate") !== false ||
                strpos($msg, "1062") !== false
            ) {
                return ["success" => false, "message" => "That course code is already in use."];
            }

            return ["success" => false, "message" => "Database error: " . $msg];
        }
    }

    /** @deprecated Use findAll() */
    public function read() {
        return $this->findAll();
    }
}
