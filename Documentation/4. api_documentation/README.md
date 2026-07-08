# 4. API Documentation

[Back to documentation index](../README.md)

## Base URL and interactive documentation

- Local default: `http://localhost:8080`
- OpenAPI JSON: `/v3/api-docs`
- Swagger UI: `/swagger-ui.html`

## Required development headers

Most `/api/**` endpoints require these headers under the current mock security model:

| Header | Meaning |
| --- | --- |
| `Content-Type: application/json` | JSON request/response body. |
| `X-Organization-ID` | Tenant UUID validated by `TenantFilter`. |
| `X-User-Id` | Current user identity consumed by `MockAuthenticationFilter`. |
| `X-User-Role` | Role converted to a Spring authority. |

These headers are not a production authentication mechanism.

## Endpoint inventory

### Authentication

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/login` | Demo Admin/Teacher or database Student login. |

### Health

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Lightweight backend availability response. Current filters may still require development headers. |

### Categories

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/categories` | Create category. |
| PUT | `/api/categories/{id}` | Update category. |
| DELETE | `/api/categories/{id}` | Delete unused category. |
| GET | `/api/categories` | List tenant categories. |
| GET | `/api/categories/{id}` | Get category. |
| GET | `/api/categories/tree` | Get parent-child tree. |

### Courses

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/courses` | Create draft course. |
| PUT | `/api/courses/{id}` | Update course. |
| DELETE | `/api/courses/{id}` | Delete course. |
| GET | `/api/courses` | List courses. |
| GET | `/api/courses/{id}` | Get course. |
| POST | `/api/courses/{id}/submit-review` | Move draft to review. |
| POST | `/api/courses/{id}/publish` | Publish reviewed course. |

### Modules, submodules, and content

| Resource | CRUD base | Additional paths |
| --- | --- | --- |
| Modules | `/api/modules` | `POST /reorder`, `GET /course/{courseId}`, `GET /course/all` |
| Submodules | `/api/submodules` | `POST /reorder`, `GET /module/{moduleId}`, `GET /module/all` |
| Content | `/api/content` | `POST /reorder`, `GET /submodule/{submoduleId}` |

### Student management

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/management/students` | Add student. |
| GET | `/api/management/students` | List students. |
| PUT | `/api/management/students/{studentId}/toggle-status` | Activate/deactivate. |
| POST | `/api/management/students/{studentId}/courses/{courseSlug}` | Assign course. |
| POST | `/api/management/students/assignments` | Create task/assignment. |
| GET | `/api/management/students/assignments` | List assignments. |
| PUT | `/api/management/students/assignments/{assignmentId}/review` | Save review. |

### Student portal

Base: `/api/portal/students/{studentId}`

| Method | Relative path | Purpose |
| --- | --- | --- |
| GET | `/state` | Aggregated portal state. |
| POST | `/lessons/{lessonId}/complete` | Complete lesson. |
| POST | `/assessments/{assessmentId}/submit` | Submit generic assessment answers. |
| POST | `/notifications/{notificationId}/read` | Mark notification read. |
| POST | `/comments` | Add lesson comment. |
| POST | `/comments/{commentId}/replies` | Reply to comment. |
| POST | `/feedback` | Submit course feedback. |
| POST | `/tasks/{taskId}/submit` | Submit task text. |

### Assessments and questions

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/assessments` | Create assessment definition with questions/tests/allocations. |
| PUT | `/api/assessments/{id}` | Update assessment. |
| GET | `/api/assessments` | List tenant assessments; optional `subject` and `status`. |
| GET | `/api/assessments/{id}` | Get assessment. |
| DELETE | `/api/assessments/{id}` | Delete assessment and child records. |
| GET | `/api/assessments/questions` | List tenant student questions. |
| POST | `/api/assessments/questions` | Create student question. |
| POST | `/api/assessments/questions/{questionId}/answer` | Save teacher answer. |

### Assessment files

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/portal/files/upload` | Multipart upload; returns file URL, name, and size. |
| GET | `/api/portal/files/download/{filename}` | Inline download from the backend upload directory. |

Assessment request body:

```json
{
  "answers": {
    "question-1": "selected answer"
  }
}
```

### Analytics

Base: `/api/analytics`. Implemented GET paths:

`filters`, `executive-summary`, `learning-coverage`, `learning-hours`, `learning-pillars`, `ai-transformation`, `certifications`, `flagship-programs`, `learning-trends`, `training-effectiveness`, `learning-champions`, `project-investment`, and `fresher-journey`.

Selected endpoints accept filter query parameters such as `region` and `businessUnit` and return an `AnalyticsResponse` envelope.

## Status and errors

- `200 OK`: successful read/update.
- `201 Created`: successful create.
- `204 No Content`: successful action without a body.
- `400 Bad Request`: validation or tenant-header problem.
- `401 Unauthorized`: invalid login or missing authentication context.
- `403 Forbidden`: role rule failure.
- `404 Not Found`: resource does not exist.

## Known API gaps

Assessment CRUD, allocation IDs, questions/tests, Q&A, and local file upload now have backend support. Remaining gaps include batch/join-code/subject persistence, cloud-grade file storage and validation, normalized per-format submission entities, secure coding evaluation, and production authentication. The current assessment store serializes submissions through the student task endpoint and grades through assignment review.
