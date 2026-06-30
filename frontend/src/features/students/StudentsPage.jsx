import { useMemo, useState } from "react";
import {
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Plus,
  Send,
  UserPlus,
  UsersRound
} from "lucide-react";
import PageTitle from "../../components/common/PageTitle.jsx";
import Metric from "../../components/common/Metric.jsx";
import Field from "../../components/common/Field.jsx";
import TextArea from "../../components/common/TextArea.jsx";
import SelectField from "../../components/common/SelectField.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { useStudentManagement } from "./useStudentManagement.js";

const EMPTY_STUDENT = { name: "", email: "", cohort: "" };

function getCourseTitle(courses, slug) {
  return courses.find((course) => course.slug === slug)?.title || slug;
}

export default function StudentsPage({ store, showToast }) {
  const studentStore = useStudentManagement();
  const { students, assignments } = studentStore.management;
  const [tab, setTab] = useState("students");
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentForm, setStudentForm] = useState(EMPTY_STUDENT);
  const [courseSlug, setCourseSlug] = useState(store.courses[0]?.slug || "");
  const [taskForm, setTaskForm] = useState({
    title: "",
    instructions: "",
    dueDate: "",
    courseSlug: store.courses[0]?.slug || ""
  });
  const [reviewDrafts, setReviewDrafts] = useState({});

  const selectedStudent = students.find((student) => student.id === selectedStudentId) || students[0];
  const selectedAssignments = assignments.filter((assignment) => assignment.studentId === selectedStudent?.id);
  const pendingReviews = assignments.filter((assignment) => assignment.status === "Submitted");
  const reviewed = assignments.filter((assignment) => assignment.status === "Reviewed");

  const courseOptions = useMemo(
    () => [["", "Select a course..."], ...store.courses.map((course) => [course.slug, course.title])],
    [store.courses]
  );

  async function handleAddStudent() {
    if (!studentForm.name.trim() || !studentForm.email.trim()) return;
    const student = await studentStore.addStudent(studentForm);
    if (student) {
      setSelectedStudentId(student.id);
      setStudentForm(EMPTY_STUDENT);
      setShowAddStudent(false);
      showToast("Student added");
    } else {
      showToast("Failed to add student. Check console.");
    }
  }

  async function handleAssignCourse() {
    const success = await studentStore.assignCourse(selectedStudent.id, courseSlug);
    if (success) {
      showToast("Course assigned");
    } else {
      showToast("Failed to assign course");
    }
  }

  async function handleCreateTask() {
    if (!taskForm.title.trim() || !taskForm.courseSlug || !taskForm.dueDate) return;
    const success = await studentStore.createAssignment({
      ...taskForm,
      studentId: selectedStudent.id
    });
    if (success) {
      setTaskForm({ title: "", instructions: "", dueDate: "", courseSlug: taskForm.courseSlug });
      showToast("Task assigned");
    } else {
      showToast("Failed to assign task");
    }
  }

  async function handleReview(assignmentId) {
    const draft = reviewDrafts[assignmentId] || {};
    if (draft.score === undefined || draft.score === "" || !draft.notes?.trim()) return;
    const success = await studentStore.reviewAssignment(assignmentId, draft.score, draft.notes);
    if (success) {
      showToast("Submission reviewed");
    } else {
      showToast("Failed to submit review");
    }
  }

  return (
    <section className="page students-page">
      <PageTitle
        icon={UsersRound}
        title="Students"
        subtitle="Manage learners, assign courses and tasks, and review submitted work."
        action={<button className="primary" onClick={() => setShowAddStudent((current) => !current)}><UserPlus size={18} /> Add Student</button>}
      />

      <div className="stat-grid four">
        <Metric icon={UsersRound} value={students.length} label="Total Students" />
        <Metric icon={BookOpenCheck} value={assignments.filter((item) => item.status === "Assigned").length} label="Open Tasks" tone="teal" />
        <Metric icon={Clock3} value={pendingReviews.length} label="Awaiting Review" tone="orange" />
        <Metric icon={CheckCircle2} value={reviewed.length} label="Reviewed" />
      </div>

      {showAddStudent && (
        <section className="form-section student-add-form">
          <div className="panel-title"><h3>Add Student</h3><span>Creates a learner record in this frontend workspace.</span></div>
          <div className="field-grid">
            <Field label="Full Name" value={studentForm.name} onChange={(value) => setStudentForm({ ...studentForm, name: value })} />
            <Field label="Email" type="email" value={studentForm.email} onChange={(value) => setStudentForm({ ...studentForm, email: value })} />
            <Field label="Cohort" value={studentForm.cohort} onChange={(value) => setStudentForm({ ...studentForm, cohort: value })} />
          </div>
          <div className="action-row"><button className="primary" disabled={!studentForm.name || !studentForm.email} onClick={handleAddStudent}><Plus size={17} /> Add Student</button></div>
        </section>
      )}

      <div className="student-admin-tabs">
        <button className={tab === "students" ? "active" : ""} onClick={() => setTab("students")}>Students</button>
        <button className={tab === "assignments" ? "active" : ""} onClick={() => setTab("assignments")}>All Tasks</button>
        <button className={tab === "reviews" ? "active" : ""} onClick={() => setTab("reviews")}>Reviews <span>{pendingReviews.length}</span></button>
      </div>

      {tab === "students" && (
        <div className="student-admin-layout">
          <div className="admin-student-grid">
            {students.map((student) => {
              const studentAssignments = assignments.filter((assignment) => assignment.studentId === student.id);
              return (
                <article className={student.id === selectedStudent?.id ? "admin-student-card active" : "admin-student-card"} key={student.id}>
                  <button className="admin-student-select" onClick={() => setSelectedStudentId(student.id)}>
                    <span>{student.name.charAt(0)}</span>
                    <div><strong>{student.name}</strong><small>{student.email}</small><small>{student.cohort}</small></div>
                  </button>
                  <div className="admin-student-meta">
                    <span>{student.courseSlugs.length} courses</span>
                    <span>{studentAssignments.length} tasks</span>
                  </div>
                  <div className="admin-student-actions">
                    <StatusBadge active={student.status === "Active"} label={student.status} />
                    <button className="secondary" onClick={() => studentStore.toggleStudentStatus(student.id)}>
                      {student.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {selectedStudent && (
            <aside className="student-management-panel">
              <header><span>{selectedStudent.name.charAt(0)}</span><div><h2>{selectedStudent.name}</h2><p>{selectedStudent.cohort}</p></div></header>
              <section>
                <h3>Assign Course</h3>
                <SelectField label="Course" value={courseSlug} onChange={setCourseSlug} options={courseOptions} />
                <button className="secondary" disabled={!courseSlug} onClick={handleAssignCourse}><BookOpenCheck size={17} /> Assign Course</button>
              </section>
              <section>
                <h3>Assign Task</h3>
                <SelectField label="Course" value={taskForm.courseSlug} onChange={(value) => setTaskForm({ ...taskForm, courseSlug: value })} options={courseOptions} />
                <Field label="Task Title" value={taskForm.title} onChange={(value) => setTaskForm({ ...taskForm, title: value })} />
                <TextArea label="Instructions" value={taskForm.instructions} onChange={(value) => setTaskForm({ ...taskForm, instructions: value })} rows={4} />
                <Field label="Due Date" type="date" value={taskForm.dueDate} onChange={(value) => setTaskForm({ ...taskForm, dueDate: value })} />
                <button className="primary" disabled={!taskForm.title || !taskForm.dueDate || !taskForm.courseSlug} onClick={handleCreateTask}><Send size={17} /> Assign Task</button>
              </section>
              <section>
                <h3>Current Learning</h3>
                <div className="assigned-course-list">
                  {selectedStudent.courseSlugs.map((slug) => <span key={slug}>{getCourseTitle(store.courses, slug)}</span>)}
                </div>
              </section>
              <section>
                <h3>Recent Tasks</h3>
                <div className="student-task-mini-list">
                  {selectedAssignments.slice(0, 3).map((assignment) => <article key={assignment.id}><strong>{assignment.title}</strong><StatusBadge active={assignment.status === "Reviewed"} label={assignment.status} /></article>)}
                </div>
              </section>
            </aside>
          )}
        </div>
      )}

      {tab === "assignments" && (
        <div className="admin-task-list">
          {assignments.map((assignment) => {
            const student = students.find((item) => item.id === assignment.studentId);
            return (
              <article key={assignment.id}>
                <div><strong>{assignment.title}</strong><p>{assignment.instructions}</p></div>
                <div><span>{student?.name}</span><small>{getCourseTitle(store.courses, assignment.courseSlug)}</small></div>
                <div><span>Due {assignment.dueDate}</span><StatusBadge active={assignment.status === "Reviewed"} label={assignment.status} /></div>
              </article>
            );
          })}
        </div>
      )}

      {tab === "reviews" && (
        <div className="review-grid">
          {pendingReviews.length === 0 && <div className="empty-state"><ClipboardCheck /><strong>No submissions awaiting review</strong></div>}
          {pendingReviews.map((assignment) => {
            const student = students.find((item) => item.id === assignment.studentId);
            const draft = reviewDrafts[assignment.id] || { score: "", notes: "" };
            return (
              <article className="review-card" key={assignment.id}>
                <header><div><span>Submitted by {student?.name}</span><h3>{assignment.title}</h3></div><StatusBadge active label="Submitted" /></header>
                <p>{assignment.submission}</p>
                <div className="field-grid">
                  <Field label="Score" type="number" value={draft.score} onChange={(value) => setReviewDrafts({ ...reviewDrafts, [assignment.id]: { ...draft, score: value } })} />
                  <TextArea label="Review Notes" value={draft.notes} onChange={(value) => setReviewDrafts({ ...reviewDrafts, [assignment.id]: { ...draft, notes: value } })} rows={3} />
                </div>
                <button className="primary" disabled={draft.score === "" || !draft.notes.trim()} onClick={() => handleReview(assignment.id)}><ClipboardCheck size={17} /> Complete Review</button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
