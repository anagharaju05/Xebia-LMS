# Xebia LMS Full Technical Documentation

Version: current repository implementation as of 8 July 2026.

## Contents

1. [Purpose and scope](#purpose-and-scope)
2. [Technology stack](#technology-stack)
3. [Architecture](#architecture)
4. [Frontend implementation](#frontend-implementation)
5. [Backend implementation](#backend-implementation)
6. [Assessment module](#assessment-module)
7. [API and security](#api-and-security)
8. [Database and caching](#database-and-caching)
9. [Configuration and execution](#configuration-and-execution)
10. [Known gaps and continuation plan](#known-gaps-and-continuation-plan)

Detailed pages are available from the [Documentation index](README.md).

## Purpose and scope

Xebia LMS supports Admin, Teacher, and Student learning workflows. The codebase combines implemented Spring Boot modules with frontend prototypes. This document states which layer owns each feature so new contributors do not assume that a visible UI is already durable or multi-user.

## Technology stack

### Frontend

- React 18 and Vite 5
- JavaScript and Vanilla CSS
- React Router for Admin URL navigation
- Recharts for analytics
- Lucide React icons
- `read-excel-file` for XLSX quiz import
- Browser localStorage for offline/demo and prototype state

### Backend

- Java 17 and Spring Boot 3.2.5
- Spring MVC, Security, Validation, Data JPA
- PostgreSQL with Flyway migrations
- Redis with Spring Cache
- MapStruct, Lombok
- Springdoc OpenAPI
- Maven

## Architecture

```text
main.jsx
  -> App.jsx
     -> LoginPage + useAuth
     -> Admin Routes OR TeacherPortal OR StudentPortal
  -> feature hooks and services
  -> optional REST API
  -> TenantFilter -> MockAuthenticationFilter
  -> Controller -> Service -> Repository
  -> PostgreSQL / Redis
```

Admin pages use URLs. Teacher and Student portals are internal single-page workspaces controlled by `setView(...)`.

![Entry and Admin navigation](assets/workflows/01-entry-admin-navigation.png)

### Data ownership

| Domain | Owner today |
| --- | --- |
| Category/course/curriculum/content | Spring backend when API enabled, with frontend local fallback. |
| Admin student/task management | Spring backend when enabled, with seed fallback. |
| Student portal progress/feedback/comments | Spring backend when enabled, with seed fallback. |
| Admin analytics | Spring backend + Redis. |
| Teacher assessment workspace | Assessment/Q&A/file/task/review APIs when enabled; localStorage fallback. |
| Batch/join-code/subject workspace | Frontend `useBatchStore` + localStorage. |

## Frontend implementation

### Entry and shared services

- `src/main.jsx`: React mount and router provider.
- `src/app/App.jsx`: shared stores, role gate, routes, lazy portals.
- `src/services/api.js`: JSON HTTP wrapper and development headers.
- `src/hooks/useLmsStore.js`: Admin LMS state, optimistic UI, API sync, and fallback.
- `src/features/auth/useAuth.js`: current seeded role validation and local session.

### Admin

Admin uses `Sidebar.jsx` + `app/routes.js` + `App.jsx` routes. Primary pages are Dashboard, Categories, Courses, Curriculum, Content, Students, and Analytics.

### Teacher

`TeacherPortal.jsx` contains the dashboard, assessment editor/list, submissions/review, and questions. `TeacherBatchWorkspace.jsx` handles batches, subjects, attendance, announcements, discussions, calendar, and analytics.

### Student

`StudentPortal.jsx` owns dashboard, My Learning, course, task, notification, and feedback views. `StudentAssessments.jsx` owns modern assessments. `StudentBatchWorkspace.jsx` owns My Batches, calendar, and analytics.

![Student portal flow](assets/workflows/03-student-submission-backend.png)

## Backend implementation

The backend is organized by domain. Each core domain follows Controller -> Service -> Repository. DTOs protect the API boundary and mappers translate entities.

### Resources

- `/api/categories`
- `/api/courses`
- `/api/modules`
- `/api/submodules`
- `/api/content`
- `/api/auth`
- `/api/management/students`
- `/api/portal/students/{studentId}`
- `/api/analytics`

### Security

Security is stateless but currently development-oriented. `TenantFilter` requires `X-Organization-ID`; `MockAuthenticationFilter` trusts user and role headers. Swagger and auth paths are public. This is not JWT security.

### Caching

Redis caches courses and selected analytics results. Course mutations evict the course cache. Cache failure must never become data loss because PostgreSQL is authoritative.

## Assessment module

### Files

| File | Role |
| --- | --- |
| `frontend/src/features/assessments/assessment.data.js` | Types, seed state, blank model. |
| `frontend/src/features/assessments/useAssessmentStore.js` | CRUD, status, submit, grade, Q&A, API sync, and local fallback. |
| `frontend/src/services/excelQuiz.service.js` | XLSX/CSV parser and validation. |
| `frontend/src/features/teacher/TeacherPortal.jsx` | Create/edit/list, review, grading, questions. |
| `frontend/src/features/student/StudentPortal.jsx` | Opens the Student assessment view. |
| `frontend/src/features/student/StudentAssessments.jsx` | File, quiz, coding submissions and results. |
| `backend/.../assessment/AssessmentController.java` | Assessment CRUD and Q&A endpoints. |
| `backend/.../student/FileController.java` | Multipart upload and download. |
| `backend/.../student/StudentPortalController.java` | Student task and generic assessment submission endpoints. |
| `backend/.../student/StudentAssessmentResultRepository.java` | Existing result persistence. |

![Assessment file map](assets/workflows/04-assessment-file-map.png)

### Teacher lifecycle

1. Open Assessments inside `TeacherPortal.jsx`.
2. Create or edit `AssessmentEditor` state.
3. Choose file, Excel quiz, or coding format.
4. Choose entire course, batches, or students.
5. Save draft or publish through `saveAssessment()` to `/api/assessments` in API mode or localStorage offline.
6. Track submitted, missing, and graded students.
7. Review and grade with `gradeSubmission()`.
8. Answer questions with `answerQuestion()`.

![Teacher lifecycle](assets/workflows/02-teacher-assessment-lifecycle.png)

### Student lifecycle

1. `StudentAssessments.jsx` filters published records by student/batch allocation.
2. Student opens `AssessmentDetail`.
3. File submissions become Submitted.
4. Quiz submissions calculate marks and become Graded.
5. Coding runs JavaScript tests locally and becomes Submitted for review.
6. `SubmissionResult` displays status, marks, feedback, and quiz answer review.

### Backend integration status

V9/V10, `AssessmentController`, `AssessmentServiceImpl`, and `AssessmentRepository` implement definitions, question banks, tests, allocation IDs, file metadata, and Q&A. `FileController` implements local-disk upload. The frontend serializes rich submissions through student tasks and grades through assignment review. The older generic result endpoint remains available. Dedicated normalized submission tables, object storage, and a secure coding runner are still future work.

## API and security

Requests generally require JSON plus `X-Organization-ID`, `X-User-Id`, and `X-User-Role`. Swagger is available at `/swagger-ui.html`. See [API documentation](<4. api_documentation/README.md>) for every endpoint group.

Current production blockers:

- frontend-seeded credentials
- plaintext demo password comparison
- trusted identity headers
- wildcard CORS
- missing Teacher backend authentication path

## Database and caching

Flyway `V1` through `V10` defines core learning, students, assignments/results, notifications, feedback/comments, sessions/attendance, certifications, AI adoption, flagship programs, analytics seed data, assessments, questions/options, test cases, allocation IDs, Q&A, and file-type metadata.

Core hierarchy:

```text
category -> course -> module -> submodule -> content
```

Student entities connect to courses, assignments, completions, assessment results, notifications, feedback, sessions, certifications, and AI adoption. Assessment definitions are modeled in PostgreSQL, while rich submissions are serialized through student tasks. Batch entities remain frontend-local.

## Configuration and execution

### Frontend

```bash
cd frontend
npm install
npm run dev
```

```env
VITE_API_URL=http://localhost:8080
VITE_ENABLE_API=false
```

### Backend

```bash
cd backend
mvn clean test
mvn spring-boot:run
```

```env
PORT=8080
DATABASE_URL=postgresql://localhost:5432/lms_course
DB_USERNAME=postgres
DB_PASSWORD=replace_me
REDIS_URL=redis://localhost:6379
```

### Verification

```bash
cd frontend && npm run build
cd backend && mvn clean verify
```

## Known gaps and continuation plan

### Highest priority

1. Replace mock authentication with secure identity and role enforcement.
2. Implement the backend Batch/Join Code/Subject module.
3. Normalize assessment submissions and grading records.
4. Replace local uploads with secure object storage.
5. Add an isolated coding runner.
6. Harden API-mode loading, error, and optimistic rollback behavior.

### Contributor handoff checklist

- Identify whether the feature uses React Router or portal `setView`.
- Identify its source of truth: backend, optional API, or localStorage prototype.
- Follow the click-to-file map in [Execution flows](<6. execution_flows/README.md>).
- Add Flyway migrations rather than editing existing ones.
- Update Swagger annotations and API docs.
- Test desktop/mobile UI and both API modes.
- Update this documentation when ownership or flow changes.

## Source workflow PDF

[Open the original workflow PDF](assets/Xebia-LMS-Developer-Workflow.pdf).
