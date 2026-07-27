<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        $this->loadEnvFile();
        $this->host = getenv('DB_HOST') ?: 'localhost';
        $this->db_name = getenv('DB_NAME') ?: 'student_management';
        $this->username = getenv('DB_USER') !== false ? getenv('DB_USER') : 'root';
        $this->password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : 'Root@123456!';
    }

    private function loadEnvFile() {
        $envFile = dirname(__DIR__, 2) . '/.env';

        if (!is_readable($envFile)) {
            return;
        }

        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#') {
                continue;
            }

            if (strpos($line, '=') === false) {
                continue;
            }

            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);

            if (getenv($key) === false) {
                putenv("$key=$value");
                $_ENV[$key] = $value;
            }
        }
    }

    public function connect() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Database Error: " . $e->getMessage()
            ]);
            exit;
        }

        return $this->conn;
    }
}
?>