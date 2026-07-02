import { LogOut, ChevronDown, ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { NAV_ITEMS } from "../../app/constants.js";
import { useState } from "react";

export default function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedFolders, setExpandedFolders] = useState({
    analytics: location.pathname.includes("/learning-analytics")
  });

  const toggleFolder = (id) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
          
          if (item.subItems) {
            const isExpanded = expandedFolders[item.id];
            return (
              <div key={item.id} className="nav-folder">
                <button aria-label={item.label} className={`folder-btn ${isActive ? "active-folder" : ""}`} onClick={() => toggleFolder(item.id)}>
                  <span className="folder-icon-label"><Icon size={20} /><span>{item.label}</span></span>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {isExpanded && (
                  <div className="sub-nav">
                    {item.subItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = location.pathname === subItem.path;
                      return (
                        <button key={subItem.id} className={`sub-item ${isSubActive ? "active" : ""}`} onClick={() => navigate(subItem.path)}>
                          <SubIcon size={16} /><span>{subItem.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

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
