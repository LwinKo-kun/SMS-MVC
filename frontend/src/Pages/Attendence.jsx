import React, { useEffect, useState } from "react";

const API = "http://localhost/student-MVC/backend/api";

const STATUSES = [
  { id: "present", label: "Present", emoji: "✓" },
  { id: "absent", label: "Absent", emoji: "✗" },
  { id: "late", label: "Late", emoji: "⏱" }
];

const railClass = {
  present: "feed-item__rail feed-item__rail--present",
  absent: "feed-item__rail feed-item__rail--absent",
  late: "feed-item__rail feed-item__rail--late"
};

const Attendance = () => {
  const [rows, setRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [attDate, setAttDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState("present");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadLists = async () => {
    setLoading(true);
    try {
      const [aRes, sRes, cRes] = await Promise.all([
        fetch(`${API}/get_attendance.php`, { credentials: "include" }),
        fetch(`${API}/get_students.php`, { credentials: "include" }),
        fetch(`${API}/get_courses.php`, { credentials: "include" })
      ]);

      const aJson = await aRes.json().catch(() => []);
      const sJson = await sRes.json().catch(() => []);
      const cJson = await cRes.json().catch(() => []);

      setRows(Array.isArray(aJson) ? aJson : []);
      setStudents(Array.isArray(sJson) ? sJson : []);
      setCourses(Array.isArray(cJson) ? cJson : []);
    } catch {
      setRows([]);
      setMessage("Could not load attendance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setMessage("");
    const sid = parseInt(studentId, 10);
    const cid = parseInt(courseId, 10);
    if (!sid || !cid || !attDate) {
      setMessage("Student, course, and date are required.");
      return;
    }

    const res = await fetch(`${API}/save_attendance.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        student_id: sid,
        course_id: cid,
        att_date: attDate,
        status
      })
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok || body.status !== "success") {
      setMessage(body.message || "Could not save attendance.");
      return;
    }

    setMessage("Attendance recorded.");
    loadLists();
  };

  return (
    <div className="page-wide mgmt-page">
      <h2 className="page-heading">Attendance</h2>
      <p className="page-lead">
        Tap a status for quick selection, then save. Recent marks appear as a
        timeline-style feed instead of a grid table.
      </p>

      {message ? (
        <p
          className={
            message.includes("recorded")
              ? "form-feedback form-feedback--success"
              : "form-feedback form-feedback--error"
          }
          role="status"
        >
          {message}
        </p>
      ) : null}

      <section className="panel-card panel-card--accent">
        <h3 className="panel-title">Mark attendance</h3>
        <form className="stack-form" onSubmit={save}>
          <label className="field-label">
            Student
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            >
              <option value="">Choose…</option>
              {students.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Course
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
            >
              <option value="">Choose…</option>
              {courses.map((c) => (
                <option key={c.course_id} value={c.course_id}>
                  {c.course_code} — {c.course_name}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Session date
            <input
              type="date"
              value={attDate}
              onChange={(e) => setAttDate(e.target.value)}
              required
            />
          </label>
          <div>
            <span className="field-label" style={{ marginBottom: "0.45rem" }}>
              Status
            </span>
            <div className="att-status-pick" role="group" aria-label="Status">
              {STATUSES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  data-status={s.id}
                  className={`att-status-btn${status === s.id ? " is-selected" : ""}`}
                  onClick={() => setStatus(s.id)}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-submit">
            Save mark
          </button>
        </form>
      </section>

      <section className="panel-card panel-card--ghost">
        <h3 className="panel-title">Recent activity</h3>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <p>No marks yet — use the form above.</p>
          </div>
        ) : (
          <div className="feed-list">
            {rows.map((r) => (
              <div key={r.attendance_id} className="feed-item">
                <div
                  className={railClass[r.status] || "feed-item__rail"}
                  aria-hidden
                />
                <div className="feed-item__body">
                  <p className="feed-item__title">{r.student_name}</p>
                  <p className="feed-item__sub">{r.course_name}</p>
                  <p className="feed-item__sub">
                    <strong>{r.att_date}</strong> ·{" "}
                    <span
                      className={`status-pill status-pill--att-${r.status}`}
                    >
                      {r.status}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Attendance;
