import { useEffect, useMemo, useState } from "react";
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
import StudentPortal from "../features/student/StudentPortal.jsx";
import LoginPage from "../features/auth/LoginPage.jsx";
import { useAuth } from "../features/auth/useAuth.js";
import { useLmsStore } from "../hooks/useLmsStore.js";
import { useTheme } from "../hooks/useTheme.js";
import { useToast } from "../hooks/useToast.js";
import { createSlug } from "../utils/slug.utils.js";
import { getActiveNavigationView, VIEWS } from "./routes.js";

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
  const [view, setView] = useState(VIEWS.DASHBOARD);
  const [editing, setEditing] = useState({ type: "", id: "" });
  const [selectedCourseId, setSelectedCourseId] = useState(INITIAL_SELECTION.courseId);
  const [selectedModuleId, setSelectedModuleId] = useState(INITIAL_SELECTION.moduleId);
  const [selectedSubmoduleId, setSelectedSubmoduleId] = useState(INITIAL_SELECTION.submoduleId);
  const { message: toastMessage, showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const {
    store,
    upsertEntity,
    handleDeleteCategory,
    handleDeleteCourse,
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

  function handleNavigate(targetView) {
    setView(targetView);
    setEditing({ type: "", id: "" });
  }

  function handleSaveCategory(record) {
    const category = { ...record, slug: record.slug || createSlug(record.name) };
    upsertEntity("categories", category, category.id ? "Category updated" : "Category created");
    handleNavigate(VIEWS.CATEGORIES);
  }

  function handleSaveCourse(record) {
    const course = { ...record, slug: record.slug || createSlug(record.title) };
    const id = upsertEntity("courses", course, course.id ? "Course updated" : "Course created");
    setSelectedCourseId(id);
    handleNavigate(VIEWS.COURSES);
  }

  function handleOpenCurriculum(courseId) {
    const firstModule = store.modules.find((item) => item.courseId === courseId);
    const firstSubmodule = firstModule
      ? store.submodules.find((item) => item.moduleId === firstModule.id)
      : null;
    setSelectedCourseId(courseId);
    setSelectedModuleId(firstModule?.id || "");
    setSelectedSubmoduleId(firstSubmodule?.id || "");
    handleNavigate(VIEWS.CURRICULUM);
  }

  function renderSelectedPage() {
    if (view === VIEWS.DASHBOARD) return <DashboardPage store={store} stats={stats} go={handleNavigate} />;
    if (view === VIEWS.STUDENTS) return <StudentsPage store={store} showToast={showToast} />;

    if (view === VIEWS.CATEGORY_FORM) {
      const category = store.categories.find((item) => item.id === editing.id);
      return <CategoryEditor key={editing.id || "new-category"} initial={category} categories={store.categories} onCancel={() => handleNavigate(VIEWS.CATEGORIES)} onSave={handleSaveCategory} />;
    }

    if (view === VIEWS.COURSE_FORM) {
      const course = store.courses.find((item) => item.id === editing.id);
      return <CourseEditor key={editing.id || "new-course"} initial={course} categories={store.categories} onCancel={() => handleNavigate(VIEWS.COURSES)} onSave={handleSaveCourse} />;
    }

    if (view === VIEWS.COURSES) {
      return <CoursesPage store={store} onCreate={() => { setEditing({ type: "course", id: "" }); setView(VIEWS.COURSE_FORM); }} onEdit={(id) => { setEditing({ type: "course", id }); setView(VIEWS.COURSE_FORM); }} onDelete={handleDeleteCourse} onToggle={(id, field) => handleToggleEntity("courses", id, field)} onOpenCurriculum={handleOpenCurriculum} />;
    }

    if (view === VIEWS.CURRICULUM) {
      return <CurriculumPage store={store} selectedCourseId={selectedCourseId} setSelectedCourseId={setSelectedCourseId} selectedModuleId={selectedModuleId} setSelectedModuleId={setSelectedModuleId} selectedSubmoduleId={selectedSubmoduleId} setSelectedSubmoduleId={setSelectedSubmoduleId} upsert={upsertEntity} removeModule={handleDeleteModule} removeSubmodule={handleDeleteSubmodule} removeContentBlock={handleDeleteContentBlock} toggleEntity={handleToggleEntity} />;
    }

    if (view === VIEWS.CONTENT) {
      return <ContentLibraryPage store={store} upsert={upsertEntity} removeContentBlock={handleDeleteContentBlock} toggleEntity={handleToggleEntity} />;
    }

    return <CategoriesPage store={store} onCreate={() => { setEditing({ type: "category", id: "" }); setView(VIEWS.CATEGORY_FORM); }} onEdit={(id) => { setEditing({ type: "category", id }); setView(VIEWS.CATEGORY_FORM); }} onDelete={handleDeleteCategory} />;
  }

  if (!auth.session) {
    return <LoginPage onLogin={auth.login} />;
  }

  if (auth.session.role === "student") {
    return (
      <>
        <StudentPortal store={store} theme={theme} onThemeToggle={toggleTheme} user={auth.session} onLogout={auth.logout} showToast={showToast} />
        <Toast message={toastMessage} />
      </>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar active={getActiveNavigationView(view)} onNavigate={handleNavigate} user={auth.session} onLogout={auth.logout} />
      <main className="app-main">
        <Topbar view={view} stats={stats} theme={theme} onThemeToggle={toggleTheme} onReset={handleResetStore} user={auth.session} />
        <Toast message={toastMessage} />
        {renderSelectedPage()}
      </main>
    </div>
  );
}
