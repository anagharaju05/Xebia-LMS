import { useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import PageTitle from "../../components/common/PageTitle.jsx";
import Toolbar from "../../components/common/Toolbar.jsx";
import SearchBox from "../../components/common/SearchBox.jsx";
import Select from "../../components/common/Select.jsx";
import CourseCard from "../../components/cards/CourseCard.jsx";
import { levels } from "../../utils/data.js";
import { filterCourses } from "./course.helpers.js";

export default function CoursesPage({ store, onCreate, onEdit, onDelete, onToggle, onOpenCurriculum }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("All");
  const [status, setStatus] = useState("All");
  const categoriesById = Object.fromEntries(store.categories.map((item) => [item.id, item]));
  const courses = filterCourses(store.courses, query, level, status);

  return (
    <section className="page">
      <PageTitle
        icon={BookOpen}
        title="Courses"
        subtitle="Create, preview, publish and maintain course schema records."
        action={<button className="primary" onClick={onCreate}><Plus size={18} /> Create Course</button>}
      />
      <Toolbar>
        <SearchBox value={query} onChange={setQuery} placeholder="Search courses by title..." />
        <Select value={level} onChange={setLevel} options={["All", ...levels]} />
        <Select value={status} onChange={setStatus} options={["All", "Active", "Published", "Draft"]} />
        <span className="muted-count">{courses.length} courses</span>
      </Toolbar>
      <div className="course-grid">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            category={categoriesById[course.categoryId]}
            moduleCount={store.modules.filter((item) => item.courseId === course.id).length}
            onEdit={() => onEdit(course.id)}
            onDelete={() => onDelete(course.id)}
            onToggle={(field) => onToggle(course.id, field)}
            onOpen={() => onOpenCurriculum(course.id)}
          />
        ))}
      </div>
    </section>
  );
}
