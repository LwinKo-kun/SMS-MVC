import React, { useEffect, useState, useCallback } from "react";

const API = "http://localhost/student-MVC/backend/api";

const isOkMessage = (msg) => /created|started|saved/i.test(msg || "");

const fmtDate = (d) => {
  if (!d) return "—";
  const t = new Date(d + "T12:00:00");
  return Number.isNaN(t.getTime())
    ? d
    : t.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
};

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newCourse, setNewCourse] = useState({
    course_name: "",
    course_code: "",
    credits: "3",
    description: "",
    start_date: new Date().toISOString().slice(0, 10),
    duration_weeks: "12",
    status: "active",
    instructor: ""
  });

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/get_courses.php`, {
        credentials: "include"
      });
      const json = await res.json().catch(() => []);
      setCourses(res.ok && Array.isArray(json) ? json : []);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewCourse((prev) => ({ ...prev, [name]: value }));
  };

  const startCourse = async (e) => {
    e.preventDefault();
    setMessage("");
    const creditsNum = parseInt(newCourse.credits, 10);
    const weeksNum = parseInt(newCourse.duration_weeks, 10);

    if (!newCourse.course_name.trim() || !newCourse.course_code.trim()) {
      setMessage("Give the course a title and a short code (e.g. CS101).");
      return;
    }

    if (!newCourse.start_date) {
      setMessage("Pick a start date for this offering.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/create_course.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          course_name: newCourse.course_name.trim(),
          course_code: newCourse.course_code.trim(),
          credits: Number.isFinite(creditsNum) ? creditsNum : 3,
          description: newCourse.description.trim(),
          start_date: newCourse.start_date,
          duration_weeks: Number.isFinite(weeksNum) ? weeksNum : 12,
          status: newCourse.status,
          instructor: newCourse.instructor.trim()
        })
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok || body.status !== "success") {
        setMessage(body.message || "Could not start course.");
        return;
      }

      setNewCourse({
        course_name: "",
        course_code: "",
        credits: "3",
        description: "",
        start_date: new Date().toISOString().slice(0, 10),
        duration_weeks: "12",
        status: "active",
        instructor: ""
      });
      setMessage("Course started — visible in the catalog with schedule.");
      await loadCourses();
    } catch {
      setMessage("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wide courses-page">
      <header className="page-header-block">
        <h2 className="page-heading">Courses</h2>
        <p className="page-lead">
          Each offering has a <strong>start date</strong>,{" "}
          <strong>duration</strong> (weeks), credits, and optional instructor.
          Estimated end date is computed automatically.
        </p>
      </header>

      {message ? (
        <p
          className={
            isOkMessage(message)
              ? "form-feedback form-feedback--success"
              : "form-feedback form-feedback--error"
          }
          role="status"
        >
          {message}
        </p>
      ) : null}

      <div className="two-column-panels">
        <section className="panel-card panel-card--accent">
          <h3 className="panel-title">Start a course</h3>
          <p className="panel-hint">
            Codes must be unique. Duration is whole weeks from the start date.
          </p>
          <form className="stack-form" onSubmit={startCourse}>
            <label className="field-label">
              Course title
              <input
                type="text"
                name="course_name"
                placeholder="e.g. Discrete Mathematics"
                value={newCourse.course_name}
                onChange={handleNewChange}
                required
              />
            </label>
            <label className="field-label">
              Course code
              <input
                type="text"
                name="course_code"
                placeholder="e.g. MATH110"
                value={newCourse.course_code}
                onChange={handleNewChange}
                required
              />
            </label>
            <div className="form-row-2">
              <label className="field-label">
                Start date
                <input
                  type="date"
                  name="start_date"
                  value={newCourse.start_date}
                  onChange={handleNewChange}
                  required
                />
              </label>
              <label className="field-label">
                Duration (weeks)
                <input
                  type="number"
                  name="duration_weeks"
                  min={1}
                  max={104}
                  value={newCourse.duration_weeks}
                  onChange={handleNewChange}
                  required
                />
              </label>
            </div>
            <div className="form-row-2">
              <label className="field-label">
                Credits
                <input
                  type="number"
                  name="credits"
                  min={1}
                  max={12}
                  value={newCourse.credits}
                  onChange={handleNewChange}
                />
              </label>
              <label className="field-label">
                Status
                <select
                  name="status"
                  value={newCourse.status}
                  onChange={handleNewChange}
                >
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
            </div>
            <label className="field-label">
              Instructor <span className="optional">optional</span>
              <input
                type="text"
                name="instructor"
                placeholder="e.g. Dr. Lee"
                value={newCourse.instructor}
                onChange={handleNewChange}
              />
            </label>
            <label className="field-label">
              Description <span className="optional">optional</span>
              <textarea
                name="description"
                className="input-textarea"
                rows={3}
                placeholder="Short summary for the catalog…"
                value={newCourse.description}
                onChange={handleNewChange}
              />
            </label>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? "Creating…" : "Start course"}
            </button>
          </form>
        </section>

        <section className="panel-card panel-card--compact-aside">
          <h3 className="panel-title">Notes</h3>
          <ul className="hint-list">
            <li>
              <strong>End date</strong> in the table = start + duration (weeks).
            </li>
            <li>
              Enroll students from <strong>Students → Enroll</strong> after the
              catalog row exists.
            </li>
            <li>
              Grades and attendance attach to the same <code>course_id</code>.
            </li>
          </ul>
        </section>
      </div>

      <section className="panel-card panel-card--flush">
        <h3 className="panel-title">Catalog ({courses.length})</h3>
        {loading ? (
          <p className="muted">Loading catalog…</p>
        ) : courses.length === 0 ? (
          <p className="muted">
            Nothing yet — run <code>backend/database/schema.sql</code> or start a
            course above.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="data-table data-table--dense">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Start</th>
                  <th>Weeks</th>
                  <th>Est. end</th>
                  <th>Credits</th>
                  <th>Status</th>
                  <th>Instructor</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.course_id}>
                    <td>
                      <span className="course-code-pill">{c.course_code}</span>
                    </td>
                    <td>{c.course_name}</td>
                    <td>{fmtDate(c.start_date)}</td>
                    <td>{c.duration_weeks}</td>
                    <td>{fmtDate(c.end_date)}</td>
                    <td>{c.credits}</td>
                    <td>
                      <span className={`status-pill status-pill--${c.status}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>{c.instructor || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Courses;
