# Xebia LMS Portal

---

## Overview

Xebia LMS Portal is a scalable enterprise-grade Learning Management System built using a modern full-stack architecture combining a React frontend with a Java Spring Boot backend.

The platform is designed to support:

* Course Management
* Student Management
* Learning Analytics
* Modular Content Delivery
* Secure Authentication
* REST API Integrations
* Dashboard Visualizations

The project integrates PostgreSQL, Flyway migrations, Spring Security, MapStruct DTO mappings, and interactive analytics using Recharts.

---

# Technology Stack

## Frontend

* React 18
* Vite
* Vanilla CSS
* JavaScript

### Additional Libraries

* React Router DOM v7
* Recharts
* Lucide React

---

## Backend

* Java 17
* Spring Boot
* PostgreSQL
* Maven

### Backend Features

* Spring Web MVC
* Spring Security
* Flyway Migrations
* MapStruct
* Lombok
* Swagger OpenAPI

---

# Project Structure

```text
xebia-lms-portal/
│
├── backend/
│   ├── analytics/
│   ├── category/
│   ├── config/
│   ├── content/
│   ├── course/
│   ├── exception/
│   ├── module/
│   ├── security/
│   ├── student/
│   ├── submodule/
│   └── util/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── services/
│   ├── styles/
│   ├── utils/
│   └── main.jsx
│
└── Workflow.png
```

---

# Environment Variables

Backend configuration is managed using environment variables.

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lms_course
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
```

---

# Local Setup

## Prerequisites

* Java 17
* Node.js v18+
* PostgreSQL v14+
* Maven
* Git

---

## Clone Repository

```bash
git clone https://github.com/anagharaju05/Xebia-LMS.git

cd Xebia-LMS
```

---

## Database Setup

Create a PostgreSQL database named:

```text
lms_course
```

Flyway automatically handles database schema migrations during backend startup.

---

# Backend Setup

Navigate into backend:

```bash
cd backend
```

### Configure Password

#### Windows PowerShell

```powershell
$env:DB_PASSWORD="your_postgres_password"
```

#### Linux / Mac

```bash
export DB_PASSWORD="your_postgres_password"
```

### Run Backend Server

```bash
mvn clean install

mvn spring-boot:run
```

Backend Server:

```text
https://xebia-lms-backend.onrender.com
```

Swagger Documentation:

```text
https://xebia-lms-backend.onrender.com/swagger-ui.html
```

---

# Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run frontend server:

```bash
npm run dev
```

Frontend URL:

```text
http://127.0.0.1:5173
```

---

# API Modules

| Endpoint                           | Description          |
| ---------------------------------- | -------------------- |
| `/api/analytics`                   | Dashboard analytics  |
| `/api/categories`                  | Category management  |
| `/api/content`                     | Learning content     |
| `/api/courses`                     | Course management    |
| `/api/modules`                     | Module handling      |
| `/api/auth`                        | Authentication       |
| `/api/management/students`         | Admin student APIs   |
| `/api/portal/students/{studentId}` | Student portal APIs  |
| `/api/submodules`                  | Submodule operations |

---

# Architecture

```text
React Frontend
       ↓
REST APIs
       ↓
Spring Boot Services
       ↓
Repository Layer
       ↓
PostgreSQL Database
```

---

# Core Features

* Secure Authentication
* RESTful APIs
* Analytics Dashboard
* Course Management
* Student Portal
* Native PDF Certificate Generation
* Advanced Quiz Assessment Logic
* Flyway Migration
* Modular Architecture
* Swagger Documentation
* Scalable Backend

---

# Future Improvements

* JWT Authentication
* RBAC Authorization
* Docker Deployment
* CI/CD Pipelines
* Kubernetes Support
* Redis Caching
* Email Services
* Cloud Deployment
* Advanced Analytics

---

# Contribution Workflow

1. Fork the repository (if you are an external contributor) or clone the repository.
2. Create a new branch from `develop`.

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

3. Make your changes and commit them.

```bash
git add .
git commit -m "Add: README documentation improvements"
```

4. Push your branch to GitHub.

```bash
git push origin feature/your-feature-name
```

5. Create a Pull Request (PR) from your feature branch to `develop`.
6. Get your code reviewed and approved.
7. Merge the Pull Request.

---

# License

This project is intended for educational and enterprise learning purposes.

---

# Support

If you found this project useful, consider starring the repository.
