import { Check, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "../common/StatusBadge.jsx";
import { brand } from "../../utils/data.js";

function formatOrderEmoji(order) {
  return String(order ?? 0)
    .split("")
    .map((digit) => `${digit}\uFE0F\u20E3`)
    .join("");
}

export default function ModuleRow({ item, active, onSelect, onEdit, onDelete, onToggle, isSubmodule }) {
  const accent = item.accentColor || (isSubmodule ? brand.teal : brand.velvet);
  return (
    <article
      className={`module-row module-card ${active ? "active" : ""} ${isSubmodule ? "submodule-card" : ""}`}
      style={{ "--module-accent": accent }}
    >
      <button className="module-select module-card-select" onClick={onSelect}>
        <span className="order" aria-label={`Order ${item.order}`}>
          {formatOrderEmoji(item.order)}
        </span>
        <span className="module-kind">{isSubmodule ? "Submodule" : "Module"}</span>
        <strong>{item.title}</strong>
        <em>/{item.slug}</em>
        <p>{item.description || "No description added yet."}</p>
      </button>
      <div className="module-card-footer">
        <StatusBadge active={item.isActive} label={item.isActive ? "Active" : "Inactive"} />
        <div className="module-actions">
          <button title="Toggle active" onClick={onToggle}><Check size={16} /></button>
          <button title={`Edit ${isSubmodule ? "submodule" : "module"}`} onClick={onEdit}><Pencil size={16} /></button>
          <button
            title={`Delete ${isSubmodule ? "submodule" : "module"}`}
            className="danger text-danger"
            onClick={onDelete}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
