# 🔥 Student Management System (MVC + REST API)

A full-stack **Student Management System** built using:
- PHP (MVC Architecture)
- MySQL Database
- JavaScript (Fetch API)
- HTML/CSS Frontend

The system manages students, courses, attendance, grades, enrollments, and user authentication.

---

# 🚀 Features

## 👤 Authentication
- Admin / Teacher login system
- Session-based authentication
- Secure password storage (MD5 used in current version)

## 🎓 Student Management
- Add / View / Update / Delete students
- Student profile management

## 📚 Course Management
- Create and manage courses
- Course codes and credits support

## 📝 Enrollment System
- Assign students to courses
- Track enrollment dates

## 📊 Grades System
- Store student grades per course
- Simple grade tracking

## 📅 Attendance System
- Mark attendance (present / absent / late)
- Track per student per course

---

# 🧱 Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: PHP (MVC pattern)
- Database: MySQL (MariaDB via XAMPP)
- API: REST-style PHP endpoints
- Architecture: MVC (Model - View - Controller)

---

# 🗄️ Database Structure

## 📌 Tables Overview

### 👤 users
Stores login accounts.

- user_id (PK)
- username
- password (MD5 hashed)
- role (admin / teacher)
- created_at

---

### 🎓 students
Stores student information.

- student_id (PK)
- full_name
- email
- phone
- gender
- date_of_birth
- address
- created_at

---

### 📚 courses
Stores course data.

- course_id (PK)
- course_name
- course_code (unique)
- credits
- description

---

### 📝 enrollments
Links students with courses.

- enrollment_id (PK)
- student_id (FK)
- course_id (FK)
- enroll_date

---

### 📊 grades
Stores student grades.

- grade_id (PK)
- student_id (FK)
- course_id (FK)
- grade

---

### 📅 attendance
Tracks student attendance.

- attendance_id (PK)
- student_id (FK)
- course_id (FK)
- date
- status (present / absent / late)

---

# ⚙️ System Architecture
- Frontend (HTML + JS)
- ↓
- REST API (PHP)
- ↓
- Controller (MVC)
- ↓
- Model (Database Queries)
- ↓
- MySQL Database


---

# 🔐 Login System

- Session-based authentication using PHP
- User roles:
  - Admin
  - Teacher

---

# 📡 API Structure (Example)

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/auth.php | POST | Login user |
| /api/session.php | GET | Check session |
| /api/students.php | GET/POST | Manage students |

---

# 🧠 How It Works

1. User logs in via login page
2. JavaScript sends request to PHP API
3. Controller validates user via Model
4. PHP creates session
5. Frontend checks session before access
6. Data is fetched from MySQL

---

# 🔥 Future Improvements

- Replace MD5 with `password_hash()`
- Add JWT authentication
- Build React frontend
- Add dashboard analytics
- Improve role-based access control
- Add API pagination and filtering

---

# 👨‍💻 Author

Student Project - MVC Learning System  
Built for educational purposes in Computer Science studies.

---

# ⚡ Notes

- Run using XAMPP (Apache + MySQL)
- Place project inside `htdocs`
- Access via: http://localhost/student-MVC/public/login.html