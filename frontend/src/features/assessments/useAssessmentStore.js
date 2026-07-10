import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api.js";
import { ASSESSMENT_STORAGE_KEY, INITIAL_ASSESSMENT_STATE } from "./assessment.data.js";

const API_ENABLED = import.meta.env.VITE_ENABLE_API === "true";

function ensureUUID(id) {
  if (!id) return crypto.randomUUID();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  // Simple stable UUID hash generator for mock text IDs (e.g. 'assessment-1')
  let hashStr = "";
  for (let i = 0; i < 32; i += 1) {
    const charCode = id.charCodeAt(i % id.length) || 0;
    hashStr += ((charCode * (i + 1)) % 16).toString(16);
  }
  return `${hashStr.slice(0, 8)}-${hashStr.slice(8, 12)}-4${hashStr.slice(12, 15)}-a${hashStr.slice(15, 18)}-${hashStr.slice(18, 30)}`;
}

export function useAssessmentStore() {
  const [state, setState] = useState(INITIAL_ASSESSMENT_STATE);

  // Synchronize with API when active
  async function syncStore() {
    if (!API_ENABLED) return;
    try {
      const [assessments, questions] = await Promise.all([
        api.get("/api/assessments"),
        api.get("/api/assessments/questions")
      ]);

      // Submissions are loaded via the student assignments endpoint
      const assignments = await api.get("/api/management/students/assignments").catch(() => []);

      setState((current) => ({
        ...current,
        assessments: assessments || [],
        questions: (questions || []).map(q => ({
          id: q.id,
          studentId: q.studentId,
          subject: q.subject,
          text: q.content,
          answer: q.answer || "",
          askedAt: q.askedAt,
          answeredAt: q.answeredAt || ""
        })),
        submissions: (assignments || []).map(sub => {
          let submissionData = {};
          try {
            submissionData = JSON.parse(sub.submission || "{}");
          } catch {}

          let assessmentId = submissionData.assessmentId;
          if (!assessmentId && sub.id) {
            const parts = sub.id.split("-");
            if (parts.length >= 10) {
              assessmentId = parts.slice(5, 10).join("-");
            } else {
              assessmentId = sub.id;
            }
          }

          return {
            id: sub.id,
            assessmentId: assessmentId,
            studentId: sub.studentId,
            studentName: sub.studentName || "Student",
            score: sub.score,
            status: sub.status === "Reviewed" ? "Graded" : sub.status,
            feedback: sub.reviewNotes || "",
            submission: sub.submission || "",
            submittedAt: sub.submittedAt || "",
            ...submissionData
          };
        })
      }));
    } catch (e) {
      console.error("Failed to sync assessments store with backend", e);
    }
  }

  useEffect(() => {
    if (API_ENABLED) {
      syncStore();
    } else {
      try {
        const saved = JSON.parse(localStorage.getItem(ASSESSMENT_STORAGE_KEY));
        if (saved) setState(saved);
      } catch {}
    }
  }, []);

  // Write local storage backup when offline
  useEffect(() => {
    if (!API_ENABLED) {
      localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const actions = useMemo(() => ({
    async saveAssessment(record) {
      const uuid = ensureUUID(record.id);
      const isUpdate = Boolean(record.id);
      
      const payload = {
        ...record,
        id: uuid,
        quizQuestions: (record.quizQuestions || []).map(q => ({
          id: ensureUUID(q.id),
          prompt: q.prompt,
          options: q.options || [],
          answer: q.answer,
          marks: q.marks || 1,
          explanation: q.explanation || ""
        })),
        testCases: (record.testCases || []).map(tc => ({
          id: ensureUUID(tc.id),
          input: tc.input,
          expectedOutput: tc.expected,
          isHidden: tc.hidden || false
        })),
        assignedBatchIds: (record.assignedBatchIds || []).map(ensureUUID),
        assignedStudentIds: (record.assignedStudentIds || []).map(ensureUUID)
      };

      if (!API_ENABLED) {
        setState((current) => {
          const nextItems = current.assessments.some(item => item.id === record.id)
            ? current.assessments.map(item => item.id === record.id ? record : item)
            : [record, ...current.assessments];
          return { ...current, assessments: nextItems };
        });
        return record;
      }

      try {
        if (isUpdate) {
          await api.put(`/api/assessments/${uuid}`, payload);
        } else {
          await api.post("/api/assessments", payload);
        }
        await syncStore();
      } catch (e) {
        console.error("Failed to save assessment via API", e);
      }
      return payload;
    },

    async deleteAssessment(id) {
      if (!API_ENABLED) {
        setState((current) => ({
          ...current,
          assessments: current.assessments.filter((item) => item.id !== id),
          submissions: current.submissions.filter((item) => item.assessmentId !== id),
          questions: current.questions.filter((item) => item.assessmentId !== id)
        }));
        return;
      }

      try {
        await api.delete(`/api/assessments/${ensureUUID(id)}`);
        await syncStore();
      } catch (e) {
        console.error("Failed to delete assessment via API", e);
      }
    },

    async setAssessmentStatus(id, status) {
      if (!API_ENABLED) {
        setState((current) => ({
          ...current,
          assessments: current.assessments.map((item) => item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item)
        }));
        return;
      }

      try {
        const fullRecord = state.assessments.find(a => a.id === id);
        if (fullRecord) {
          const updated = { ...fullRecord, status };
          await api.put(`/api/assessments/${ensureUUID(id)}`, updated);
          await syncStore();
        }
      } catch (e) {
        console.error("Failed to update status via API", e);
      }
    },

  async submitWork(payload) {
    const existing = state.submissions.find((item) => item.assessmentId === payload.assessmentId && item.studentId === payload.studentId);
    const attemptCount = (existing?.attemptCount || 0) + 1;

    if (!API_ENABLED) {
      const autoGraded = payload.type === "quiz";
      const submission = {
        ...payload,
        id: `sub-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: autoGraded ? "Graded" : "Submitted",
        score: autoGraded ? Number(payload.score) : null,
        feedback: autoGraded ? "Automatically graded." : "",
        attemptCount
      };
      setState((current) => ({
        ...current,
        submissions: [submission, ...current.submissions.filter((item) => !(item.assessmentId === payload.assessmentId && item.studentId === payload.studentId))]
      }));
      return submission;
    }

      try {
        const studentId = ensureUUID(payload.studentId);
        const assessmentId = ensureUUID(payload.assessmentId);
        const taskId = `${studentId}-${assessmentId}`;

        let fileUrl = payload.fileUrl || "";

        // If a file is uploaded, send it to the upload endpoint first
        if (payload.type === "file" && payload.file) {
          const formData = new FormData();
          formData.append("file", payload.file);
          try {
            const uploadRes = await api.upload("/api/portal/files/upload", formData);
            if (uploadRes && uploadRes.fileUrl) {
              fileUrl = uploadRes.fileUrl;
            }
          } catch (uploadErr) {
            console.error("File upload failed, falling back to mock file reference", uploadErr);
          }
        }

        // Serialize the entire payload (containing fileName, note, quizResults, code, language, fileUrl etc.)
        const { file: _file, ...submissionData } = payload;
        const serialized = JSON.stringify({
          ...submissionData,
          fileUrl,
          assessmentId: payload.assessmentId,
          attemptCount
        });

        await api.post(`/api/portal/students/${studentId}/tasks/${taskId}/submit`, {
          submission: serialized
        });

        await syncStore();
      } catch (e) {
        console.error("Failed to submit work via API", e);
      }
    },

    async gradeSubmission(id, score, feedback) {
      if (!API_ENABLED) {
        setState((current) => ({
          ...current,
          submissions: current.submissions.map((item) => item.id === id ? { ...item, score: Number(score), feedback, status: "Graded", gradedAt: new Date().toISOString() } : item)
        }));
        return;
      }

      try {
        // Grade task assignment on the backend
        await api.put(`/api/management/students/assignments/${id}/review`, {
          score: Number(score),
          notes: feedback
        });
        await syncStore();
      } catch (e) {
        console.error("Failed to review assignment via API", e);
      }
    },

    async askQuestion(payload) {
      if (!API_ENABLED) {
        const question = { ...payload, id: `question-${Date.now()}`, answer: "", askedAt: new Date().toISOString(), answeredAt: "" };
        setState((current) => ({ ...current, questions: [question, ...current.questions] }));
        return question;
      }

      try {
        const res = await api.post("/api/assessments/questions", {
          studentId: ensureUUID(payload.studentId),
          subject: payload.subject || "General",
          content: payload.text
        });
        await syncStore();
        return res;
      } catch (e) {
        console.error("Failed to ask question via API", e);
      }
    },

    async answerQuestion(id, answer) {
      if (!API_ENABLED) {
        setState((current) => ({
          ...current,
          questions: current.questions.map((item) => item.id === id ? { ...item, answer, answeredAt: new Date().toISOString() } : item)
        }));
        return;
      }

      try {
        await api.post(`/api/assessments/questions/${ensureUUID(id)}/answer`, {
          answer: answer
        });
        await syncStore();
      } catch (e) {
        console.error("Failed to answer question via API", e);
      }
    },

    resetAssessments() {
      if (!API_ENABLED) {
        setState(INITIAL_ASSESSMENT_STATE);
      }
    }
  }), [state]);

  return { state, ...actions };
}
