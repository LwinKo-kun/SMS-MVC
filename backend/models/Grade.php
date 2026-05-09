<?php

class Grade {

    private $conn;

    public function __construct(PDO $db) {
        $this->conn = $db;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function findRecent(int $limit = 120): array {
        $limit = max(1, min(500, $limit));
        $sql = "SELECT g.grade_id, g.student_id, s.name AS student_name,
                       g.course_id, c.course_code, c.course_name,
                       g.assessment_name, g.score_percent, g.letter_grade,
                       g.notes, g.recorded_at
                FROM grades g
                INNER JOIN students s ON s.student_id = g.student_id
                INNER JOIN courses c ON c.course_id = g.course_id
                ORDER BY g.recorded_at DESC, g.grade_id DESC
                LIMIT " . $limit;

        return $this->conn->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param array<string, mixed> $row
     * @return array{success:bool, message?:string}
     */
    public function save(array $row): array {
        $studentId = (int) ($row["student_id"] ?? 0);
        $courseId = (int) ($row["course_id"] ?? 0);
        $assessment = trim((string) ($row["assessment_name"] ?? "Course grade"));
        $score = $row["score_percent"];
        $letter = trim((string) ($row["letter_grade"] ?? ""));
        $notes = trim((string) ($row["notes"] ?? ""));

        if ($studentId <= 0 || $courseId <= 0) {
            return ["success" => false, "message" => "Student and course are required"];
        }

        if ($assessment === "") {
            $assessment = "Course grade";
        }

        $scoreSql = null;
        if ($score !== null && $score !== "") {
            $scoreSql = round((float) $score, 2);
            if ($scoreSql < 0 || $scoreSql > 100) {
                return ["success" => false, "message" => "Score must be between 0 and 100"];
            }
        }

        $letterSql = $letter === "" ? null : substr($letter, 0, 8);

        $sql = "INSERT INTO grades (student_id, course_id, assessment_name, score_percent, letter_grade, notes)
                VALUES (:sid, :cid, :an, :score, :letter, :notes)
                ON DUPLICATE KEY UPDATE
                  score_percent = VALUES(score_percent),
                  letter_grade = VALUES(letter_grade),
                  notes = VALUES(notes),
                  recorded_at = CURRENT_TIMESTAMP";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ":sid" => $studentId,
                ":cid" => $courseId,
                ":an" => $assessment,
                ":score" => $scoreSql,
                ":letter" => $letterSql,
                ":notes" => $notes === "" ? null : $notes,
            ]);

            return ["success" => true];
        } catch (PDOException $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }
}
