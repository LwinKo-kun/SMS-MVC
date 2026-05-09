import React, { useEffect, useState, useCallback } from "react";

const API = "http://localhost/student-MVC/backend/api";

const isSuccessMessage = (msg) =>
    /saved|removed|enrolled|registered/i.test(msg || "");

const Students = () => {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        course: ""
    });
    const [enrollStudentId, setEnrollStudentId] = useState("");
    const [enrollCourseId, setEnrollCourseId] = useState("");
    const [enrollDate, setEnrollDate] = useState(() =>
        new Date().toISOString().slice(0, 10)
    );
    const [message, setMessage] = useState("");
    const [submittingStudent, setSubmittingStudent] = useState(false);
    const [submittingEnroll, setSubmittingEnroll] = useState(false);

    const loadAll = useCallback(async () => {
        const [sRes, cRes] = await Promise.all([
            fetch(`${API}/get_students.php`, { credentials: "include" }),
            fetch(`${API}/get_courses.php`, { credentials: "include" })
        ]);

        const sData = await sRes.json().catch(() => null);
        const cData = await cRes.json().catch(() => null);

        setStudents(sRes.ok && Array.isArray(sData) ? sData : []);
        setCourses(cRes.ok && Array.isArray(cData) ? cData : []);
    }, []);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmitStudent = async (e) => {
        e.preventDefault();
        setMessage("");
        setSubmittingStudent(true);

        try {
            const res = await fetch(`${API}/create_students.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
                credentials: "include"
            });

            const body = await res.json().catch(() => ({}));

            if (!res.ok) {
                setMessage(
                    body.message ||
                        (res.status === 403
                            ? "Session expired — log in again."
                            : `Request failed (${res.status}).`)
                );
                return;
            }

            if (body.status !== "success") {
                setMessage(body.message || "Could not add student.");
                return;
            }

            setForm({
                name: "",
                email: "",
                phone: "",
                course: ""
            });
            if (body.student_id) {
                setEnrollStudentId(String(body.student_id));
            }
            setMessage(
                "Student registered. Choose a course below to enroll them."
            );
            await loadAll();
        } catch {
            setMessage("Network error — is Apache/MySQL running?");
        } finally {
            setSubmittingStudent(false);
        }
    };

    const handleEnroll = async (e) => {
        e.preventDefault();
        setMessage("");
        const sid = parseInt(enrollStudentId, 10);
        const cid = parseInt(enrollCourseId, 10);
        if (!sid || !cid) {
            setMessage("Choose both a student and a course to enroll.");
            return;
        }

        setSubmittingEnroll(true);
        try {
            const res = await fetch(`${API}/enroll_student.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    student_id: sid,
                    course_id: cid,
                    enroll_date: enrollDate
                })
            });

            const body = await res.json().catch(() => ({}));

            if (!res.ok || body.status !== "success") {
                setMessage(body.message || "Enrollment failed.");
                return;
            }

            setMessage("Enrolled — recorded in the enrollments table.");
            setEnrollCourseId("");
        } catch {
            setMessage("Network error during enrollment.");
        } finally {
            setSubmittingEnroll(false);
        }
    };

    const deleteStudent = async (id) => {
        setMessage("");
        const res = await fetch(`${API}/delete_student.php`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_id: id }),
            credentials: "include"
        });

        const body = await res.json().catch(() => ({}));

        if (!res.ok || body.status !== "success") {
            setMessage(body.message || "Could not delete student.");
            return;
        }

        if (String(enrollStudentId) === String(id)) {
            setEnrollStudentId("");
        }

        setMessage("Student removed.");
        loadAll();
    };

    const startEnrollFor = (studentId) => {
        setMessage("");
        setEnrollStudentId(String(studentId));
        document
            .getElementById("enroll-panel")
            ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    return (
        <div className="students-page students-page--layout">
            <header className="page-header-block">
                <h2 className="page-heading">Students</h2>
                <p className="page-lead">
                    Register people here, then enroll them into catalog courses.
                    The text field “Course” is an informal label on the student
                    row; official schedules use{" "}
                    <strong>Enroll in a course</strong>.
                </p>
            </header>

            {message ? (
                <p
                    className={
                        isSuccessMessage(message)
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
                    <h3 className="panel-title">1 · Register student</h3>
                    <p className="panel-hint">
                        Creates a row in <code>students</code>.
                    </p>
                    <form
                        className="stack-form"
                        onSubmit={handleSubmitStudent}
                    >
                        <label className="field-label">
                            Full name
                            <input
                                type="text"
                                name="name"
                                placeholder="e.g. Jamie Rivera"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </label>
                        <label className="field-label">
                            Email
                            <input
                                type="email"
                                name="email"
                                placeholder="jamie@school.edu"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </label>
                        <label className="field-label">
                            Phone <span className="optional">optional</span>
                            <input
                                type="text"
                                name="phone"
                                placeholder="+1 …"
                                value={form.phone}
                                onChange={handleChange}
                            />
                        </label>
                        <label className="field-label">
                            Informal course note{" "}
                            <span className="optional">optional</span>
                            <input
                                type="text"
                                name="course"
                                placeholder="e.g. Morning cohort"
                                value={form.course}
                                onChange={handleChange}
                            />
                        </label>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={submittingStudent}
                        >
                            {submittingStudent ? "Saving…" : "Add student"}
                        </button>
                    </form>
                </section>

                <section className="panel-card" id="enroll-panel">
                    <h3 className="panel-title">2 · Enroll in a course</h3>
                    <p className="panel-hint">
                        Writes to <code>enrollments</code> (student + catalog
                        course + date).
                    </p>
                    <form className="stack-form" onSubmit={handleEnroll}>
                        <label className="field-label">
                            Student
                            <select
                                value={enrollStudentId}
                                onChange={(e) =>
                                    setEnrollStudentId(e.target.value)
                                }
                                required
                            >
                                <option value="">Select student…</option>
                                {students.map((s) => (
                                    <option
                                        key={s.student_id}
                                        value={s.student_id}
                                    >
                                        {s.name} · {s.email}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="field-label">
                            Course offering
                            <select
                                value={enrollCourseId}
                                onChange={(e) =>
                                    setEnrollCourseId(e.target.value)
                                }
                                required
                            >
                                <option value="">Select course…</option>
                                {courses.map((c) => (
                                    <option
                                        key={c.course_id}
                                        value={c.course_id}
                                    >
                                        {c.course_code} — {c.course_name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="field-label">
                            Start / enroll date
                            <input
                                type="date"
                                value={enrollDate}
                                onChange={(e) => setEnrollDate(e.target.value)}
                                required
                            />
                        </label>
                        <button
                            type="submit"
                            className="btn-submit btn-submit--secondary"
                            disabled={submittingEnroll || courses.length === 0}
                        >
                            {submittingEnroll ? "Enrolling…" : "Enroll student"}
                        </button>
                        {courses.length === 0 ? (
                            <p className="panel-hint panel-hint--warn">
                                No catalog courses yet — open{" "}
                                <strong>Courses</strong> and start one first.
                            </p>
                        ) : null}
                    </form>
                </section>
            </div>

            <section className="panel-card panel-card--flush">
                <h3 className="panel-title">Directory</h3>
                <p className="panel-hint">
                    Use <strong>Enroll</strong> to jump to enrollment with that
                    student selected.
                </p>
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Note</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="data-table-empty">
                                        No students yet — register someone above.
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student.student_id}>
                                        <td>{student.student_id}</td>
                                        <td>{student.name}</td>
                                        <td>{student.email}</td>
                                        <td>{student.phone || "—"}</td>
                                        <td>{student.course || "—"}</td>
                                        <td className="cell-actions">
                                            <button
                                                type="button"
                                                className="btn-enroll"
                                                onClick={() =>
                                                    startEnrollFor(
                                                        student.student_id
                                                    )
                                                }
                                            >
                                                Enroll
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-delete"
                                                onClick={() =>
                                                    deleteStudent(
                                                        student.student_id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Students;
