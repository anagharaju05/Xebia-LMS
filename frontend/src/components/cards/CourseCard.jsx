import { ArrowRight, CircleGauge, Eye, Globe2, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "../common/StatusBadge.jsx";
import { brand } from "../../utils/data.js";
import { createSlug } from "../../utils/slug.utils.js";
import { getCategoryImage } from "../../utils/categoryImage.utils.js";

export default function CourseCard({
  course,
  category,
  moduleCount,
  onEdit,
  onDelete,
  onToggle,
  onOpen,
  preview,
  previewActions
}) {
  const accent = course.accentColor || category?.accentColor || brand.velvet;
  const courseImage = course.thumbnail || getCategoryImage(category);

  return (
    <article className="course-card" style={{ "--accent": accent }}>
      <div className="card-accent" />
      <div className="course-art" style={{ "--accent": accent }}>
        <img src={courseImage} alt="" />
        <span className="course-icon"><img src={courseImage} alt="" /></span>
        {!preview && course.isFeatured && <span className="featured-dot" title="Featured" />}
      </div>
      <div className="course-body">
        <div className="badge-row">
          <span className="soft-badge" style={{ "--accent": accent }}>{category?.name || "Uncategorized"}</span>
          <span className="level-badge">{course.level}</span>
        </div>
        <h3>{course.title || "Untitled Course"}</h3>
        <span className="slug">/{course.slug || createSlug(course.title)}</span>
        <p>{course.shortDescription || "No short description yet."}</p>
        <div className="meta-row">
          <span><Globe2 size={15} /> {course.language || "English"}</span>
          <span><CircleGauge size={15} /> {course.duration || "0 hrs"}</span>
          <span>{moduleCount || 0} Modules</span>
        </div>
        <div className="card-footer">
          <div className="badge-row">
            <StatusBadge active={course.isActive} label={course.isActive ? "Active" : "Inactive"} />
            <StatusBadge active={course.isPublished} label={course.isPublished ? "Published" : "Draft"} muted={!course.isPublished} />
          </div>
          {!preview && !previewActions && (
            <div className="card-actions">
              <button title="Open curriculum" onClick={onOpen}><ArrowRight size={17} /></button>
              <button title="Toggle published" onClick={() => onToggle("isPublished")}><Eye size={17} /></button>
              <button title="Edit course" onClick={onEdit}><Pencil size={17} /></button>
              <button title="Delete course" className="danger" onClick={onDelete}><Trash2 size={17} /></button>
            </div>
          )}
          {previewActions && <button className="icon-text" onClick={onOpen}>Open <ArrowRight size={16} /></button>}
        </div>
      </div>
    </article>
  );
}
