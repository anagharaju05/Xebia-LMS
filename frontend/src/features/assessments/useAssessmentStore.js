import { useEffect, useMemo, useState } from "react";
import { ASSESSMENT_STORAGE_KEY, INITIAL_ASSESSMENT_STATE } from "./assessment.data.js";

function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(ASSESSMENT_STORAGE_KEY));
    if (!saved?.assessments) return INITIAL_ASSESSMENT_STATE;
    return {
      ...saved,
      assessments: saved.assessments.map((assessment) => assessment.type === "google_form"
        ? { ...assessment, type: "quiz", quizFileName: assessment.googleFormTitle ? `${assessment.googleFormTitle}.xlsx` : "imported-quiz.xlsx", quizQuestions: INITIAL_ASSESSMENT_STATE.assessments.find((item) => item.id === assessment.id)?.quizQuestions || [] }
        : assessment),
      submissions: saved.submissions.map((submission) => submission.type === "google_form" ? { ...submission, type: "quiz" } : submission)
    };
  } catch {
    return INITIAL_ASSESSMENT_STATE;
  }
}

function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useAssessmentStore() {
  const [state, setState] = useState(readState);

  useEffect(() => {
    localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const api = useMemo(() => ({
    saveAssessment(record) {
      const now = new Date().toISOString();
      const saved = {
        ...record,
        id: record.id || newId("assessment"),
        createdAt: record.createdAt || now,
        updatedAt: now
      };
      setState((current) => ({
        ...current,
        assessments: current.assessments.some((item) => item.id === saved.id)
          ? current.assessments.map((item) => item.id === saved.id ? saved : item)
          : [saved, ...current.assessments]
      }));
      return saved;
    },
    deleteAssessment(id) {
      setState((current) => ({
        assessments: current.assessments.filter((item) => item.id !== id),
        submissions: current.submissions.filter((item) => item.assessmentId !== id),
        questions: current.questions.filter((item) => item.assessmentId !== id)
      }));
    },
    setAssessmentStatus(id, status) {
      setState((current) => ({
        ...current,
        assessments: current.assessments.map((item) => item.id === id
          ? { ...item, status, updatedAt: new Date().toISOString() }
          : item)
      }));
    },
    submitWork(payload) {
      const autoGraded = payload.type === "quiz";
      const submission = {
        ...payload,
        id: newId("submission"),
        submittedAt: new Date().toISOString(),
        status: autoGraded ? "Graded" : "Submitted",
        score: autoGraded ? Number(payload.score) : null,
        feedback: autoGraded ? "Automatically graded from the imported quiz answer key." : "",
        ...(autoGraded ? { gradedAt: new Date().toISOString() } : {})
      };
      setState((current) => ({
        ...current,
        submissions: [
          submission,
          ...current.submissions.filter((item) => !(item.assessmentId === payload.assessmentId && item.studentId === payload.studentId))
        ]
      }));
      return submission;
    },
    gradeSubmission(id, score, feedback) {
      setState((current) => ({
        ...current,
        submissions: current.submissions.map((item) => item.id === id
          ? { ...item, score: Number(score), feedback, status: "Graded", gradedAt: new Date().toISOString() }
          : item)
      }));
    },
    askQuestion(payload) {
      const question = { ...payload, id: newId("question"), answer: "", askedAt: new Date().toISOString(), answeredAt: "" };
      setState((current) => ({ ...current, questions: [question, ...current.questions] }));
      return question;
    },
    answerQuestion(id, answer) {
      setState((current) => ({
        ...current,
        questions: current.questions.map((item) => item.id === id
          ? { ...item, answer, answeredAt: new Date().toISOString() }
          : item)
      }));
    },
    resetAssessments() {
      setState(INITIAL_ASSESSMENT_STATE);
    }
  }), []);

  return { state, ...api };
}
