<?php
require_once __DIR__ . "/../models/User.php";

class AuthController {
    public function login($username, $password) {
        $userModel = new User();
        return $userModel->login($username, $password);
    }
}
?>