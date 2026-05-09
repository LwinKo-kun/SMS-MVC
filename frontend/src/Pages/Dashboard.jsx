import React, { useEffect, useState } from "react";

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
    <div className="dashboard-page">
      <section className="hero-section">
        <div className="hero-card">
          <h2>Manage Everything Efficiently</h2>
          <p>
            Students, courses, attendance, reports, and academic records in one
            system.
          </p>
        </div>
      </section>

      <section className="stats-section">
        {loading ? (
          <p className="stats-loading">Loading stats...</p>
        ) : (
          <>
            <StatCard icon="👨‍🎓" title="Students" value={stats.students} />
            <StatCard icon="📚" title="Courses" value={stats.courses} />
            <StatCard icon="📝" title="Enrollments" value={stats.enrollments} />
            <StatCard icon="🎯" title="Grade rows" value={stats.grade_entries} />
          </>
        )}
      </section>

      <section className="features-section">
        <FeatureCard
          icon="👨‍🎓"
          title="Students"
          text="Manage student records and profiles."
        />
        <FeatureCard
          icon="📚"
          title="Courses"
          text="Organize courses and subjects."
        />
        <FeatureCard
          icon="📅"
          title="Attendance"
          text="Track daily attendance easily."
        />
        <FeatureCard
          icon="📊"
          title="Reports"
          text="Generate academic reports instantly."
        />
      </section>

      <footer className="dashboard-footer">
        <p>© 2026 Golden Ember SMS</p>
      </footer>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div className="stat-card">
    <div className="stat-card-icon" aria-hidden>
      {icon}
    </div>
    <h3>{title}</h3>
    <p className="stat-card-value">{value}</p>
  </div>
);

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
