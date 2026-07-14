import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import Toast from "../components/common/Toast.jsx";
import DashboardPage from "../features/dashboard/DashboardPage.jsx";
import CategoriesPage from "../features/categories/CategoriesPage.jsx";
import CategoryEditor from "../features/categories/CategoryEditor.jsx";
import CoursesPage from "../features/courses/CoursesPage.jsx";
import CourseEditor from "../features/courses/CourseEditor.jsx";
import CurriculumPage from "../features/curriculum/CurriculumPage.jsx";
import ContentLibraryPage from "../features/content/ContentLibraryPage.jsx";
import StudentsPage from "../features/students/StudentsPage.jsx";
import AdminAssessmentsPage from "../features/assessments/AdminAssessmentsPage.jsx";
import EventsPage from "../features/events/EventsPage.jsx";
import { ErrorBoundary } from "../components/ErrorBoundary.jsx";
import LoginPage from "../features/auth/LoginPage.jsx";
import { useAssessmentStore } from "../features/assessments/useAssessmentStore.js";
import { useBatchStore } from "../features/batches/useBatchStore.js";
import { useAuth } from "../features/auth/useAuth.js";
import { useLmsStore } from "../hooks/useLmsStore.js";
import { useTheme } from "../hooks/useTheme.js";
import { useToast } from "../hooks/useToast.js";
import { createSlug } from "../utils/slug.utils.js";
import { APP_ROUTES } from "./routes.js";
import "../styles/analytics.css";
import "../styles/events.css";

// Analytics Pages
import ExecutiveSummary from "../features/analytics/components/sections/ExecutiveSummary.jsx";
import LearningCoverage from "../features/analytics/components/sections/LearningCoverage.jsx";
import LearningHours from "../features/analytics/components/sections/LearningHours.jsx";
import LearningPillars from "../features/analytics/components/sections/LearningPillars.jsx";
import AiTransformation from "../features/analytics/components/sections/AiTransformation.jsx";
import Certifications from "../features/analytics/components/sections/Certifications.jsx";
import FlagshipPrograms from "../features/analytics/components/sections/FlagshipPrograms.jsx";
import LearningTrends from "../features/analytics/components/sections/LearningTrends.jsx";
import TrainingEffectiveness from "../features/analytics/components/sections/TrainingEffectiveness.jsx";
import LearningChampions from "../features/analytics/components/sections/LearningChampions.jsx";
import ProjectInvestment from "../features/analytics/components/sections/ProjectInvestment.jsx";
import FresherJourney from "../features/analytics/components/sections/FresherJourney.jsx";

const StudentPortal = lazy(() => import("../features/student/StudentPortal.jsx"));
const TeacherPortal = lazy(() => import("../features/teacher/TeacherPortal.jsx"));

function PortalLoading() {
  return <main className="portal-loading" aria-live="polite"><span /><strong>Preparing your learning workspace…</strong></main>;
}

function toUUID(str) {
  if (!str) return "00000000-0000-0000-0000-000000000000";
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;
  let hashStr = "";
  for (let i = 0; i < 32; i += 1) {
    const charCode = str.charCodeAt(i % str.length) || 0;
    hashStr += ((charCode * (i + 1)) % 16).toString(16);
  }
  return `${hashStr.slice(0, 8)}-${hashStr.slice(8, 12)}-4${hashStr.slice(13, 16)}-a${hashStr.slice(17, 20)}-${hashStr.slice(20, 32)}`;
}

const INITIAL_SELECTION = {
  courseId: toUUID("course-spring"),
  moduleId: toUUID("mod-spring-1"),
  submoduleId: toUUID("sub-spring-1")
};

export default function App() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [editing, setEditing] = useState({ type: "", id: "" });
  const [selectedCourseId, setSelectedCourseId] = useState(INITIAL_SELECTION.courseId);
  const [selectedModuleId, setSelectedModuleId] = useState(INITIAL_SELECTION.moduleId);
  const [selectedSubmoduleId, setSelectedSubmoduleId] = useState(INITIAL_SELECTION.submoduleId);
  const { message: toastMessage, showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const assessmentStore = useAssessmentStore();
  const batchStore = useBatchStore();
  const {
    store,
    upsertEntity,
    deleteEntity,
    handleDeleteCategory,
    handleDeleteCourse,
    handleDeleteEvent,
    handleDeleteModule,
    handleDeleteSubmodule,
    handleDeleteContentBlock,
    handleToggleEntity,
    handleResetStore
  } = useLmsStore(showToast);

  useEffect(() => {
    if (store.courses.length > 0 && !store.courses.some((course) => course.id === selectedCourseId)) {
      const firstCourse = store.courses[0];
      const firstModule = store.modules.find((module) => module.courseId === firstCourse.id);
      const firstSubmodule = firstModule
        ? store.submodules.find((submodule) => submodule.moduleId === firstModule.id)
        : null;
      setSelectedCourseId(firstCourse.id);
      setSelectedModuleId(firstModule?.id || "");
      setSelectedSubmoduleId(firstSubmodule?.id || "");
    }
  }, [store, selectedCourseId]);

  const stats = useMemo(() => ({
    activeCategories: store.categories.filter((item) => item.status === "Active").length,
    activeCourses: store.courses.filter((item) => item.isActive).length,
    publishedCourses: store.courses.filter((item) => item.isPublished).length,
    activeBlocks: store.contentBlocks.filter((item) => item.isActive).length,
    modules: store.modules.length,
    submodules: store.submodules.length
  }), [store]);

  function handleNavigate(targetPath) {
    navigate(targetPath);
    setEditing({ type: "", id: "" });
  }

  function handleSaveCategory(record) {
    const category = { ...record, slug: record.slug || createSlug(record.name) };
    upsertEntity("categories", category, category.id ? "Category updated" : "Category created");
    handleNavigate(APP_ROUTES.CATEGORIES);
  }

  function handleSaveCourse(record) {
    const course = { ...record, slug: record.slug || createSlug(record.title) };
    const id = upsertEntity("courses", course, course.id ? "Course updated" : "Course created");
    setSelectedCourseId(id);
    handleNavigate(APP_ROUTES.COURSES);
  }

  function handleOpenCurriculum(courseId) {
    const firstModule = store.modules.find((item) => item.courseId === courseId);
    const firstSubmodule = firstModule
      ? store.submodules.find((item) => item.moduleId === firstModule.id)
      : null;
    setSelectedCourseId(courseId);
    setSelectedModuleId(firstModule?.id || "");
    setSelectedSubmoduleId(firstSubmodule?.id || "");
    handleNavigate(`/courses/${courseId}/curriculum`);
  }

  if (!auth.session) {
    return <LoginPage onLogin={auth.login} />;
  }

  if (auth.session.role === "student") {
    return (
      <>
        <Suspense fallback={<PortalLoading />}><StudentPortal store={store} theme={theme} onThemeToggle={toggleTheme} user={auth.session} onLogout={auth.logout} showToast={showToast} assessmentStore={assessmentStore} batchStore={batchStore} upsertEntity={upsertEntity} deleteEntity={deleteEntity} /></Suspense>
        <Toast message={toastMessage} />
      </>
    );
  }

  if (auth.session.role === "teacher") {
    return (
      <>
        <Suspense fallback={<PortalLoading />}><TeacherPortal store={store} assessmentStore={assessmentStore} batchStore={batchStore} theme={theme} onThemeToggle={toggleTheme} user={auth.session} onLogout={auth.logout} showToast={showToast} /></Suspense>
        <Toast message={toastMessage} />
      </>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar user={auth.session} onLogout={auth.logout} />
      <main className="app-main">
        <Topbar view={location.pathname} stats={stats} theme={theme} onThemeToggle={toggleTheme} onReset={handleResetStore} user={auth.session} />
        <Toast message={toastMessage} />
        
        <ErrorBoundary>
          <Routes>
            <Route path={APP_ROUTES.DASHBOARD} element={<DashboardPage store={store} stats={stats} go={handleNavigate} />} />
            <Route path={APP_ROUTES.CATEGORIES} element={<CategoriesPage store={store} onCreate={() => { setEditing({ type: "category", id: "" }); handleNavigate("/categories/new"); }} onEdit={(id) => { setEditing({ type: "category", id }); handleNavigate(`/categories/${id}`); }} onDelete={handleDeleteCategory} />} />
            <Route path="/categories/:id" element={<CategoryEditor key={editing.id || "new-category"} initial={store.categories.find((item) => item.id === editing.id)} categories={store.categories} onCancel={() => handleNavigate(APP_ROUTES.CATEGORIES)} onSave={handleSaveCategory} />} />
            <Route path={APP_ROUTES.COURSES} element={<CoursesPage store={store} onCreate={() => { setEditing({ type: "course", id: "" }); handleNavigate("/courses/new"); }} onEdit={(id) => { setEditing({ type: "course", id }); handleNavigate(`/courses/${id}`); }} onDelete={handleDeleteCourse} onToggle={(id, field) => handleToggleEntity("courses", id, field)} onOpenCurriculum={handleOpenCurriculum} />} />
            <Route path="/courses/:id" element={<CourseEditor key={editing.id || "new-course"} initial={store.courses.find((item) => item.id === editing.id)} categories={store.categories} onCancel={() => handleNavigate(APP_ROUTES.COURSES)} onSave={handleSaveCourse} />} />
            <Route path={APP_ROUTES.CURRICULUM} element={<CurriculumPage store={store} selectedCourseId={selectedCourseId} setSelectedCourseId={setSelectedCourseId} selectedModuleId={selectedModuleId} setSelectedModuleId={setSelectedModuleId} selectedSubmoduleId={selectedSubmoduleId} setSelectedSubmoduleId={setSelectedSubmoduleId} upsert={upsertEntity} removeModule={handleDeleteModule} removeSubmodule={handleDeleteSubmodule} removeContentBlock={handleDeleteContentBlock} toggleEntity={handleToggleEntity} onBack={() => handleNavigate(APP_ROUTES.COURSES)} />} />
            <Route path={APP_ROUTES.CONTENT} element={<ContentLibraryPage store={store} upsert={upsertEntity} removeContentBlock={handleDeleteContentBlock} toggleEntity={handleToggleEntity} />} />
            <Route path={APP_ROUTES.STUDENTS} element={<StudentsPage store={store} showToast={showToast} />} />
            <Route path="/assessments" element={<AdminAssessmentsPage showToast={showToast} />} />
            <Route path={APP_ROUTES.EVENTS} element={<EventsPage store={store} upsertEvent={upsertEntity} deleteEvent={handleDeleteEvent} showToast={showToast} />} />
                
            {/* Analytics Routes */}
            <Route path={APP_ROUTES.ANALYTICS_EXEC_SUMMARY} element={<ExecutiveSummary />} />
            <Route path={APP_ROUTES.ANALYTICS_COVERAGE} element={<LearningCoverage />} />
            <Route path={APP_ROUTES.ANALYTICS_HOURS} element={<LearningHours />} />
            <Route path={APP_ROUTES.ANALYTICS_PILLARS} element={<LearningPillars />} />
            <Route path={APP_ROUTES.ANALYTICS_AI} element={<AiTransformation />} />
            <Route path={APP_ROUTES.ANALYTICS_CERTS} element={<Certifications />} />
            <Route path={APP_ROUTES.ANALYTICS_FLAGSHIP} element={<FlagshipPrograms />} />
            <Route path={APP_ROUTES.ANALYTICS_TRENDS} element={<LearningTrends />} />
            <Route path={APP_ROUTES.ANALYTICS_EFFECTIVENESS} element={<TrainingEffectiveness />} />
            <Route path={APP_ROUTES.ANALYTICS_CHAMPIONS} element={<LearningChampions />} />
            <Route path={APP_ROUTES.ANALYTICS_INVESTMENT} element={<ProjectInvestment />} />
            <Route path={APP_ROUTES.ANALYTICS_FRESHER} element={<FresherJourney />} />

            <Route path="*" element={<Navigate to={APP_ROUTES.DASHBOARD} replace />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}
