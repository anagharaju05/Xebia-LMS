# 6. Execution Flows

[Back to documentation index](../README.md)

This section helps a contributor trace a user click to the next component, hook, API, and persistence layer.

## 1. Application login and role gate

```text
Browser
-> frontend/src/main.jsx
-> frontend/src/app/App.jsx
-> frontend/src/features/auth/LoginPage.jsx
-> select Admin / Teacher / Student and submit
-> frontend/src/features/auth/useAuth.js login()
-> frontend/src/features/auth/auth.data.js validation
-> localStorage xebia-lms-auth-session-v1
-> App.jsx role gate
```

Admin continues to React Router. Teacher and Student lazy-load their portal component.

## 2. Admin category creation

```text
Sidebar Categories button
-> components/layout/Sidebar.jsx navigate('/categories')
-> app/routes.js APP_ROUTES.CATEGORIES
-> App.jsx <Route>
-> CategoriesPage.jsx
-> Create Category
-> App.jsx handleNavigate('/categories/new')
-> CategoryEditor.jsx
-> Save Category
-> App.jsx handleSaveCategory()
-> useLmsStore.js upsertEntity('categories', ...)
-> local optimistic state
-> optional POST /api/categories
-> CategoryController -> CategoryServiceImpl -> CategoryRepository
-> redirect /categories
```

## 3. Admin course and curriculum

```text
Courses -> CoursesPage.jsx
-> Create/Edit -> CourseEditor.jsx
-> Save -> useLmsStore.js -> optional /api/courses
-> Courses list

Open Curriculum
-> App.jsx handleOpenCurriculum(courseId)
-> /courses/:courseId/curriculum
-> CurriculumPage.jsx
-> CurriculumManager.jsx
-> ModuleEditor / SubmoduleEditor / ContentBlockEditor
-> useLmsStore.js
-> optional module/submodule/content APIs
```

![Admin click-to-code map](../assets/workflows/01-entry-admin-navigation.png)

## 4. Teacher creates or edits an assessment

```text
TeacherPortal sidebar: Assessments
-> setView('assessments')
-> AssessmentsPage (inside TeacherPortal.jsx)
-> Create assessment or Edit row
-> setEditor(createBlankAssessment()) or setEditor(assessment)
-> AssessmentEditor
-> select file / quiz / coding
-> choose allocation scope
-> Save Draft or Publish
-> useAssessmentStore.js saveAssessment()
-> API mode: POST/PUT /api/assessments
-> AssessmentController -> AssessmentServiceImpl -> AssessmentRepository
-> Offline mode: localStorage xebia-lms-assessments-v2
-> updated AssessmentsPage
```

Excel branch:

```text
AssessmentEditor file input
-> importQuiz(event)
-> excelQuiz.service.js parseQuizSpreadsheet(file)
-> validate headers and rows
-> quizQuestions + totalMarks
-> AssessmentEditor preview
-> saveAssessment()
```

## 5. Student assessment visibility

```text
StudentPortal sidebar: Assessments
-> setView('assessments')
-> StudentAssessments.jsx
-> filter published assessments by studentId and joined batchIds
-> search/filter/sort
-> Open assessment
-> setSelectedId(assessment.id)
-> AssessmentDetail
```

Students outside `assignedStudentIds` and the allocated batches are filtered out in `StudentAssessments.jsx`.

## 6. Submission branches

### File

```text
AssessmentDetail -> FileSubmission
-> choose PDF/DOCX
-> validate extension and size
-> Turn in assessment
-> useAssessmentStore.js submitWork()
-> API mode: optional multipart upload, then student task submission
-> Offline mode: localStorage
-> status Submitted
```

### Excel quiz

```text
AssessmentDetail -> QuizSubmission
-> answer all questions
-> calculate correct answers and marks
-> submitWork({ type: 'quiz', score, quizAnswers, quizResults })
-> useAssessmentStore auto-grades offline, or serializes the calculated result through the task endpoint in API mode
-> status Graded
-> SubmissionResult displays answers and explanations
```

### Coding

```text
AssessmentDetail -> CodingSubmission
-> edit starter code
-> Run tests -> runJavascriptTests()
-> Submit code -> submitWork()
-> API mode: serialized student task submission
-> status Submitted
-> Teacher review required
```

## 7. Teacher review and feedback

```text
TeacherPortal sidebar: Submissions
-> setView('submissions')
-> SubmissionsPage
-> select assessment
-> Submitted / Not submitted tab
-> Review or Edit grade
-> ReviewModal
-> score + feedback
-> useAssessmentStore.js gradeSubmission()
-> API mode: PUT /api/management/students/assignments/{id}/review
-> status Graded
-> StudentAssessments SubmissionResult
```

## 8. Assessment Q&A

```text
StudentQuestionBox Ask question
-> useAssessmentStore.js askQuestion()
-> TeacherPortal QuestionsPage
-> Reply
-> useAssessmentStore.js answerQuestion()
-> StudentQuestionBox displays answer
```

## 9. API-mode assessment paths

Definition flow:

```text
useAssessmentStore.js saveAssessment()
-> /api/assessments
-> AssessmentController.java
-> AssessmentServiceImpl.java
-> AssessmentRepository.java
-> assessments + questions/options + tests + allocations
```

File/submission flow:

```text
StudentAssessments.jsx
-> FileController /api/portal/files/upload (file format only)
-> useAssessmentStore.js serializes file/quiz/code payload
-> StudentPortalController /tasks/{taskId}/submit
-> StudentAssignmentRepository
-> Teacher review endpoint
```

Q&A flow:

```text
useAssessmentStore askQuestion()/answerQuestion()
-> /api/assessments/questions
-> AssessmentController
-> StudentQuestionRepository
```

## 10. Existing generic student result endpoint

```text
POST /api/portal/students/{studentId}/assessments/{assessmentId}/submit
-> StudentPortalController.java
-> SubmitAssessmentRequest.java
-> StudentPortalService.java
-> StudentPortalServiceImpl.java
-> StudentAssessmentResultRepository.java
-> student_assessment_results
```

The current `useAssessmentStore.js` submission path uses the student task endpoint for rich serialized submission data rather than this generic result endpoint.

## Complete assessment file map

![Assessment module file-by-file map](../assets/workflows/04-assessment-file-map.png)
