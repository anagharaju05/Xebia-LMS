import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Layers3 } from "lucide-react";
import PageTitle from "../../components/common/PageTitle.jsx";
import CourseCard from "../../components/cards/CourseCard.jsx";
import CurriculumManager from "./CurriculumManager.jsx";
import ContentBlockEditor from "../content/ContentBlockEditor.jsx";

export default function CurriculumPage({ store, selectedCourseId, setSelectedCourseId, selectedModuleId, setSelectedModuleId, selectedSubmoduleId, setSelectedSubmoduleId, upsert, removeModule, removeSubmodule, removeContentBlock, toggleEntity, onBack }) {
  const categoriesById = Object.fromEntries(store.categories.map((item) => [item.id, item]));
  const selectedCourse = store.courses.find((item) => item.id === selectedCourseId);
  const [curriculumStep, setCurriculumStep] = useState("modules");

  useEffect(() => {
    setCurriculumStep("modules");
  }, [selectedCourseId]);

  if (!selectedCourse) {
    return (
      <section className="page">
        <PageTitle icon={Layers3} title="Course Not Found" subtitle="Please select a valid course from the courses page." />
        <button className="ghost icon-text" onClick={onBack}><ArrowLeft size={16} /> Back to Courses</button>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="curriculum-heading">
        <button className="ghost icon-text" onClick={onBack}><ArrowLeft size={16} /> All Courses</button>
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
