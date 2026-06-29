import { useEffect, useState } from "react";
import { INITIAL_STUDENT_MANAGEMENT, STUDENT_MANAGEMENT_KEY } from "./studentManagement.data.js";

export function readStudentManagement() {
  try {
    const stored = localStorage.getItem(STUDENT_MANAGEMENT_KEY);
    return stored ? { ...INITIAL_STUDENT_MANAGEMENT, ...JSON.parse(stored) } : INITIAL_STUDENT_MANAGEMENT;
  } catch {
    return INITIAL_STUDENT_MANAGEMENT;
  }
}

export function useStudentManagement() {
  const [management, setManagement] = useState(readStudentManagement);

  useEffect(() => {
    localStorage.setItem(STUDENT_MANAGEMENT_KEY, JSON.stringify(management));
  }, [management]);

  function addStudent(student) {
    const record = {
      id: `student-${Date.now()}`,
      name: student.name.trim(),
      email: student.email.trim(),
      cohort: student.cohort.trim() || "General Learning",
      status: "Active",
      courseSlugs: []
    };
    setManagement((current) => ({ ...current, students: [...current.students, record] }));
    return record;
  }

  function toggleStudentStatus(studentId) {
    setManagement((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === studentId
          ? { ...student, status: student.status === "Active" ? "Inactive" : "Active" }
          : student
      )
    }));
  }

  function assignCourse(studentId, courseSlug) {
    if (!courseSlug) return false;
    setManagement((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === studentId && !student.courseSlugs.includes(courseSlug)
          ? { ...student, courseSlugs: [...student.courseSlugs, courseSlug] }
          : student
      )
    }));
    return true;
  }

  function createAssignment(assignment) {
    const record = {
      id: `task-${Date.now()}`,
      studentId: assignment.studentId,
      courseSlug: assignment.courseSlug,
      title: assignment.title.trim(),
      instructions: assignment.instructions.trim(),
      dueDate: assignment.dueDate,
      status: "Assigned",
      submission: "",
      submittedAt: "",
      score: "",
      reviewNotes: ""
    };
    setManagement((current) => ({
      ...current,
      assignments: [record, ...current.assignments],
      students: current.students.map((student) =>
        student.id === record.studentId && !student.courseSlugs.includes(record.courseSlug)
          ? { ...student, courseSlugs: [...student.courseSlugs, record.courseSlug] }
          : student
      )
    }));
    return record;
  }

  function submitAssignment(assignmentId, submission) {
    if (!submission.trim()) return false;
    setManagement((current) => ({
      ...current,
      assignments: current.assignments.map((assignment) =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              submission: submission.trim(),
              submittedAt: new Date().toLocaleString(),
              status: "Submitted"
            }
          : assignment
      )
    }));
    return true;
  }

  function reviewAssignment(assignmentId, score, reviewNotes) {
    setManagement((current) => ({
      ...current,
      assignments: current.assignments.map((assignment) =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              score: Number(score),
              reviewNotes: reviewNotes.trim(),
              status: "Reviewed"
            }
          : assignment
      )
    }));
    return true;
  }

  return {
    management,
    addStudent,
    toggleStudentStatus,
    assignCourse,
    createAssignment,
    submitAssignment,
    reviewAssignment
  };
}
