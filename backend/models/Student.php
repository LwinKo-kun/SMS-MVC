<?php

require_once __DIR__ . "/../config/Database.php";

class Student {

    private $conn;
    private $table = "students";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->connect();
    }

    /**
     * @param mixed $data JSON-decoded object or associative array from API
     */
    private function normalizeRow($data): array {
        if (is_object($data)) {
            $data = json_decode(json_encode($data), true);
        }
        if (!is_array($data)) {
            return [];
        }

        return [
            "student_id" => isset($data["student_id"]) ? (int) $data["student_id"] : null,
            "name" => trim((string) ($data["name"] ?? "")),
            "email" => trim((string) ($data["email"] ?? "")),
            "phone" => trim((string) ($data["phone"] ?? "")),
            "course" => trim((string) ($data["course"] ?? "")),
        ];
    }

    public function getStudents() {

        $query = "SELECT * FROM " . $this->table . " ORDER BY student_id DESC";

        $stmt = $this->conn->prepare($query);

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * @return array{success:bool, message?:string}
     */
    public function createStudent($data): array {

        $r = $this->normalizeRow($data);

        if ($r["name"] === "" || $r["email"] === "") {
            return [
                "success" => false,
                "message" => "Name and email are required",
            ];
        }

        $query = "INSERT INTO " . $this->table . "
                (name, email, phone, course)
                VALUES
                (:name, :email, :phone, :course)";

        try {
            $stmt = $this->conn->prepare($query);
            $ok = $stmt->execute([
                ":name" => $r["name"],
                ":email" => $r["email"],
                ":phone" => $r["phone"],
                ":course" => $r["course"],
            ]);

            if (!$ok) {
                return ["success" => false, "message" => "Insert failed"];
            }

            return [
                "success" => true,
                "student_id" => (int) $this->conn->lastInsertId(),
            ];
        } catch (PDOException $e) {
            return ["success" => false, "message" => $this->translateDbError($e)];
        }
    }

    /**
     * @return array{success:bool, message?:string}
     */
    public function updateStudent($data): array {

        $r = $this->normalizeRow($data);

        if (!$r["student_id"]) {
            return ["success" => false, "message" => "student_id required"];
        }

        if ($r["name"] === "" || $r["email"] === "") {
            return ["success" => false, "message" => "Name and email are required"];
        }

        $query = "UPDATE " . $this->table . "
                SET
                    name = :name,
                    email = :email,
                    phone = :phone,
                    course = :course
                WHERE student_id = :student_id";

        try {
            $stmt = $this->conn->prepare($query);
            $ok = $stmt->execute([
                ":student_id" => $r["student_id"],
                ":name" => $r["name"],
                ":email" => $r["email"],
                ":phone" => $r["phone"],
                ":course" => $r["course"],
            ]);

            if (!$ok) {
                return ["success" => false, "message" => "Update failed"];
            }

            return ["success" => true];
        } catch (PDOException $e) {
            return ["success" => false, "message" => $this->translateDbError($e)];
        }
    }

    /**
     * @return array{success:bool, message?:string}
     */
    public function deleteStudent($id): array {

        $id = (int) $id;
        if ($id <= 0) {
            return ["success" => false, "message" => "Invalid student id"];
        }

        $query = "DELETE FROM " . $this->table . "
                WHERE student_id = :id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([":id" => $id]);

            return ["success" => true];
        } catch (PDOException $e) {
            return ["success" => false, "message" => $this->translateDbError($e)];
        }
    }

    private function translateDbError(PDOException $e): string {
        $msg = $e->getMessage();
        if (
            strpos($msg, "Duplicate") !== false ||
            strpos($msg, "1062") !== false ||
            (string) $e->getCode() === "23000"
        ) {
            return "That email is already registered.";
        }
        if (strpos($msg, "Unknown column") !== false) {
            return "Database columns are out of date. Import backend/database/schema.sql or add missing columns (name, email, phone, course).";
        }
        if (strpos($msg, "doesn't exist") !== false || strpos($msg, "Unknown table") !== false) {
            return "Database table missing. Import backend/database/schema.sql.";
        }

        return "Database error: " . $msg;
    }
}
