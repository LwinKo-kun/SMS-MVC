import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    enrollments: 0,
    grade_entries: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost/student-MVC/backend/api/get_status.php", {
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        setStats({
          students: Number(data.students) || 0,
          courses: Number(data.courses) || 0,
          enrollments: Number(data.enrollments) || 0,
          grade_entries: Number(data.grade_entries) || 0
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Stats fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="dashboard-page mgmt-page">
      <section className="hero-section">
        <div className="hero-card">
          <h2>Golden Ember SMS</h2>
          <p>
            Interactive dashboard — tap a metric or shortcut to jump straight
            into work.
          </p>
          <nav className="quick-links" aria-label="Shortcuts">
            <Link className="quick-link" to="/students">
              Students
            </Link>
            <Link className="quick-link" to="/courses">
              Courses
            </Link>
            <Link className="quick-link" to="/attendance">
              Attendance
            </Link>
            <Link className="quick-link" to="/reports">
              Reports
            </Link>
          </nav>
        </div>
      </section>

      <section className="stats-section">
        {loading ? (
          <p className="stats-loading">Loading stats...</p>
        ) : (
          <>
            <Link className="stat-card stat-card--clickable" to="/students">
              <div className="stat-card-icon" aria-hidden>
                👨‍🎓
              </div>
              <h3>Students</h3>
              <p className="stat-card-value">{stats.students}</p>
            </Link>
            <Link className="stat-card stat-card--clickable" to="/courses">
              <div className="stat-card-icon" aria-hidden>
                📚
              </div>
              <h3>Courses</h3>
              <p className="stat-card-value">{stats.courses}</p>
            </Link>
            <Link className="stat-card stat-card--clickable" to="/students">
              <div className="stat-card-icon" aria-hidden>
                📝
              </div>
              <h3>Enrollments</h3>
              <p className="stat-card-value">{stats.enrollments}</p>
            </Link>
            <Link className="stat-card stat-card--clickable" to="/reports">
              <div className="stat-card-icon" aria-hidden>
                🎯
              </div>
              <h3>Grade rows</h3>
              <p className="stat-card-value">{stats.grade_entries}</p>
            </Link>
          </>
        )}
      </section>

      <section className="features-section">
        <FeatureCard
          icon="👨‍🎓"
          title="Students"
          text="Card directory with search — enroll without spreadsheet fatigue."
        />
        <FeatureCard
          icon="📚"
          title="Courses"
          text="Lifecycle chips and schedule tiles instead of wide tables."
        />
        <FeatureCard
          icon="📅"
          title="Attendance"
          text="One-tap status buttons plus a visual activity feed."
        />
        <FeatureCard
          icon="📊"
          title="Reports"
          text="Tabbed insights: stacked bars, averages, enrollment cards."
        />
      </section>

      <footer className="dashboard-footer">
        <p>© 2026 Golden Ember SMS</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, text }) => (
  <div className="feature-card">
    <h3>
      <span className="feature-card-icon" aria-hidden>
        {icon}
      </span>{" "}
      {title}
    </h3>
    <p>{text}</p>
  </div>
);

export default Dashboard;
