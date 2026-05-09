import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const PAGE_META = {
  "/dashboard": {
    title: "Student Management System",
    subtitle: "Welcome back 👋"
  },
  "/students": {
    title: "Students",
    subtitle: "Register learners and enroll them into offerings"
  },
  "/courses": {
    title: "Courses",
    subtitle: "Start offerings for the catalog"
  },
  "/attendance": {
    title: "Attendance",
    subtitle: "Track daily attendance"
  },
  "/reports": {
    title: "Reports",
    subtitle: "Academic reports and summaries"
  }
};

const AppShell = ({ toggleTheme, isDarkMode }) => {
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] ?? {
    title: "Golden Ember SMS",
    subtitle: ""
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-main">
        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
        />
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppShell;
