# 7. Database Documentation

[Back to documentation index](../README.md)

## Database platform

- PostgreSQL
- Spring Data JPA
- Flyway migrations in `backend/src/main/resources/db/migration/`
- Hibernate `ddl-auto=validate`; Flyway owns schema changes.

## Migration history

| Migration | Purpose |
| --- | --- |
| `V1__init_schema.sql` | Categories, courses, modules, submodules, content, and indexes. |
| `V2__insert_sample_data.sql` | Core seeded data. |
| `V3__add_metadata_column.sql` | JSON-like metadata text columns for frontend compatibility. |
| `V4__add_student_module.sql` | Students, course assignments, tasks, completions, results, notifications, feedback, comments. |
| `V5__add_learning_analytics_models.sql` | Student/course analytics fields, training sessions, attendance, certifications, AI adoption, flagship programs. |
| `V6__seed_analytics_data.sql` | Analytics sample data. |
| `V7__add_student_password.sql` | Student password column for the current demo login. |
| `V8__seed_advanced_analytics.sql` | Additional reporting data. |
| `V9__add_assessments.sql` | Assessments, questions/options, test cases, allocation join tables, and student Q&A. |
| `V10__add_file_types.sql` | Assessment attachment name and allowed file types. |

## Core learning relationships

```text
categories
  1 -> many courses

courses
  1 -> many modules

modules
  1 -> many submodules

submodules
  1 -> many contents
```

Deletion behavior is defined by foreign keys: module/submodule/content children commonly cascade, while category references are more restrictive or nullable.

## Student relationships

```text
students
  many <-> many courses via student_courses
  1 -> many student_assignments
  1 -> many student_assessment_results
  1 -> many student_notifications
  1 -> many student_feedback
  1 -> many session_attendances
  1 -> many student_certifications
  1 -> many ai_tool_adoptions
```

Lesson comments and replies form a separate discussion hierarchy.

## Analytics tables and fields

`V5` extends students with region, location, business unit, department, project, practice, grade, employment type, joining/deployment dates. It extends courses with pillar, AI/flagship/certification flags, learning hours, delivery type, and program name.

Additional tables include:

- `training_sessions`
- `session_attendances`
- `student_certifications`
- `ai_tool_adoptions`
- `flagship_programs`

Indexes support common region, department, project, grade, date, status, and relationship filters.

## Tenant model

Core entities carry `organization_id`. `TenantFilter` places the request tenant UUID in `TenantContext`. Services/repositories must consistently filter by tenant; never trust IDs alone across organizations.

## Assessment schema

V9/V10 now persist:

- `assessments`: definition, status, type, instructions, deadline, points, scope, language/starter code, quiz filename, attachment name.
- `assessment_questions` and `assessment_question_options`: prompts, options, answers, marks, explanations.
- `assessment_test_cases`: input, expected output, and hidden flag.
- `assessment_batch_allocations` and `assessment_student_allocations`: allocation identifiers.
- `assessment_allowed_file_types`: accepted extensions.
- `student_questions`: tenant/student question and teacher answer timestamps.

The older `student_assessment_results` table remains. The API-mode frontend currently serializes rich file/quiz/code submission data through student assignments/tasks, so a dedicated normalized submission/grade schema is still recommended.

## Batch data boundary

Batches, join codes, subjects, announcements, discussions, and the new attendance workspace currently use `xebia-lms-batches-v1` localStorage. Backend tables and APIs are future work.

## Schema-change procedure

1. Never edit an already-shared migration.
2. Add the next numbered `V{n}__description.sql`.
3. Add constraints and indexes deliberately.
4. Update entity mappings and repository queries.
5. Start the backend against a clean and an upgraded database.
6. Update this document and API/feature documentation.
