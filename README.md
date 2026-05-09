# 🔥 Student Management System (MVC + REST API)

[![PHP Version](https://img.shields.io/badge/php-%5E7.4%20%7C%208.x-777bb4.svg)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A robust, full-stack Student Management System built using a custom **MVC (Model-View-Controller)** architecture. This project features a decoupled frontend that communicates with a PHP-based REST API using the JavaScript Fetch API.

---

## 🗺️ System Architecture & Flow

This diagram illustrates how the system processes a request, from the user interaction to the database response.

```mermaid
graph TD
    subgraph Frontend
        UI[HTML/CSS/JS]
        Fetch[Fetch API / AJAX]
    end

    subgraph Backend_MVC
        Router[API Endpoint .php]
        Controller[Controller Class]
        Model[Model / SQL Logic]
    end

    DB[(MySQL Database)]

    UI -->|User Interaction| Fetch
    Fetch -->|JSON Request| Router
    Router -->|Instantiates| Controller
    Controller -->|Calls Methods| Model
    Model -->|SQL Queries| DB
    DB -->|Result Set| Model
    Model -->|Returns Objects/Arrays| Controller
    Controller -->|Encodes JSON| Fetch
    Fetch -->|Updates DOM| UI

erDiagram
    USERS {
        int user_id PK
        string username
        string password
        string role
    }
    STUDENTS {
        int student_id PK
        string full_name
        string email
        string phone
        string gender
        date dob
    }
    COURSES {
        int course_id PK
        string course_name
        string course_code
        int credits
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
        string grade
    }
    ATTENDANCE {
        int attendance_id PK
        int student_id FK
        int course_id FK
        date date
        string status
    }

    STUDENTS ||--o{ ENROLLMENTS : "registers"
    COURSES ||--o{ ENROLLMENTS : "includes"
    STUDENTS ||--o{ GRADES : "receives"
    COURSES ||--o{ GRADES : "evaluates"
    STUDENTS ||--o{ ATTENDANCE : "marks"
    COURSES ||--o{ ATTENDANCE : "tracks"

student-management-system/
├── api/                # REST API Entry Points
├── controllers/        # Logic & Request Handling
├── models/             # Database Queries (PDO)
├── config/             # DB Connection (Database.php)
├── public/             # Assets & Frontend
│   ├── css/            # Stylesheets
│   ├── js/             # Frontend Logic (Fetch calls)
│   └── views/          # HTML Templates
├── db/                 # SQL Schema Exports
└── index.php           # App Entry Point
