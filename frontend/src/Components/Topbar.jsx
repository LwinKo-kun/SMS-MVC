import React from "react";

const Topbar = ({ title, subtitle, toggleTheme, isDarkMode }) => (
  <header className="topbar">
    <div className="topbar-titles">
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
    <button type="button" className="theme-btn" onClick={toggleTheme}>
      {isDarkMode ? "☀️ Light" : "🌙 Dark"}
    </button>
  </header>
);

export default Topbar;
