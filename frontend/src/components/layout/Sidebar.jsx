import { LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { NAV_ITEMS } from "../../app/constants.js";

export default function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <img src="/brand/Logo-Purple.png" alt="Xebia LMS" />
        <div><strong>Xebia LMS</strong><span>Admin Panel</span></div>
      </div>
      <div className="menu-label">Main Menu</div>
      <nav className="side-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <button key={item.id} aria-label={item.label} className={isActive ? "active" : ""} onClick={() => navigate(item.path)}>
              <Icon size={20} /><span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="avatar">{user?.name?.charAt(0) || "A"}</div>
        <div><strong>{user?.name || "Admin User"}</strong><span>{user?.email || "admin@xebia.com"}</span></div>
        <button className="sidebar-logout" onClick={onLogout} title="Sign out"><LogOut size={18} /></button>
      </div>
    </aside>
  );
}
