# 3. Frontend Implementation

[Back to documentation index](../README.md)

## Technology and entry flow

The frontend uses React 18, Vite 5, React Router, Recharts, Lucide icons, Vanilla CSS, and `read-excel-file`.

```text
src/main.jsx
  -> src/app/App.jsx
  -> useAuth()
  -> LoginPage or role portal
```

`App.jsx` creates shared LMS, assessment, batch, theme, and toast state. It lazy-loads Teacher and Student portals.

![Entry and Admin navigation](../assets/workflows/01-entry-admin-navigation.png)

## Folder responsibilities

| Folder | Responsibility |
| --- | --- |
| `app/` | Application composition, route constants, navigation constants. |
| `components/` | Reusable cards, fields, layout, preview, and feedback components. |
| `features/` | Domain pages and feature-specific hooks/data. |
| `hooks/` | Shared store, persistence, theme, and toast hooks. |
| `services/` | HTTP, storage, audit, and spreadsheet parsing. |
| `styles/` | Global tokens plus feature and responsive CSS. |
| `utils/` | IDs, slugs, formatting, file helpers, and seeded data. |

## Admin navigation

Admin screens use React Router. `Sidebar.jsx` calls `navigate(path)`, `routes.js` defines the route contract, and `App.jsx` maps routes to pages.

| UI | Route | Component |
| --- | --- | --- |
| Dashboard | `/` | `DashboardPage.jsx` |
| Categories | `/categories` | `CategoriesPage.jsx` |
| Category editor | `/categories/:id` | `CategoryEditor.jsx` |
| Courses | `/courses` | `CoursesPage.jsx` |
| Course editor | `/courses/:id` | `CourseEditor.jsx` |
| Curriculum | `/courses/:courseId/curriculum` | `CurriculumPage.jsx` |
| Content | `/content` | `ContentLibraryPage.jsx` |
| Students | `/students` | `StudentsPage.jsx` |
| Analytics | `/admin/learning-analytics/*` | Section components under `features/analytics/`. |

## Teacher portal

`TeacherPortal.jsx` owns internal view state. Its sidebar changes `view` without changing the URL.

- `TeacherDashboard`: overview metrics and recent submissions.
- `AssessmentsPage`: search, status filters, create/edit/delete/publish.
- `AssessmentEditor`: file, Excel quiz, and coding formats plus allocation scope.
- `SubmissionsPage` and `ReviewModal`: submitted/not-submitted tracking and grading.
- `QuestionsPage`: replies to assessment questions.
- `TeacherBatchWorkspace.jsx`: batches, subjects, announcements, discussions, attendance, calendar, and analytics.

![Teacher assessment lifecycle](../assets/workflows/02-teacher-assessment-lifecycle.png)

## Student portal

`StudentPortal.jsx` owns internal `STUDENT_VIEWS` and renders the matching child view. `StudentAssessments.jsx` contains the modern assessment workspace.

- `LearningView` -> `CourseView` for course progress and lessons.
- `TasksView` for assigned work.
- `StudentAssessments` for search/filter, deadlines, submissions, marks, and questions.
- `StudentBatchWorkspace.jsx` for My Batches, calendar, and analytics.
- `NotificationsView` and `FeedbackView` use `useStudentPortal.js`.

## State hooks

| Hook | Data | Persistence/integration |
| --- | --- | --- |
| `useLmsStore.js` | Categories, courses, modules, submodules, content | API when enabled, localStorage backup/offline. |
| `useAuth.js` | Role session | `/api/auth/login` when enabled; seeded validation + localStorage otherwise. |
| `useStudentManagement.js` | Admin students/tasks | API when enabled, seeded fallback. |
| `useStudentPortal.js` | Student progress, tasks, comments, notifications, feedback | API when enabled, seeded fallback. |
| `useAssessmentStore.js` | Assessments, submissions, grades, Q&A | Assessment/task/review/file APIs when enabled; localStorage fallback. |
| `useBatchStore.js` | Batches, subjects, join codes, announcements, attendance, discussions | localStorage only. |
| `useAnalytics.js` | Analytics section response | Fetches backend endpoint. |

## Assessment file map

![Assessment module file map](../assets/workflows/04-assessment-file-map.png)

Important details:

- `assessment.data.js` defines types, seeded state, and `createBlankAssessment()`.
- `excelQuiz.service.js` parses XLSX/CSV into validated questions.
- `useAssessmentStore.js` owns CRUD, status, submission, grading, and Q&A.
- Quiz submissions are scored in the browser and stored as graded.
- File uploads validate type/size. In API mode they upload through `/api/portal/files/upload`; offline mode stores submission metadata only.
- JavaScript code tests run in the browser; other languages display the need for a secure runner API.

## API mode

`VITE_ENABLE_API=true` activates API-backed Admin and Student hooks. `services/api.js` reads session fields and sends:

- `X-Organization-ID`
- `X-User-Id`
- `X-User-Role`

When API mode is disabled or loading fails, selected modules use seeded/local data. The Assessment store now supports API mode; the Batch store remains local regardless of this flag.

## Frontend contribution rules

- Follow existing feature folders and keep portal-specific state near the portal.
- Add shared primitives only when multiple features use them.
- Preserve purple/teal design tokens and responsive breakpoints.
- Lazy-load large portal entry points.
- Never put secrets in `VITE_*` variables; Vite exposes them to the browser.
- Update route, feature, and execution-flow docs when changing navigation.
