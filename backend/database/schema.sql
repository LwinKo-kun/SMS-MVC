-- Golden Ember SMS — full database rebuild
-- Run (PowerShell / CMD): mysql -u root -p < backend/database/schema.sql
-- Or paste into phpMyAdmin SQL tab.
--
-- WARNING: drops the entire `student_management` database.

SET NAMES utf8mb4;

DROP DATABASE IF EXISTS student_management;
CREATE DATABASE student_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_management;

-- ---------------------------------------------------------------------------
-- Users (session login)
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Students
-- ---------------------------------------------------------------------------
CREATE TABLE students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(64) DEFAULT '',
  course VARCHAR(255) DEFAULT '' COMMENT 'Informal cohort/note',
  gender VARCHAR(16) DEFAULT NULL,
  date_of_birth DATE DEFAULT NULL,
  address VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_students_email (email)
);

-- ---------------------------------------------------------------------------
-- Courses (schedule + duration)
-- ---------------------------------------------------------------------------
CREATE TABLE courses (
  course_id INT AUTO_INCREMENT PRIMARY KEY,
  course_name VARCHAR(255) NOT NULL,
  course_code VARCHAR(64) NOT NULL UNIQUE,
  credits INT NOT NULL DEFAULT 3,
  description TEXT,
  start_date DATE NOT NULL COMMENT 'First teaching day',
  duration_weeks INT UNSIGNED NOT NULL DEFAULT 12 COMMENT 'Length in weeks',
  status ENUM('planned','active','completed','cancelled') NOT NULL DEFAULT 'active',
  instructor VARCHAR(128) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Enrollments
-- ---------------------------------------------------------------------------
CREATE TABLE enrollments (
  enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enroll_date DATE NOT NULL,
  UNIQUE KEY uq_enrollment (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students (student_id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses (course_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- Attendance
-- ---------------------------------------------------------------------------
CREATE TABLE attendance (
  attendance_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  att_date DATE NOT NULL,
  status ENUM('present','absent','late') NOT NULL DEFAULT 'present',
  notes VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students (student_id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses (course_id) ON DELETE CASCADE,
  KEY idx_attendance_course_date (course_id, att_date)
);

-- ---------------------------------------------------------------------------
-- Grades (per student per course; multiple assessments via assessment_name)
-- ---------------------------------------------------------------------------
CREATE TABLE grades (
  grade_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  assessment_name VARCHAR(128) NOT NULL DEFAULT 'Course grade',
  score_percent DECIMAL(5,2) DEFAULT NULL COMMENT '0–100',
  letter_grade VARCHAR(8) DEFAULT NULL COMMENT 'e.g. A-, B+',
  notes VARCHAR(255) DEFAULT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_grade_assessment (student_id, course_id, assessment_name),
  FOREIGN KEY (student_id) REFERENCES students (student_id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses (course_id) ON DELETE CASCADE,
  KEY idx_grades_course (course_id)
);

-- ---------------------------------------------------------------------------
-- Seed data (plain password matches User.php fallback)
-- ---------------------------------------------------------------------------
INSERT INTO users (username, password, role) VALUES
  ('admin', 'admin', 'admin');

INSERT INTO courses (
  course_name, course_code, credits, description,
  start_date, duration_weeks, status, instructor
) VALUES
  ('Introduction to Programming', 'CS101', 4,
   'Algorithms and problem solving',
   CURDATE(), 15, 'active', 'Dr. Chen'),
  ('Database Systems', 'CS205', 3,
   'SQL, normalization, transactions',
   DATE_ADD(CURDATE(), INTERVAL 14 DAY), 12, 'planned', 'Prof. Okonkwo');

INSERT INTO students (name, email, phone, course, gender)
VALUES
  ('Alex Morgan', 'alex.morgan@school.edu', '555-0101', 'Morning cohort', 'other'),
  ('Sam Rivera', 'sam.rivera@school.edu', '555-0102', '', 'other');

INSERT INTO enrollments (student_id, course_id, enroll_date)
VALUES
  (1, 1, CURDATE()),
  (2, 1, CURDATE());

INSERT INTO attendance (student_id, course_id, att_date, status)
VALUES
  (1, 1, CURDATE(), 'present');

INSERT INTO grades (student_id, course_id, assessment_name, score_percent, letter_grade)
VALUES
  (1, 1, 'Midterm', 88.50, 'B+'),
  (2, 1, 'Midterm', 92.00, 'A-');
