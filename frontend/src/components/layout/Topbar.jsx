import { CheckCircle2, ChevronRight, Moon, RotateCcw, Sun } from "lucide-react";

function getViewLabel(view) {
  if (view.includes("category")) return "Categories";
  if (view.includes("course")) return "Courses";
  return view[0].toUpperCase() + view.slice(1);
}

export default function Topbar({ view, stats, theme, onThemeToggle, onReset, user }) {
  const label = getViewLabel(view);
  const ThemeIcon = theme === "dark" ? Sun : Moon;

  return (
    <header className="topbar">
      <div className="breadcrumbs"><span>Dashboard</span><ChevronRight size={16} /><strong>{label}</strong></div>
      <div className="topbar-actions">
        <span className="status-pill"><CheckCircle2 size={15} /> {stats.activeCourses} active courses</span>
        <button className="icon-text ghost theme-toggle" onClick={onThemeToggle} title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
          <ThemeIcon size={16} /> {theme === "dark" ? "Light" : "Dark"}
        </button>
        <button className="icon-text ghost" onClick={onReset} title="Reset seeded prototype data"><RotateCcw size={16} /> Reset</button>
        <div className="avatar">{user?.name?.charAt(0) || "A"}</div>
      </div>
    </header>
  );
}
