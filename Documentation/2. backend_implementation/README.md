# 2. Backend Implementation

[Back to documentation index](../README.md)

## Technology

- Java 17
- Spring Boot 3.2.5
- Spring Web MVC, Validation, Security, Data JPA
- PostgreSQL + Flyway
- Redis cache
- MapStruct and Lombok
- Springdoc OpenAPI / Swagger UI
- Maven

## Package layout

```text
backend/src/main/java/com/xebia/lms/
  analytics/    reporting controller, DTO, and service
  assessment/   assessment definitions, questions, tests, allocations, mapper, service, repository
  category/     category entity, DTOs, mapper, service, repository
  content/      content blocks and content type
  course/       course lifecycle and cache integration
  module/       course modules and ordering
  submodule/    nested module content structure
  student/      student management, portal, assignments, results, feedback, questions, and file endpoints
  security/     login, tenant context, mock authentication filters
  config/       security, OpenAPI, and Redis configuration
  exception/    shared error response and exception handling
  util/         shared request models such as reordering
```

## Standard request path

```text
HTTP request
  -> TenantFilter
  -> MockAuthenticationFilter
  -> Controller
  -> Service interface / ServiceImpl
  -> Mapper (where applicable)
  -> JpaRepository
  -> PostgreSQL
  -> DTO response
```

Controllers should remain thin. Put validation that depends on current data, lifecycle transitions, tenant scoping, and cascade decisions in services. Repositories should express persistence queries, not business rules.

## Implemented modules

| Module | Controller | Service | Repository/model notes |
| --- | --- | --- | --- |
| Categories | `CategoryController` | `CategoryServiceImpl` | Hierarchy, tenant-scoped listing, category tree. |
| Courses | `CourseController` | `CourseServiceImpl` | Draft/review/publish lifecycle; course cache. |
| Modules | `ModuleController` | `ModuleServiceImpl` | CRUD, course listing, position reorder. |
| Submodules | `SubmoduleController` | `SubmoduleServiceImpl` | CRUD, module listing, position reorder. |
| Content | `ContentController` | `ContentServiceImpl` | Notes, video, PDF, PPT and ordering. |
| Students | `StudentManagementController` | `StudentManagementServiceImpl` | Students, course assignment, tasks, reviews. |
| Student portal | `StudentPortalController` | `StudentPortalServiceImpl` | State, lesson completion, assessment results, notifications, comments, feedback, task submissions. |
| Analytics | `AnalyticsController` | `AnalyticsService` | Filtered reporting; selected responses cached in Redis. |
| Authentication | `AuthController` | Controller-local demo logic | Seeded Admin/Teacher and database Student lookup. |
| Health | `HealthController` | - | Lightweight backend availability response. |
| Assessments | `AssessmentController` | `AssessmentServiceImpl` | CRUD, questions, test cases, allocation IDs, and Q&A. |
| Files | `FileController` | Controller-local storage logic | Multipart upload and inline download from local `uploads/`. |

## Course lifecycle

The backend uses course status values such as `DRAFT`, `REVIEW`, and `PUBLISHED`.

1. `POST /api/courses` creates a draft.
2. `POST /api/courses/{id}/submit-review` advances a draft for review.
3. `POST /api/courses/{id}/publish` publishes an eligible course.
4. Course mutations evict the Redis `courses` cache.

## Assessment implementation

Assessment definitions are persisted by `AssessmentController` and `AssessmentServiceImpl`:

```text
POST/PUT/GET/DELETE /api/assessments
  -> AssessmentController
  -> AssessmentServiceImpl
  -> AssessmentRepository
  -> assessments + child tables
```

Question forum endpoints use `StudentQuestionRepository`. V9 stores assessment questions, options, test cases, batch/student allocation IDs, and student questions; V10 adds attachment metadata and allowed file types.

The backend also has a student-facing generic result path:

```text
StudentPortalController.submitAssessment(...)
  -> StudentPortalService.submitAssessment(...)
  -> StudentPortalServiceImpl
  -> StudentAssessmentResultRepository
  -> student_assessment_results
```

The current frontend API-mode store saves assessment definitions to `/api/assessments`, uploads files through `/api/portal/files/upload`, serializes submissions into student tasks, and grades through the assignment review endpoint. The older generic result endpoint remains available. Missing production pieces include durable cloud/object storage, a secure coding sandbox, batch entity persistence, and a dedicated normalized assessment-submission model.

## Caching

`RedisConfig.java` enables Spring caching and JSON serialization. Current cache usage includes:

- `courses`: course reads; evicted after course mutations.
- `analytics_filters`: analytics filter data.
- `analytics_executive_summary`: executive reporting.

Cache keys must include every input that affects the result. PostgreSQL remains authoritative.

## Error handling

`GlobalExceptionHandler` and the shared exception classes translate errors into HTTP responses. New endpoints should use `ResourceNotFoundException` for missing records and `BadRequestException` for invalid state transitions. Avoid returning stack traces or database details.

## Adding a backend feature

1. Add or update a Flyway migration.
2. Add the entity and repository.
3. Define request/response DTOs and validation.
4. Add service interface and implementation.
5. Add mapper logic where useful.
6. Add a thin controller with OpenAPI annotations.
7. Enforce tenant and role rules.
8. Add unit/integration tests.
9. Update API, database, feature, and execution-flow documentation.
