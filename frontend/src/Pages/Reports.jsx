import React, { useEffect, useState, useCallback } from "react";

const API = "http://localhost/student-MVC/backend/api";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "grades", label: "Grades" },
  { id: "attendance", label: "Attendance" },
  { id: "enrollments", label: "Enrollments" }
];

function AttendanceBarRow({ row }) {
  const p = Number(row.present_count) || 0;
  const a = Number(row.absent_count) || 0;
  const l = Number(row.late_count) || 0;
  const t = p + a + l || 1;

  return (
    <div className="att-bar-card">
      <div className="att-bar-card__head">
        <strong>{row.course_name}</strong>
        <span className="course-code-pill">{row.course_code}</span>
      </div>
      <div className="att-bar-track" title={`Present ${p}, absent ${a}, late ${l}`}>
        <div
          className="att-bar-seg att-bar-seg--p"
          style={{ width: `${(p / t) * 100}%` }}
        />
        <div
          className="att-bar-seg att-bar-seg--a"
          style={{ width: `${(a / t) * 100}%` }}
        />
        <div
          className="att-bar-seg att-bar-seg--l"
          style={{ width: `${(l / t) * 100}%` }}
        />
      </div>
      <div className="att-bar-legend">
        <span>Present {p}</span>
        <span>Absent {a}</span>
        <span>Late {l}</span>
      </div>
    </div>
  );
}

const Reports = () => {
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [gradeMsg, setGradeMsg] = useState("");
  const [gradeSaving, setGradeSaving] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    student_id: "",
    course_id: "",
    assessment_name: "Course grade",
    score_percent: "",
    letter_grade: "",
    notes: ""
  });

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [repRes, stRes, coRes] = await Promise.all([
        fetch(`${API}/get_reports.php`, { credentials: "include" }),
        fetch(`${API}/get_students.php`, { credentials: "include" }),
        fetch(`${API}/get_courses.php`, { credentials: "include" })
      ]);

      const json = await repRes.json().catch(() => null);
      const stJson = await stRes.json().catch(() => []);
      const coJson = await coRes.json().catch(() => []);

      if (!repRes.ok) {
        setError("Could not load reports (sign in required?).");
        setData(null);
        return;
      }

      setData(json);
      setStudents(stRes.ok && Array.isArray(stJson) ? stJson : []);
      setCourses(coRes.ok && Array.isArray(coJson) ? coJson : []);
    } catch {
      setError("Network error.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const saveGrade = async (e) => {
    e.preventDefault();
    setGradeMsg("");
    const sid = parseInt(gradeForm.student_id, 10);
    const cid = parseInt(gradeForm.course_id, 10);
    if (!sid || !cid) {
      setGradeMsg("Choose student and course.");
      return;
    }

    const scoreRaw = gradeForm.score_percent.trim();
    let scorePayload = null;
    if (scoreRaw !== "") {
      const n = parseFloat(scoreRaw);
      if (Number.isNaN(n)) {
        setGradeMsg("Score must be a number (0–100).");
        return;
      }
      scorePayload = n;
    }

    setGradeSaving(true);
    try {
      const res = await fetch(`${API}/save_grade.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          student_id: sid,
          course_id: cid,
          assessment_name: gradeForm.assessment_name.trim() || "Course grade",
          score_percent: scorePayload,
          letter_grade: gradeForm.letter_grade.trim(),
          notes: gradeForm.notes.trim()
        })
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok || body.status !== "success") {
        setGradeMsg(body.message || "Could not save grade.");
        return;
      }

      setGradeMsg("Grade saved.");
      setGradeForm((prev) => ({
        ...prev,
        score_percent: "",
        letter_grade: "",
        notes: ""
      }));
      await loadReports();
    } catch {
      setGradeMsg("Network error.");
    } finally {
      setGradeSaving(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="page-wide mgmt-page">
        <h2 className="page-heading">Reports</h2>
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-wide mgmt-page">
        <h2 className="page-heading">Reports</h2>
        <p className="form-feedback form-feedback--error">{error}</p>
      </div>
    );
  }

  const stats = data.stats || {};
  const enrollments = Array.isArray(data.enrollments) ? data.enrollments : [];
  const att = Array.isArray(data.attendance_by_course)
    ? data.attendance_by_course
    : [];
  const grades = Array.isArray(data.grades) ? data.grades : [];
  const gradeOverview = Array.isArray(data.grade_overview)
    ? data.grade_overview
    : [];

  return (
    <div className="page-wide reports-page mgmt-page">
      <h2 className="page-heading">Reports</h2>
      <p className="page-lead">
        Use tabs to focus each area — charts and cards replace raw tables so
        totals and trends read faster.
      </p>

      <div className="mgmt-tabs" role="tablist" aria-label="Report sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`mgmt-tab${tab === t.id ? " is-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <>
          <div className="metric-grid-mini">
            <div className="metric-tile">
              <p className="metric-tile__label">Students</p>
              <p className="metric-tile__value">{stats.students ?? "—"}</p>
            </div>
            <div className="metric-tile">
              <p className="metric-tile__label">Courses</p>
              <p className="metric-tile__value">{stats.courses ?? "—"}</p>
            </div>
            <div className="metric-tile">
              <p className="metric-tile__label">Enrollments</p>
              <p className="metric-tile__value">{stats.enrollments ?? "—"}</p>
            </div>
            <div className="metric-tile">
              <p className="metric-tile__label">Grade rows</p>
              <p className="metric-tile__value">{stats.grade_entries ?? "—"}</p>
            </div>
          </div>
          <p className="panel-hint" style={{ marginTop: "1rem" }}>
            Switch to <strong>Grades</strong> to enter scores,{" "}
            <strong>Attendance</strong> for participation bars, or{" "}
            <strong>Enrollments</strong> for who joined which offering.
          </p>
        </>
      ) : null}

      {tab === "grades" ? (
        <>
          <section className="panel-card">
            <h3 className="panel-title">Record grade</h3>
            <p className="panel-hint">
              Same student + course + assessment updates the existing row.
            </p>
            {gradeMsg ? (
              <p
                className={
                  /saved/i.test(gradeMsg)
                    ? "form-feedback form-feedback--success"
                    : "form-feedback form-feedback--error"
                }
              >
                {gradeMsg}
              </p>
            ) : null}
            <form className="stack-form" onSubmit={saveGrade}>
              <div className="form-row-2">
                <label className="field-label">
                  Student
                  <select
                    value={gradeForm.student_id}
                    onChange={(e) =>
                      setGradeForm((p) => ({
                        ...p,
                        student_id: e.target.value
                      }))
                    }
                    required
                  >
                    <option value="">Select…</option>
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
                    value={gradeForm.course_id}
                    onChange={(e) =>
                      setGradeForm((p) => ({
                        ...p,
                        course_id: e.target.value
                      }))
                    }
                    required
                  >
                    <option value="">Select…</option>
                    {courses.map((c) => (
                      <option key={c.course_id} value={c.course_id}>
                        {c.course_code} — {c.course_name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="field-label">
                Assessment
                <input
                  type="text"
                  value={gradeForm.assessment_name}
                  onChange={(e) =>
                    setGradeForm((p) => ({
                      ...p,
                      assessment_name: e.target.value
                    }))
                  }
                  placeholder="Midterm, Final…"
                />
              </label>
              <div className="form-row-2">
                <label className="field-label">
                  Score %
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    value={gradeForm.score_percent}
                    onChange={(e) =>
                      setGradeForm((p) => ({
                        ...p,
                        score_percent: e.target.value
                      }))
                    }
                  />
                </label>
                <label className="field-label">
                  Letter
                  <input
                    type="text"
                    value={gradeForm.letter_grade}
                    onChange={(e) =>
                      setGradeForm((p) => ({
                        ...p,
                        letter_grade: e.target.value
                      }))
                    }
                  />
                </label>
              </div>
              <label className="field-label">
                Notes
                <input
                  type="text"
                  value={gradeForm.notes}
                  onChange={(e) =>
                    setGradeForm((p) => ({ ...p, notes: e.target.value }))
                  }
                />
              </label>
              <button type="submit" className="btn-submit" disabled={gradeSaving}>
                {gradeSaving ? "Saving…" : "Save grade"}
              </button>
            </form>
          </section>

          <h3 className="panel-title">Average by course</h3>
          {gradeOverview.length === 0 ? (
            <div className="empty-state">
              <p>No numeric averages yet — add scores above.</p>
            </div>
          ) : (
            <div className="card-grid">
              {gradeOverview.map((row, i) => (
                <div key={`${row.course_code}-${i}`} className="grade-ring-card">
                  <p className="metric-tile__label">{row.course_code}</p>
                  <p className="grade-ring-card__avg">
                    {row.avg_score_percent != null
                      ? Number(row.avg_score_percent).toFixed(1)
                      : "—"}
                  </p>
                  <p className="grade-ring-card__sub">{row.course_name}</p>
                  <p className="grade-ring-card__sub">
                    {row.students_graded} graded
                  </p>
                </div>
              ))}
            </div>
          )}

          <h3 className="panel-title" style={{ marginTop: "1.5rem" }}>
            Ledger
          </h3>
          {grades.length === 0 ? (
            <p className="muted">No entries.</p>
          ) : (
            <div className="feed-list">
              {grades.map((g) => (
                <div key={g.grade_id} className="feed-item">
                  <div className="feed-item__rail" aria-hidden />
                  <div className="feed-item__body">
                    <p className="feed-item__title">{g.student_name}</p>
                    <p className="feed-item__sub">
                      {g.course_code} · {g.assessment_name}
                    </p>
                    <p className="feed-item__sub">
                      {g.score_percent != null ? `${g.score_percent}%` : "—"}
                      {g.letter_grade ? ` · ${g.letter_grade}` : ""}
                      {g.recorded_at
                        ? ` · ${new Date(g.recorded_at).toLocaleString()}`
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}

      {tab === "attendance" ? (
        <>
          {att.length === 0 ? (
            <div className="empty-state">
              <p>No attendance logged yet — use the Attendance page.</p>
            </div>
          ) : (
            att.map((row, i) => (
              <AttendanceBarRow key={`${row.course_code}-${i}`} row={row} />
            ))
          )}
        </>
      ) : null}

      {tab === "enrollments" ? (
        <>
          {enrollments.length === 0 ? (
            <div className="empty-state">
              <p>No enrollments — pair students with courses first.</p>
            </div>
          ) : (
            <div className="feed-list">
              {enrollments.map((e) => (
                <div key={e.enrollment_id} className="enroll-card">
                  <div className="enroll-card__date">{e.enroll_date}</div>
                  <div>
                    <p className="feed-item__title">{e.student_name}</p>
                    <p className="feed-item__sub">{e.student_email}</p>
                    <p className="feed-item__sub">
                      <strong>{e.course_code}</strong> — {e.course_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default Reports;
