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

<table>
<tr>
<td align="center" width="120">
<img src="https://skillicons.dev/icons?i=react" width="48"/><br/>
React 18
</td>

<td align="center" width="120">
<img src="https://skillicons.dev/icons?i=vite" width="48"/><br/>
Vite
</td>

<td align="center" width="120">
<img src="https://skillicons.dev/icons?i=css" width="48"/><br/>
Vanilla CSS
</td>

<td align="center" width="120">
<img src="https://skillicons.dev/icons?i=javascript" width="48"/><br/>
JavaScript
</td>
</tr>
</table>

### Additional Libraries

* React Router DOM v7
* Recharts
* Lucide React

---

## Backend

<table>
<tr>
<td align="center" width="120">
<img src="https://skillicons.dev/icons?i=java" width="48"/><br/>
Java 17
</td>

<td align="center" width="120">
<img src="https://skillicons.dev/icons?i=spring" width="48"/><br/>
Spring Boot
</td>

<td align="center" width="120">
<img src="https://skillicons.dev/icons?i=postgres" width="48"/><br/>
PostgreSQL
</td>

<td align="center" width="120">
<img src="https://skillicons.dev/icons?i=maven" width="48"/><br/>
Maven
</td>
</tr>
</table>

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

<table>
<tr>
<td>Java 17</td>
<td>Node.js v18+</td>
<td>PostgreSQL v14+</td>
<td>Maven</td>
<td>Git</td>
</tr>
</table>

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
http://localhost:8080
```

Swagger Documentation:

```text
http://localhost:8080/swagger-ui.html
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

<table>
<tr>
<td>Secure Authentication</td>
<td>RESTful APIs</td>
<td>Analytics Dashboard</td>
</tr>

<tr>
<td>Course Management</td>
<td>Student Portal</td>
<td>Flyway Migration</td>
</tr>

<tr>
<td>Modular Architecture</td>
<td>Swagger Documentation</td>
<td>Scalable Backend</td>
</tr>
</table>

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

```bash
Fork Repository
    ↓
Create Feature Branch
    ↓
Commit Changes
    ↓
Push Branch
    ↓
Create Pull Request
```

---

# License

This project is intended for educational and enterprise learning purposes.

---

# Support

If you found this project useful, consider starring the repository.