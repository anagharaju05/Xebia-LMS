import { useEffect, useState } from "react";
import { INITIAL_STUDENT_MANAGEMENT } from "./studentManagement.data.js";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
const BASE_URL = `${baseUrl}/api/management/students`;
function getHeaders() {
  const headers = {
    "Content-Type": "application/json",
    "X-Organization-ID": "123e4567-e89b-12d3-a456-426614174000",
    "X-User-Id": "admin-1",
    "X-User-Role": "ADMIN"
  };
  try {
    const sessionStr = localStorage.getItem("xebia-lms-auth-session-v1");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session.id) headers["X-User-Id"] = session.id;
      if (session.role) headers["X-User-Role"] = session.role.toUpperCase();
      if (session.organizationId) headers["X-Organization-ID"] = session.organizationId;
    }
  } catch (e) {}
  return headers;
}

export function useStudentManagement() {
  const [management, setManagement] = useState(INITIAL_STUDENT_MANAGEMENT);
  const [loading, setLoading] = useState(true);

  async function fetchAll() {
    try {
      const [studentsRes, assignmentsRes] = await Promise.all([
        fetch(BASE_URL, { headers: getHeaders() }).then(res => res.json()),
        fetch(`${BASE_URL}/assignments`, { headers: getHeaders() }).then(res => res.json())
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
        headers: getHeaders(),
        body: JSON.stringify(studentData)
      });
      if (res.ok) {
        const data = await res.json();
        await fetchAll();
        return data;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }

  async function toggleStudentStatus(studentId) {
    try {
      const res = await fetch(`${BASE_URL}/${studentId}/toggle-status`, { 
        method: "PUT",
        headers: getHeaders()
      });
      if (res.ok) {
        await fetchAll();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function assignCourse(studentId, courseSlug) {
    try {
      const res = await fetch(`${BASE_URL}/${studentId}/courses/${courseSlug}`, { 
        method: "POST",
        headers: getHeaders() 
      });
      if (res.ok) {
        await fetchAll();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  async function createAssignment(assignmentData) {
    try {
      const res = await fetch(`${BASE_URL}/assignments`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(assignmentData)
      });
      if (res.ok) {
        await fetchAll();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  async function reviewAssignment(assignmentId, score, notes) {
    try {
      const res = await fetch(`${BASE_URL}/assignments/${assignmentId}/review`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ score, notes })
      });
      if (res.ok) {
        await fetchAll();
        return true;
      }
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
