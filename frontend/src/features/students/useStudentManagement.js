import { useEffect, useState } from "react";
import { INITIAL_STUDENT_MANAGEMENT } from "./studentManagement.data.js";

const BASE_URL = "http://localhost:8080/api/management/students";
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  "X-Organization-ID": "123e4567-e89b-12d3-a456-426614174000",
  "X-User-Id": "admin-1",
  "X-User-Role": "ADMIN"
};

export function useStudentManagement() {
  const [management, setManagement] = useState({ students: [], assignments: [] });
  const [loading, setLoading] = useState(true);

  async function fetchAll() {
    try {
      const [studentsRes, assignmentsRes] = await Promise.all([
        fetch(BASE_URL, { headers: DEFAULT_HEADERS }).then(res => res.json()),
        fetch(`${BASE_URL}/assignments`, { headers: DEFAULT_HEADERS }).then(res => res.json())
      ]);
      setManagement({
        students: Array.isArray(studentsRes) ? studentsRes : [],
        assignments: Array.isArray(assignmentsRes) ? assignmentsRes : []
      });
    } catch (e) {
      console.error("Failed to fetch students/assignments", e);
      setManagement(INITIAL_STUDENT_MANAGEMENT);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function addStudent(studentData) {
    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(studentData)
      });
      if (res.ok) {
        fetchAll();
        return await res.json();
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }

  async function toggleStudentStatus(studentId) {
    try {
      await fetch(`${BASE_URL}/${studentId}/toggle-status`, { 
        method: "PUT",
        headers: DEFAULT_HEADERS
      });
      fetchAll();
    } catch (e) {
      console.error(e);
    }
  }

  async function assignCourse(studentId, courseSlug) {
    try {
      await fetch(`${BASE_URL}/${studentId}/courses/${courseSlug}`, { 
        method: "POST",
        headers: DEFAULT_HEADERS 
      });
      fetchAll();
      return true;
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  async function createAssignment(assignmentData) {
    try {
      await fetch(`${BASE_URL}/assignments`, {
        method: "POST",
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(assignmentData)
      });
      fetchAll();
      return true;
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  async function reviewAssignment(assignmentId, score, notes) {
    try {
      await fetch(`${BASE_URL}/assignments/${assignmentId}/review`, {
        method: "PUT",
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ score, notes })
      });
      fetchAll();
      return true;
    } catch (e) {
      console.error(e);
    }
    return false;
  }
  
  async function submitAssignment(assignmentId, submission) {
    return true;
  }

  return {
    management,
    loading,
    addStudent,
    toggleStudentStatus,
    assignCourse,
    createAssignment,
    reviewAssignment,
    submitAssignment
  };
}
