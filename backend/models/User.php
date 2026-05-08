<?php
require_once __DIR__ . "/../config/Database.php";

class User {
    private $conn;
    private $table = "users";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->connect();
    }

public function login($username, $password) {
    if (!$this->conn) return false; 

    $query = "SELECT user_id, username, password, role FROM " . $this->table . " WHERE username = :username LIMIT 1";
    $stmt = $this->conn->prepare($query);
    $stmt->execute([':username' => $username]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        // 1. Try Hashed Comparison (The secure way)
        if (password_verify($password, $row['password'])) {
            unset($row['password']); 
            return $row;
        }

        // 2. Try Plain Text Comparison (The old way)
        if ($password === $row['password']) {
            unset($row['password']); 
            return $row;
        }
    }
    
    return false;
    }
}

?>