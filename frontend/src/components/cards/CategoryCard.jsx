import { BookOpen, Boxes, Pencil, Trash2 } from "lucide-react";
import CategoryThumb from "../common/CategoryThumb.jsx";
import StatusBadge from "../common/StatusBadge.jsx";
import { brand } from "../../utils/data.js";
import { createSlug } from "../../utils/slug.utils.js";

export default function CategoryCard({ category, onEdit, onDelete, preview }) {
  return (
    <article className="category-card" style={{ "--accent": category.accentColor || brand.teal }}>
      <div className="card-accent" />
      <div className="category-top">
        <CategoryThumb category={category} />
        <StatusBadge active={category.status === "Active"} label={category.status || "Active"} />
      </div>
      <h3>{category.name || "Untitled Category"}</h3>
      <span className="slug">/{category.slug || createSlug(category.name)}</span>
      <p>{category.description || "No category description yet."}</p>
      <div className="meta-row">
        <span><BookOpen size={16} /> {category.courses || 0} courses</span>
        <span><Boxes size={16} /> {category.learners || 0}</span>
      </div>
      <div className="card-footer">
        <span className="color-label"><i style={{ background: category.accentColor }} /> {category.accentColor || brand.teal}</span>
        {!preview && (
          <div className="card-actions">
            <button title="Edit category" onClick={onEdit}><Pencil size={17} /></button>
            <button title="Delete category" className="danger" onClick={onDelete}><Trash2 size={17} /></button>
          </div>
        )}
      </div>
    </article>
  );
}