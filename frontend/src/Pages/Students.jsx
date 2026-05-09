import React, { useEffect, useState, useCallback, useMemo } from "react";

const API = "http://localhost/student-MVC/backend/api";

const isSuccessMessage = (msg) =>
    /saved|removed|enrolled|registered/i.test(msg || "");

function initials(name) {
    if (!name || typeof name !== "string") return "?";
    const p = name.trim().split(/\s+/).filter(Boolean);
    if (p.length === 0) return "?";
    if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
    return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

const Students = () => {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [query, setQuery] = useState("");
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

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return students;
        return students.filter(
            (s) =>
                String(s.name).toLowerCase().includes(q) ||
                String(s.email).toLowerCase().includes(q) ||
                String(s.phone || "").toLowerCase().includes(q) ||
                String(s.student_id).includes(q)
        );
    }, [students, query]);

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
        <div className="students-page students-page--layout mgmt-page">
            <header className="page-header-block">
                <h2 className="page-heading">Students</h2>
                <p className="page-lead">
                    Register learners, then use enrollment to tie them to
                    catalog offerings. Search and cards below replace the old
                    single spreadsheet-style table.
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
                    <h3 className="panel-title">Register</h3>
                    <p className="panel-hint">
                        Adds to <code>students</code>. Informal “course” is
                        just a label.
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
                            Cohort note{" "}
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
                    <h3 className="panel-title">Enroll</h3>
                    <p className="panel-hint">
                        Writes to <code>enrollments</code>.
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
                            Course
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
                            Enroll date
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
                            {submittingEnroll ? "Enrolling…" : "Enroll"}
                        </button>
                        {courses.length === 0 ? (
                            <p className="panel-hint panel-hint--warn">
                                Create a course first under{" "}
                                <strong>Courses</strong>.
                            </p>
                        ) : null}
                    </form>
                </section>
            </div>

            <section className="panel-card panel-card--flush">
                <div className="mgmt-toolbar">
                    <div className="mgmt-toolbar__grow">
                        <input
                            type="search"
                            className="mgmt-search"
                            placeholder="Search name, email, phone, or ID…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label="Filter students"
                        />
                    </div>
                    <span className="mgmt-badge">
                        Showing {filtered.length} of {students.length}
                    </span>
                </div>

                <h3 className="panel-title">Directory</h3>
                <p className="panel-hint">
                    Cards are interactive (hover).{" "}
                    <strong>Enroll</strong> jumps to the form with this student.
                </p>

                {students.length === 0 ? (
                    <div className="empty-state">
                        <p>No students yet — add someone with Register.</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <p>No matches for that search.</p>
                    </div>
                ) : (
                    <div className="card-grid">
                        {filtered.map((student) => (
                            <article
                                key={student.student_id}
                                className="entity-card"
                            >
                                <div className="entity-card__top">
                                    <div
                                        className="entity-avatar"
                                        aria-hidden
                                    >
                                        {initials(student.name)}
                                    </div>
                                    <div>
                                        <h4 className="entity-card__title">
                                            {student.name}
                                        </h4>
                                        <p className="entity-card__meta">
                                            ID #{student.student_id}
                                        </p>
                                    </div>
                                </div>
                                <dl className="entity-kv">
                                    <div>
                                        <dt>Email</dt>
                                        <dd>{student.email}</dd>
                                    </div>
                                    <div>
                                        <dt>Phone</dt>
                                        <dd>{student.phone || "—"}</dd>
                                    </div>
                                    <div>
                                        <dt>Note</dt>
                                        <dd>{student.course || "—"}</dd>
                                    </div>
                                </dl>
                                <div className="entity-card__actions">
                                    <button
                                        type="button"
                                        className="btn-ghost"
                                        onClick={() =>
                                            startEnrollFor(student.student_id)
                                        }
                                    >
                                        Enroll
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-delete"
                                        onClick={() =>
                                            deleteStudent(student.student_id)
                                        }
                                    >
                                        Remove
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Students;
