import React, { useEffect, useState } from "react";

const API = "http://localhost/student-MVC/backend/api";

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
    <div className="page-wide">
      <h2 className="page-heading">📅 Attendance</h2>
      <p className="page-lead">
        Records go to the <code>attendance</code> table (student + course +
        date + status).
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

      <section className="panel-card">
        <h3 className="panel-title">Mark attendance</h3>
        <form className="inline-form inline-form--wrap" onSubmit={save}>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            aria-label="Student"
          >
            <option value="">Student…</option>
            {students.map((s) => (
              <option key={s.student_id} value={s.student_id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
            aria-label="Course"
          >
            <option value="">Course…</option>
            {courses.map((c) => (
              <option key={c.course_id} value={c.course_id}>
                {c.course_name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={attDate}
            onChange={(e) => setAttDate(e.target.value)}
            aria-label="Date"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Status"
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
          <button type="submit" className="btn-submit">
            Save
          </button>
        </form>
      </section>

      <section className="panel-card panel-card--flush">
        <h3 className="panel-title">Recent records</h3>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="muted">No attendance rows yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.attendance_id}>
                    <td>{r.att_date}</td>
                    <td>{r.student_name}</td>
                    <td>{r.course_name}</td>
                    <td>{r.status}</td>
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

export default Attendance;
