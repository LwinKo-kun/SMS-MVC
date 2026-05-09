<?php

require_once __DIR__ . "/../models/Student.php";

class StudentController {

    private $student;

    public function __construct() {
        $this->student = new Student();
    }

    public function index() {
        return $this->student->getStudents();
    }

    /**
     * @return array{success:bool, message?:string}
     */
    public function store($data) {
        return $this->student->createStudent($data);
    }

    /**
     * @return array{success:bool, message?:string}
     */
    public function update($data) {
        return $this->student->updateStudent($data);
    }

    /**
     * @return array{success:bool, message?:string}
     */
    public function destroy($id) {
        return $this->student->deleteStudent($id);
    }
}
