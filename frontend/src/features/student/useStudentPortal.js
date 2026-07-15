import { useEffect, useState } from "react";
import { INITIAL_NOTIFICATIONS, INITIAL_COMMENTS } from "./student.data.js";

const API_ENABLED = import.meta.env.VITE_ENABLE_API === "true";

export function useStudentPortal(user) {
  const [studentState, setStudentState] = useState({
    completedLessonIds: [],
    assessmentResults: {},
    notifications: INITIAL_NOTIFICATIONS,
    comments: INITIAL_COMMENTS,
    feedback: [],
    nextLiveSession: null,
    recentActivity: [],
    learningStreak: null,
    recommendedCourses: [],
    weeklyLearning: null,
    assessmentAverage: 0
  });
  
  const studentId = user?.studentId || user?.id || "student-aarav"; // Fallback for mock user id if missing
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const BASE_URL = `${baseUrl}/api/portal/students/${studentId}`;
  
  let DEFAULT_HEADERS = {
    "Content-Type": "application/json",
    "X-Organization-ID": "123e4567-e89b-12d3-a456-426614174000",
    "X-User-Id": studentId,
    "X-User-Role": "STUDENT"
  };

  try {
    const sessionStr = localStorage.getItem("xebia-lms-auth-session-v1");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session.id) DEFAULT_HEADERS["X-User-Id"] = session.id;
      if (session.role) DEFAULT_HEADERS["X-User-Role"] = session.role.toUpperCase();
      if (session.organizationId) DEFAULT_HEADERS["X-Organization-ID"] = session.organizationId;
    }
  } catch (e) {}

  async function fetchState() {
    try {
      const res = await fetch(`${BASE_URL}/state`, { headers: DEFAULT_HEADERS });
      if (res.ok) {
        const data = await res.json();
        setStudentState({
          completedLessonIds: data.completedLessonIds || [],
          assessmentResults: data.assessmentResults || {},
          notifications: data.notifications || [],
          comments: data.comments || [],
          feedback: data.feedback || [],
          nextLiveSession: data.nextLiveSession || null,
          recentActivity: data.recentActivity || [],
          learningStreak: data.learningStreak || null,
          recommendedCourses: data.recommendedCourses || [],
          weeklyLearning: data.weeklyLearning || null,
          assessmentAverage: data.assessmentAverage || 0
        });
      }
    } catch (e) {
      console.error("Failed to fetch student state", e);
    }
  }

  useEffect(() => {
    if (API_ENABLED) fetchState();
  }, [studentId]);

  async function markLessonComplete(lessonId) {
    try {
      await fetch(`${BASE_URL}/lessons/${lessonId}/complete`, { 
        method: "POST",
        headers: DEFAULT_HEADERS 
      });
      fetchState();
    } catch (e) { console.error(e); }
  }

  async function submitAssessment(assessmentId, answers) {
    try {
      const res = await fetch(`${BASE_URL}/assessments/${assessmentId}/submit`, {
        method: "POST",
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ answers })
      });
      if (res.ok) {
        fetchState();
        return await res.json();
      }
    } catch (e) { console.error(e); }
    return null;
  }

  async function markNotificationRead(notificationId) {
    try {
      await fetch(`${BASE_URL}/notifications/${notificationId}/read`, { 
        method: "POST",
        headers: DEFAULT_HEADERS 
      });
      fetchState();
    } catch (e) { console.error(e); }
  }

  async function addComment(lessonSlug, text) {
    if (!text.trim()) return;
    try {
      await fetch(`${BASE_URL}/comments`, {
        method: "POST",
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ lessonSlug, text })
      });
      fetchState();
    } catch (e) { console.error(e); }
  }

  async function addReply(commentId, text) {
    if (!text.trim()) return;
    try {
      await fetch(`${BASE_URL}/comments/${commentId}/replies`, {
        method: "POST",
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ text })
      });
      fetchState();
    } catch (e) { console.error(e); }
  }

  async function submitFeedback(courseId, rating, message) {
    if (!courseId || !message.trim()) return false;
    try {
      const res = await fetch(`${BASE_URL}/feedback`, {
        method: "POST",
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ courseId, rating, message })
      });
      if (res.ok) {
        fetchState();
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  }

  return {
    studentState,
    markLessonComplete,
    submitAssessment,
    markNotificationRead,
    addComment,
    addReply,
    submitFeedback
  };
}
