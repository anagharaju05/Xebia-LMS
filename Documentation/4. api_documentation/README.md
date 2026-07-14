# Xebia LMS API Documentation

## Interactive API Explorer (Swagger UI)

The Xebia LMS backend uses `springdoc-openapi` to automatically generate beautiful, interactive API documentation. 

To explore and test all APIs directly from your browser without using Postman, simply start the backend server and navigate to:
**[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)**
*(Or replace `localhost:8080` with your production URL like `https://xebia-lms-backend.onrender.com/swagger-ui.html`)*

The Swagger UI provides:
- A complete list of all available REST endpoints.
- Auto-generated schemas and data types for request/response bodies.
- A "Try it out" button that lets you execute real API requests directly from the webpage.

---

## Core API Modules

The LMS exposes the following primary controllers:

### 1. `CourseController` (`/api/courses`)
Handles the creation, retrieval, and updating of all course materials.
- **GET** `/api/courses` - Retrieve all courses.
- **POST** `/api/courses` - Create a new course.

### 2. `StudentManagementController` (`/api/management/students`)
Handles the administration of student accounts, tracking, and cohort assignment.
- **GET** `/api/management/students` - List all students.
- **POST** `/api/management/students` - Register a new student.
- **GET** `/api/management/students/assignments` - Retrieve global student assignments for teacher grading.

### 3. `AssessmentController` (`/api/assessments`)
Manages the lifecycle of quizzes, assignments, and coding tests.
- **GET** `/api/assessments` - List all published/draft assessments.
- **POST** `/api/assessments` - Create a new assessment.
- **GET** `/api/assessments/{id}/questions` - Get questions for a specific assessment.

### 4. `AnalyticsController` (`/api/analytics`)
Provides aggregation endpoints for the Executive Dashboard.
- **GET** `/api/analytics/summary` - High-level metrics.
- **GET** `/api/analytics/trends` - Historical progression data.

---

## Testing & Datasets

We have prepared 20 predefined datasets for each core API to assist with load testing and integration checking.

You can find the raw JSON payloads inside `Documentation/datasets/api_payloads.json` or use the included **Xebia LMS Postman Collection**.

For automated stress-testing, use the `load_test.js` script provided in the `backend/` directory to simulate 200 concurrent user requests.
