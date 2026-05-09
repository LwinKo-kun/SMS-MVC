import React, { useEffect, useState, useCallback } from "react";

const API = "http://localhost/student-MVC/backend/api";

const Reports = () => {
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
      <div className="page-wide">
        <h2 className="page-heading">📊 Reports</h2>
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-wide">
        <h2 className="page-heading">📊 Reports</h2>
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
    <div className="page-wide reports-page">
      <h2 className="page-heading">📊 Reports</h2>
      <p className="page-lead">
        Summary counts, attendance, enrollments, grade averages by course, and a
        ledger of grade entries. Recording here upserts by student + course +
        assessment name.
      </p>

      <section className="reports-stats">
        <div className="stat-card stat-card--compact">
          <h3>Students</h3>
          <p className="stat-card-value">{stats.students ?? "—"}</p>
        </div>
        <div className="stat-card stat-card--compact">
          <h3>Courses</h3>
          <p className="stat-card-value">{stats.courses ?? "—"}</p>
        </div>
        <div className="stat-card stat-card--compact">
          <h3>Enrollments</h3>
          <p className="stat-card-value">{stats.enrollments ?? "—"}</p>
        </div>
        <div className="stat-card stat-card--compact">
          <h3>Grade rows</h3>
          <p className="stat-card-value">{stats.grade_entries ?? "—"}</p>
        </div>
      </section>

      <section className="panel-card">
        <h3 className="panel-title">Record or update a grade</h3>
        <p className="panel-hint">
          Same assessment name for the same student + course updates the row.
          Leave score empty if you only use letter grades.
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
                  setGradeForm((p) => ({ ...p, course_id: e.target.value }))
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
            Assessment name
            <input
              type="text"
              value={gradeForm.assessment_name}
              onChange={(e) =>
                setGradeForm((p) => ({
                  ...p,
                  assessment_name: e.target.value
                }))
              }
              placeholder="e.g. Final exam, Midterm, Project"
            />
          </label>
          <div className="form-row-2">
            <label className="field-label">
              Score % <span className="optional">0–100</span>
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
                placeholder="e.g. 87.5"
              />
            </label>
            <label className="field-label">
              Letter <span className="optional">optional</span>
              <input
                type="text"
                value={gradeForm.letter_grade}
                onChange={(e) =>
                  setGradeForm((p) => ({
                    ...p,
                    letter_grade: e.target.value
                  }))
                }
                placeholder="e.g. B+"
              />
            </label>
          </div>
          <label className="field-label">
            Notes <span className="optional">optional</span>
            <input
              type="text"
              value={gradeForm.notes}
              onChange={(e) =>
                setGradeForm((p) => ({ ...p, notes: e.target.value }))
              }
              placeholder="Optional comment"
            />
          </label>
          <button type="submit" className="btn-submit" disabled={gradeSaving}>
            {gradeSaving ? "Saving…" : "Save grade"}
          </button>
        </form>
      </section>

      <section className="panel-card panel-card--flush">
        <h3 className="panel-title">Grade overview by course</h3>
        {gradeOverview.length === 0 ? (
          <p className="muted">No graded scores yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course</th>
                  <th>Students graded</th>
                  <th>Avg score %</th>
                </tr>
              </thead>
              <tbody>
                {gradeOverview.map((row, i) => (
                  <tr key={`${row.course_code}-${i}`}>
                    <td>{row.course_code}</td>
                    <td>{row.course_name}</td>
                    <td>{row.students_graded}</td>
                    <td>
                      {row.avg_score_percent != null
                        ? Number(row.avg_score_percent).toFixed(1)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel-card panel-card--flush">
        <h3 className="panel-title">Grade ledger</h3>
        {grades.length === 0 ? (
          <p className="muted">No grade rows.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table data-table--dense">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Assessment</th>
                  <th>Score %</th>
                  <th>Letter</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => (
                  <tr key={g.grade_id}>
                    <td>
                      {g.recorded_at
                        ? new Date(g.recorded_at).toLocaleString()
                        : "—"}
                    </td>
                    <td>{g.student_name}</td>
                    <td>
                      {g.course_code} — {g.course_name}
                    </td>
                    <td>{g.assessment_name}</td>
                    <td>
                      {g.score_percent != null ? g.score_percent : "—"}
                    </td>
                    <td>{g.letter_grade || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel-card panel-card--flush">
        <h3 className="panel-title">Attendance by course</h3>
        {att.length === 0 ? (
          <p className="muted">No attendance data yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Code</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                </tr>
              </thead>
              <tbody>
                {att.map((row, i) => (
                  <tr key={`${row.course_code}-${i}`}>
                    <td>{row.course_name}</td>
                    <td>{row.course_code}</td>
                    <td>{row.present_count}</td>
                    <td>{row.absent_count}</td>
                    <td>{row.late_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel-card panel-card--flush">
        <h3 className="panel-title">Recent enrollments</h3>
        {enrollments.length === 0 ? (
          <p className="muted">No enrollments yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Code</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.enrollment_id}>
                    <td>{e.enroll_date}</td>
                    <td>{e.student_name}</td>
                    <td>{e.student_email}</td>
                    <td>{e.course_name}</td>
                    <td>{e.course_code}</td>
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

export default Reports;
