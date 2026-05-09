<?php
class Report {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get system-wide statistics for the Dashboard
    public function getSummaryStats() {
        $stats = [];
        $stats['students'] = $this->conn->query("SELECT COUNT(*) FROM students")->fetchColumn();
        $stats['courses'] = $this->conn->query("SELECT COUNT(*) FROM courses")->fetchColumn();
        $stats['enrollments'] = $this->conn->query("SELECT COUNT(*) FROM enrollments")->fetchColumn();
        $stats['grade_entries'] = $this->conn->query("SELECT COUNT(*) FROM grades")->fetchColumn();
        return $stats;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getRecentEnrollments(int $limit = 40): array {
        $limit = max(1, min(200, $limit));
        $sql = "SELECT e.enrollment_id, e.enroll_date, s.name AS student_name,
                       s.email AS student_email, c.course_name, c.course_code
                FROM enrollments e
                INNER JOIN students s ON s.student_id = e.student_id
                INNER JOIN courses c ON c.course_id = e.course_id
                ORDER BY e.enroll_date DESC, e.enrollment_id DESC
                LIMIT " . $limit;

        return $this->conn->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getAttendanceSummaryByCourse(): array {
        $sql = "SELECT c.course_name, c.course_code,
                       SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_count,
                       SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absent_count,
                       SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) AS late_count
                FROM courses c
                LEFT JOIN attendance a ON a.course_id = c.course_id
                GROUP BY c.course_id, c.course_name, c.course_code
                ORDER BY c.course_name ASC";

        return $this->conn->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getGradeOverview(): array {
        $sql = "SELECT c.course_code, c.course_name,
                       COUNT(DISTINCT g.student_id) AS students_graded,
                       AVG(g.score_percent) AS avg_score_percent
                FROM courses c
                LEFT JOIN grades g ON g.course_id = c.course_id AND g.score_percent IS NOT NULL
                GROUP BY c.course_id, c.course_code, c.course_name
                ORDER BY c.course_code ASC";

        return $this->conn->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }
}
