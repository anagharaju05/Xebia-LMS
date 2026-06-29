import { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import EmptyState from "../../components/common/EmptyState.jsx";
import ModuleRow from "../../components/cards/ModuleRow.jsx";
import ModuleEditor from "./ModuleEditor.jsx";
import SubmoduleEditor from "./SubmoduleEditor.jsx";
import { brand } from "../../utils/data.js";
import { createSlug } from "../../utils/slug.utils.js";
import {
  createEmptyModule,
  createEmptySubmodule,
  getSortedCourseModules,
  getSortedSubmodules
} from "./curriculum.helpers.js";

export default function CurriculumManager({ store, course, selectedModuleId, setSelectedModuleId, selectedSubmoduleId, setSelectedSubmoduleId, step, setStep, upsert, removeModule, removeSubmodule, toggleEntity }) {
  const courseModules = getSortedCourseModules(store.modules, course.id);
  const selectedModule = courseModules.find((item) => item.id === selectedModuleId) || courseModules[0];
  const submodules = selectedModule ? getSortedSubmodules(store.submodules, selectedModule.id) : [];
  const selectedSubmodule = submodules.find((item) => item.id === selectedSubmoduleId) || submodules[0];
  const [moduleForm, setModuleForm] = useState(() => selectedModule || createEmptyModule(course.id, courseModules.length + 1));
  const [submoduleForm, setSubmoduleForm] = useState(() => selectedSubmodule || createEmptySubmodule(selectedModule?.id || "", submodules.length + 1));

  useEffect(() => {
    if (selectedModule) setModuleForm(selectedModule);
  }, [selectedModule?.id]);

  useEffect(() => {
    if (selectedSubmodule) setSubmoduleForm(selectedSubmodule);
  }, [selectedSubmodule?.id]);

  function newModule() {
    setModuleForm(createEmptyModule(course.id, courseModules.length + 1));
  }

  function saveModule() {
    const final = { ...moduleForm, courseId: course.id, accentColor: moduleForm.accentColor || brand.velvet, slug: moduleForm.slug || createSlug(moduleForm.title) };
    const id = upsert("modules", final, final.id ? "Module updated" : "Module created");
    setSelectedModuleId(id);
  }

  function newSubmodule() {
    setSubmoduleForm(createEmptySubmodule(selectedModule?.id || "", submodules.length + 1));
  }

  function saveSubmodule() {
    const final = { ...submoduleForm, moduleId: selectedModule?.id || submoduleForm.moduleId, accentColor: submoduleForm.accentColor || brand.teal, slug: submoduleForm.slug || createSlug(submoduleForm.title) };
    const id = upsert("submodules", final, final.id ? "Submodule updated" : "Submodule created");
    setSelectedSubmoduleId(id);
  }

  return (
    <div className="curriculum-grid single-pane">
      {step === "modules" ? (
      <section className="manager-column">
        <div className="manager-title">
          <div>
            <h3>Modules</h3>
            <span>Course: {course.title}</span>
          </div>
          <button className="primary" onClick={newModule}><Plus size={18} /> Add Module</button>
        </div>
        <div className="stack-list">
          {courseModules.map((module) => (
            <ModuleRow
              key={module.id}
              item={module}
              active={module.id === selectedModule?.id}
              onSelect={() => {
                setSelectedModuleId(module.id);
                const firstSubmodule = store.submodules.find((item) => item.moduleId === module.id);
                setSelectedSubmoduleId(firstSubmodule?.id || "");
                setStep("submodules");
              }}
              onEdit={() => setModuleForm(module)}
              onDelete={() => removeModule(module.id)}
              onToggle={() => toggleEntity("modules", module.id, "isActive")}
            />
          ))}
        </div>
        <ModuleEditor form={moduleForm} setForm={setModuleForm} onSave={saveModule} />
      </section>
      ) : (
      <section className="manager-column">
        <div className="curriculum-step-bar">
          <button className="ghost icon-text" onClick={() => setStep("modules")}><ArrowLeft size={16} /> Back to Modules</button>
          <div className="curriculum-context-card">
            <span>Selected Module</span>
            <strong>{selectedModule?.title || "Select a module"}</strong>
            <em>/{selectedModule?.slug || "module"}</em>
          </div>
        </div>
        <div className="manager-title">
          <div>
            <h3>Submodules</h3>
            <span>Module: {selectedModule?.title || "Select a module"}</span>
          </div>
          <button className="primary" onClick={newSubmodule} disabled={!selectedModule}><Plus size={18} /> Add Submodule</button>
        </div>
        <div className="stack-list">
          {submodules.map((submodule) => (
            <ModuleRow
              key={submodule.id}
              item={submodule}
              active={submodule.id === selectedSubmodule?.id}
              onSelect={() => setSelectedSubmoduleId(submodule.id)}
              onEdit={() => setSubmoduleForm(submodule)}
              onDelete={() => removeSubmodule(submodule.id)}
              onToggle={() => toggleEntity("submodules", submodule.id, "isActive")}
              isSubmodule
            />
          ))}
        </div>
        {submodules.length === 0 && <EmptyState title="No submodules yet" text="Add the first lesson under this module." />}
        <SubmoduleEditor form={submoduleForm} setForm={setSubmoduleForm} onSave={saveSubmodule} disabled={!selectedModule} />
      </section>
      )}
    </div>
  );
}
