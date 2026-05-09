# 🎓 Student Management System
### PHP MVC + REST API + MySQL

A full-stack **Student Management System** built using **PHP MVC Architecture** and **REST API principles**.  
This system manages students, courses, enrollments, attendance, grades, and authentication.

🔗 Repository: https://github.com/LwinKo-kun/SMS-MVC.git

---

# 📸 Project Overview

## 🧩 System Flowchart

```mermaid
flowchart TD

A[User Opens Website] --> B[Login Page]

B --> C{Authentication}

C -->|Valid Login| D[Dashboard]
C -->|Invalid Login| E[Error Message]

D --> F[Student Management]
D --> G[Course Management]
D --> H[Enrollment Management]
D --> I[Attendance Management]
D --> J[Grades Management]

F --> K[(MySQL Database)]
G --> K
H --> K
I --> K
J --> K
```

---

# 🏗️ MVC Architecture

```mermaid
flowchart LR

A[Frontend HTML CSS JavaScript]
--> B[REST API]

B --> C[Controller]

C --> D[Model]

D --> E[(MySQL Database)]

E --> D
D --> C
C --> A
```

---

# 🗄️ Database ER Diagram

```mermaid
erDiagram

USERS {
    int user_id PK
    varchar username
    varchar password
    varchar role
    datetime created_at
}

STUDENTS {
    int student_id PK
    varchar full_name
    varchar email
    varchar phone
    varchar gender
    date date_of_birth
    text address
    datetime created_at
}

COURSES {
    int course_id PK
    varchar course_name
    varchar course_code
    int credits
    text description
}

ENROLLMENTS {
    int enrollment_id PK
    int student_id FK
    int course_id FK
    date enroll_date
}

GRADES {
    int grade_id PK
    int student_id FK
    int course_id FK
    varchar grade
}

ATTENDANCE {
    int attendance_id PK
    int student_id FK
    int course_id FK
    date attendance_date
    varchar status
}

STUDENTS ||--o{ ENROLLMENTS : enrolls
COURSES ||--o{ ENROLLMENTS : contains

STUDENTS ||--o{ GRADES : receives
COURSES ||--o{ GRADES : gives

STUDENTS ||--o{ ATTENDANCE : has
COURSES ||--o{ ATTENDANCE : tracks
```

---

# 🚀 Features

## 🔐 Authentication System
- Admin & Teacher Login
- Session-Based Authentication
- Role Management
- Secure API Validation

---

## 👨‍🎓 Student Management
- Add Students
- Update Student Information
- Delete Students
- View Student Profiles

---

## 📚 Course Management
- Create Courses
- Manage Credits
- Course Descriptions
- Unique Course Codes

---

## 📝 Enrollment Management
- Assign Students to Courses
- Track Enrollment Dates
- Manage Student-Course Relationships

---

## 📊 Grades System
- Store Grades Per Course
- Academic Performance Tracking
- Student Grade Records

---

## 📅 Attendance System
- Present / Absent / Late Status
- Attendance Tracking
- Course-Based Attendance Records

---

# 🧱 Technology Stack

| Layer | Technology |
|------|-------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | PHP |
| Architecture | MVC |
| Database | MySQL / MariaDB |
| API | REST API |
| Server | Apache (XAMPP) |

---

# 📂 Project Structure

```bash
student-MVC/
│
├── app/
│   ├── controllers/
│   ├── models/
│   └── views/
│
├── api/
│
├── config/
│
├── database/
│
├── public/
│   ├── assets/
│   ├── login.html
│   └── dashboard.html
│
└── README.md
```

---

# 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth.php` | POST | Login User |
| `/api/session.php` | GET | Check Session |
| `/api/students.php` | GET/POST | Manage Students |
| `/api/courses.php` | GET/POST | Manage Courses |
| `/api/enrollments.php` | GET/POST | Manage Enrollments |
| `/api/grades.php` | GET/POST | Manage Grades |
| `/api/attendance.php` | GET/POST | Manage Attendance |

---

# ⚙️ System Workflow

```mermaid
sequenceDiagram

participant User
participant Frontend
participant API
participant Controller
participant Model
participant Database

User->>Frontend: Login Request
Frontend->>API: Fetch API Request
API->>Controller: Process Request
Controller->>Model: Validate Data
Model->>Database: Execute Query
Database-->>Model: Return Result
Model-->>Controller: Response
Controller-->>Frontend: JSON Response
Frontend-->>User: Update UI
```

---

# 🔐 Authentication Workflow

```mermaid
flowchart TD

A[User Login]
--> B[PHP API]

B --> C{Valid Credentials?}

C -->|Yes| D[Create Session]
D --> E[Redirect Dashboard]

C -->|No| F[Display Error Message]
```

---

# 💻 Installation Guide

## 📌 Requirements
- PHP 8+
- MySQL / MariaDB
- XAMPP
- Modern Browser

---

## ⚡ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/LwinKo-kun/SMS-MVC.git
```

---

### 2️⃣ Move Project

Place inside:

```bash
C:/xampp/htdocs/
```

---

### 3️⃣ Create Database

Open phpMyAdmin and create:

```sql
student_management
```

---

### 4️⃣ Import SQL File

Import the SQL file from:

```bash
/database
```

---

### 5️⃣ Start XAMPP

Start:
- Apache
- MySQL

---

### 6️⃣ Run Project

```bash
http://localhost/student-MVC/public/login.html
```

---

# 🧠 How The System Works

1. User logs into the system
2. Frontend sends Fetch API request
3. PHP API processes request
4. Controller handles business logic
5. Model interacts with MySQL database
6. JSON response returns to frontend
7. UI updates dynamically

---

# 🔥 Future Improvements

- Replace MD5 with `password_hash()`
- Add JWT Authentication
- React Frontend
- Dashboard Analytics
- Export PDF/Excel Reports
- Pagination & Filtering
- Responsive Mobile UI
- Advanced Role Permissions

---

# 🎯 Learning Objectives

This project demonstrates:

- MVC Architecture
- REST API Development
- CRUD Operations
- Session Authentication
- Database Relationships
- Frontend & Backend Integration
- MySQL Query Design

---

# 👨‍💻 Author

### Lwin Ko Ko Aung
Computer Science Student

Educational project for learning full-stack development with PHP MVC and REST APIs.

---

# 📜 License

This project is developed for educational purposes only.

Repository: https://github.com/LwinKo-kun/SMS-MVC.git
