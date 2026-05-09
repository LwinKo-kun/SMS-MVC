import React, { useEffect, useState, useCallback, useMemo } from "react";

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

const FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "planned", label: "Planned" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" }
];

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState("all");
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

  const visible = useMemo(() => {
    if (filter === "all") return courses;
    return courses.filter((c) => c.status === filter);
  }, [courses, filter]);

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
      setMessage("Course started — check the catalog cards.");
      await loadCourses();
    } catch {
      setMessage("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wide courses-page mgmt-page">
      <header className="page-header-block">
        <h2 className="page-heading">Courses</h2>
        <p className="page-lead">
          Offerings show as <strong>cards</strong> with schedule chips. Filter
          by lifecycle status instead of scanning a wide table.
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
            Unique code · duration is whole weeks from start.
          </p>
          <form className="stack-form" onSubmit={startCourse}>
            <label className="field-label">
              Title
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
              Code
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
                Start
                <input
                  type="date"
                  name="start_date"
                  value={newCourse.start_date}
                  onChange={handleNewChange}
                  required
                />
              </label>
              <label className="field-label">
                Weeks
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
                placeholder="Catalog blurb…"
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
          <h3 className="panel-title">Workflow</h3>
          <ul className="hint-list">
            <li>
              Cards summarize schedule: start → estimated end after{" "}
              <em>N</em> weeks.
            </li>
            <li>
              Enrollments happen under <strong>Students</strong>.
            </li>
            <li>
              Grades & attendance reference the same course row.
            </li>
          </ul>
        </section>
      </div>

      <section className="panel-card panel-card--flush">
        <div className="mgmt-toolbar">
          <div className="chip-filter-row">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`chip-filter${filter === f.id ? " is-active" : ""}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="mgmt-badge">{visible.length} visible</span>
        </div>

        <h3 className="panel-title">Catalog</h3>

        {loading ? (
          <p className="muted">Loading…</p>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <p>No offerings yet — create one above or import schema SQL.</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <p>No courses match this filter.</p>
          </div>
        ) : (
          <div className="card-grid">
            {visible.map((c) => (
              <article key={c.course_id} className="entity-card">
                <div className="entity-card__top entity-card__top--split">
                  <div className="entity-card__main">
                    <span className="course-code-pill">{c.course_code}</span>
                    <h4 className="entity-card__title" style={{ marginTop: "0.5rem" }}>
                      {c.course_name}
                    </h4>
                    <div className="course-card__schedule">
                      <span>{fmtDate(c.start_date)}</span>
                      <span>→</span>
                      <span>{fmtDate(c.end_date)}</span>
                      <span>{c.duration_weeks} wk</span>
                    </div>
                  </div>
                  <span className={`status-pill status-pill--${c.status}`}>
                    {c.status}
                  </span>
                </div>
                <dl className="entity-kv">
                  <div>
                    <dt>Credits</dt>
                    <dd>{c.credits}</dd>
                  </div>
                  <div>
                    <dt>Instructor</dt>
                    <dd>{c.instructor || "—"}</dd>
                  </div>
                </dl>
                {c.description ? (
                  <p className="course-card__desc">{c.description}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Courses;
