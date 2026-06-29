import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Layers3 } from "lucide-react";
import PageTitle from "../../components/common/PageTitle.jsx";
import CourseCard from "../../components/cards/CourseCard.jsx";
import CurriculumManager from "./CurriculumManager.jsx";
import ContentBlockEditor from "../content/ContentBlockEditor.jsx";

export default function CurriculumPage({ store, selectedCourseId, setSelectedCourseId, selectedModuleId, setSelectedModuleId, selectedSubmoduleId, setSelectedSubmoduleId, upsert, removeModule, removeSubmodule, removeContentBlock, toggleEntity }) {
  const categoriesById = Object.fromEntries(store.categories.map((item) => [item.id, item]));
  const selectedCourse = store.courses.find((item) => item.id === selectedCourseId);
  const [curriculumStep, setCurriculumStep] = useState("modules");

  useEffect(() => {
    setCurriculumStep("modules");
  }, [selectedCourseId]);

  if (!selectedCourse) {
    return (
      <section className="page">
        <PageTitle icon={Layers3} title="Curriculum" subtitle="Select a course below to manage its modules, submodules and content." />
        <div className="course-grid">
          {store.courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              category={categoriesById[course.categoryId]}
              moduleCount={store.modules.filter((item) => item.courseId === course.id).length}
              onOpen={() => {
                setSelectedCourseId(course.id);
                setCurriculumStep("modules");
                const firstModule = store.modules.find((item) => item.courseId === course.id);
                setSelectedModuleId(firstModule?.id || "");
                const firstSubmodule = firstModule ? store.submodules.find((item) => item.moduleId === firstModule.id) : null;
                setSelectedSubmoduleId(firstSubmodule?.id || "");
              }}
              previewActions
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="curriculum-heading">
        <button className="ghost icon-text" onClick={() => setSelectedCourseId("")}><ArrowLeft size={16} /> All Courses</button>
        <div>
          <span>Curriculum</span>
          <h2>{selectedCourse.title}</h2>
        </div>
        <span className="status-pill"><CheckCircle2 size={15} /> All changes saved</span>
      </div>
      <CurriculumManager
        store={store}
        course={selectedCourse}
        selectedModuleId={selectedModuleId}
        setSelectedModuleId={setSelectedModuleId}
        selectedSubmoduleId={selectedSubmoduleId}
        setSelectedSubmoduleId={setSelectedSubmoduleId}
        step={curriculumStep}
        setStep={setCurriculumStep}
        upsert={upsert}
        removeModule={removeModule}
        removeSubmodule={removeSubmodule}
        toggleEntity={toggleEntity}
      />
      {curriculumStep === "submodules" && selectedSubmoduleId && (
        <ContentBlockEditor
          store={store}
          selectedSubmoduleId={selectedSubmoduleId}
          upsert={upsert}
          removeContentBlock={removeContentBlock}
          toggleEntity={toggleEntity}
        />
      )}
    </section>
  );
}
