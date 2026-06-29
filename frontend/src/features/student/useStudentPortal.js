import { useEffect, useState } from "react";
import { ASSESSMENTS, INITIAL_COMMENTS, INITIAL_NOTIFICATIONS, STUDENT_STORAGE_KEY } from "./student.data.js";

function createInitialState() {
  return {
    completedLessonIds: [],
    assessmentResults: {},
    notifications: INITIAL_NOTIFICATIONS,
    comments: INITIAL_COMMENTS,
    feedback: []
  };
}

function readStudentState() {
  try {
    const stored = localStorage.getItem(STUDENT_STORAGE_KEY);
    return stored ? { ...createInitialState(), ...JSON.parse(stored) } : createInitialState();
  } catch {
    return createInitialState();
  }
}

export function useStudentPortal(user) {
  const [studentState, setStudentState] = useState(readStudentState);
  const authorName = user?.name || "Student";

  useEffect(() => {
    localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(studentState));
  }, [studentState]);

  function markLessonComplete(lessonId) {
    setStudentState((current) => ({
      ...current,
      completedLessonIds: current.completedLessonIds.includes(lessonId)
        ? current.completedLessonIds
        : [...current.completedLessonIds, lessonId]
    }));
  }

  function submitAssessment(assessmentId, answers) {
    const assessment = ASSESSMENTS.find((item) => item.id === assessmentId);
    if (!assessment) return null;
    const result = assessment.practical
      ? { status: "Submitted for review", submittedAt: new Date().toLocaleString() }
      : {
          status: "Completed",
          score: Math.round(
            (assessment.questions.filter((question) => answers[question.id] === question.answer).length /
              assessment.questions.length) *
              100
          ),
          submittedAt: new Date().toLocaleString()
        };
    setStudentState((current) => ({
      ...current,
      assessmentResults: { ...current.assessmentResults, [assessmentId]: result }
    }));
    return result;
  }

  function markNotificationRead(notificationId) {
    setStudentState((current) => ({
      ...current,
      notifications: current.notifications.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item
      )
    }));
  }

  function addComment(lessonSlug, text) {
    if (!text.trim()) return;
    setStudentState((current) => ({
      ...current,
      comments: [...current.comments, {
        id: `comment-${Date.now()}`,
        lessonSlug,
        author: authorName,
        role: "Student",
        text: text.trim(),
        createdAt: "Just now",
        replies: []
      }]
    }));
  }

  function addReply(commentId, text) {
    if (!text.trim()) return;
    setStudentState((current) => ({
      ...current,
      comments: current.comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: [...(comment.replies || []), {
                id: `reply-${Date.now()}`,
                author: authorName,
                role: "Student",
                text: text.trim(),
                createdAt: "Just now"
              }]
            }
          : comment
      )
    }));
  }

  function submitFeedback(courseId, rating, message) {
    if (!courseId || !message.trim()) return false;
    setStudentState((current) => ({
      ...current,
      feedback: [...current.feedback, {
        id: `feedback-${Date.now()}`,
        courseId,
        rating,
        message: message.trim(),
        submittedAt: new Date().toLocaleString()
      }]
    }));
    return true;
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
