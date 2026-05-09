<?php

class Attendance {

    private $conn;

    public function __construct(PDO $db) {
        $this->conn = $db;
    }

    public function findRecent(int $limit = 100): array {
        $limit = max(1, min(500, $limit));
        $sql = "SELECT a.attendance_id, a.student_id, s.name AS student_name,
                       a.course_id, c.course_name, a.att_date, a.status
                FROM attendance a
                INNER JOIN students s ON s.student_id = a.student_id
                INNER JOIN courses c ON c.course_id = a.course_id
                ORDER BY a.att_date DESC, a.attendance_id DESC
                LIMIT " . $limit;

        return $this->conn->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * @return array{success:bool, message?:string}
     */
    public function create(array $row): array {
        $studentId = (int) ($row["student_id"] ?? 0);
        $courseId = (int) ($row["course_id"] ?? 0);
        $date = trim((string) ($row["att_date"] ?? ""));
        $status = trim((string) ($row["status"] ?? "present"));

        if ($studentId <= 0 || $courseId <= 0 || $date === "") {
            return ["success" => false, "message" => "Student, course, and date are required"];
        }

        if (!in_array($status, ["present", "absent", "late"], true)) {
            $status = "present";
        }

        $sql = "INSERT INTO attendance (student_id, course_id, att_date, status)
                VALUES (:sid, :cid, :d, :st)";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ":sid" => $studentId,
                ":cid" => $courseId,
                ":d" => $date,
                ":st" => $status,
            ]);

            return ["success" => true];
        } catch (PDOException $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }
}
