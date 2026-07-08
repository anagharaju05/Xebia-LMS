# 1. Architecture Documentation

[Back to documentation index](../README.md)

## System context

Xebia LMS is a React 18 + Vite frontend backed by a Java 17 / Spring Boot 3.2 application. PostgreSQL is the source of record for implemented backend entities. Redis caches course and analytics reads. Browser localStorage supports offline/demo operation and currently owns the Batch prototype while also acting as the Assessment fallback when API mode is disabled.

```text
Browser
  -> React entry (main.jsx)
  -> App.jsx role gate
     -> Admin: React Router pages
     -> Teacher: TeacherPortal.jsx internal views
     -> Student: StudentPortal.jsx internal views
  -> feature hook or api.js
  -> Spring Security filters
  -> Controller -> Service -> Repository
  -> PostgreSQL / Redis
```

## Runtime components

| Layer | Main files | Responsibility |
| --- | --- | --- |
| Bootstrap | `frontend/src/main.jsx`, `frontend/src/app/App.jsx` | Mount React, create shared stores, select portal by role. |
| Admin navigation | `app/routes.js`, `components/layout/Sidebar.jsx` | URL-based routes for dashboard, categories, courses, content, students, and analytics. |
| Teacher portal | `features/teacher/TeacherPortal.jsx` | Internal dashboard, assessment CRUD, submissions, grading, and questions. |
| Teacher batch workspace | `features/teacher/TeacherBatchWorkspace.jsx` | Batch, subject, calendar, attendance, discussion, announcement, and analytics views. |
| Student portal | `features/student/StudentPortal.jsx` | Internal learning, task, notification, feedback, and course views. |
| Student assessment UI | `features/student/StudentAssessments.jsx` | Assigned assessment filtering, file/quiz/code submission, results, and questions. |
| Frontend state | `useLmsStore.js`, `useAssessmentStore.js`, `useBatchStore.js`, `useStudentPortal.js` | Feature state, persistence, and optional backend synchronization. |
| API adapter | `frontend/src/services/api.js` | Base URL, tenant/user headers, JSON requests, and error translation. |
| Backend web layer | `*Controller.java` | REST resources and request validation. |
| Backend domain layer | `*Service.java`, `*ServiceImpl.java` | Business rules, mapping, workflow, and caching. |
| Persistence | `*Repository.java`, Flyway SQL | JPA access and versioned PostgreSQL schema. |
| Cache | `RedisConfig.java`, cache annotations | Cached courses and analytics responses. |

## Role and navigation model

`LoginPage.jsx` invokes `useAuth.js`. The current frontend login validates seeded users from `auth.data.js` and stores the selected session in `xebia-lms-auth-session-v1`.

- `admin`: `App.jsx` renders the shared layout and React Router routes.
- `teacher`: `App.jsx` lazy-loads `TeacherPortal.jsx`.
- `student`: `App.jsx` lazy-loads `StudentPortal.jsx`.

Teacher and Student portal sidebar clicks change component state rather than URL routes. New contributors should search for `setView(...)`, not for a route definition, when tracing these portal screens.

## State and persistence ownership

| Data | Frontend owner | Current persistence | Backend status |
| --- | --- | --- | --- |
| Categories, courses, modules, submodules, content | `useLmsStore.js` | PostgreSQL when enabled; localStorage fallback | Implemented REST + JPA. |
| Admin students and tasks | `useStudentManagement.js` | Backend when enabled; seeded fallback | Implemented. |
| Student portal state | `useStudentPortal.js` | Backend when enabled; seeded fallback | Implemented. |
| Assessments, questions, tests, allocations, Q&A | `useAssessmentStore.js` | `/api/assessments` when enabled; localStorage fallback | Assessment CRUD/Q&A implemented in Spring and V9/V10. |
| Assessment submissions and grading | `useAssessmentStore.js` | Student task submission/review APIs when enabled; localStorage fallback | File upload and assignment review implemented. |
| Batches, join codes, subjects, announcements, attendance, discussions | `useBatchStore.js` | `xebia-lms-batches-v1` localStorage | Backend module not implemented. |
| Authentication session | `useAuth.js` | `xebia-lms-auth-session-v1` localStorage | Backend login exists for Admin/Student; frontend uses seeded users. |

## Security architecture

`SecurityConfig.java` is stateless, disables CSRF, and permits Swagger and `/api/auth/**`. Other requests pass through:

1. `TenantFilter` validates `X-Organization-ID` and stores the UUID in `TenantContext`.
2. `MockAuthenticationFilter` converts `X-User-Id` and `X-User-Role` into a Spring Security authentication.
3. Method rules such as analytics `@PreAuthorize` checks apply.

This is a development authentication model, not JWT authentication. Production work must replace header trust, plaintext demo credentials, wildcard CORS, and local frontend user validation.

## Main workflow

![Complete student and backend flow](../assets/workflows/03-student-submission-backend.png)

## Integration boundaries and risks

- API-mode assessment attachments upload to the backend `uploads/` directory; production object storage, antivirus scanning, and durable URLs are still required.
- JavaScript coding tests execute in the browser. Other languages require an isolated runner API.
- Batch stores are browser-local and are not multi-user safe. Assessment local mode is also browser-local.
- Backend authentication has seeded Admin/Teacher credentials and database Student lookup, but remains a development authentication model.
- `VITE_ENABLE_API` changes data ownership; test both enabled and disabled modes after store changes.
- Redis availability affects cache performance, while PostgreSQL remains the durable source of record.
