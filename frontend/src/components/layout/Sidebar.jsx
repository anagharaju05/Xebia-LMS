import { NAV_ITEMS } from "../../app/constants.js";

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <img src="/brand/Logo-Purple.png" alt="Xebia LMS" />
        <div>
          <strong>Xebia LMS</strong>
          <span>Admin Panel</span>
        </div>
      </div>
      <div className="menu-label">Main Menu</div>
      <nav className="side-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => onNavigate(item.id)}>
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="avatar">A</div>
        <div>
          <strong>Admin User</strong>
          <span>admin@xebia.com</span>
        </div>
      </div>
    </aside>
  );
}