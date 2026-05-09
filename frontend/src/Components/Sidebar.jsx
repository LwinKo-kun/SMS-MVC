import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "🏠 Dashboard" },
  { to: "/students", label: "👨‍🎓 Students" },
  { to: "/courses", label: "📚 Courses" },
  { to: "/attendance", label: "📅 Attendance" },
  { to: "/reports", label: "📊 Reports" }
];

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(
        "http://localhost/student-MVC/backend/api/logout.php",
        { credentials: "include" }
      );
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <h2 className="logo">🔥 Golden Ember</h2>
      </div>

      <nav className="sidebar-links">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " sidebar-link--active" : ""}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button type="button" className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
