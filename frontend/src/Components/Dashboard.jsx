import React from 'react';

const Dashboard = ({ toggleTheme, isDarkMode }) => {
  return (
    <>
      <header className="navbar">
        <div className="logo">🔥 Golden Ember SMS</div>
        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#students">Students</a>
          <a href="#courses">Courses</a>
          <a href="#reports">Reports</a>
        </nav>
        <button id="toggleTheme" onClick={toggleTheme}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </header>

      <section className="hero">
        <h1>Student Management System</h1>
        <p>Manage students, courses, and records efficiently with Golden Ember UI.</p>
        <div className="buttons">
          <button className="btn primary">Get Started</button>
          <button className="btn secondary">Learn More</button>
        </div>
      </section>

      <section className="features">
        <FeatureCard icon="👨‍🎓" title="Students" text="Manage student profiles and academic records." />
        <FeatureCard icon="📚" title="Courses" text="Create and organize course structures easily." />
        <FeatureCard icon="📊" title="Reports" text="Generate performance and attendance reports." />
      </section>

      <footer>
        <p>© 2026 Golden Ember Student System</p>
      </footer>
    </>
  );
};

// Small reusable sub-component
const FeatureCard = ({ icon, title, text }) => (
  <div className="card">
    <h3>{icon} {title}</h3>
    <p>{text}</p>
  </div>
);

export default Dashboard;