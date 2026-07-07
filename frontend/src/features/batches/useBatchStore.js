import { useEffect, useMemo, useState } from "react";
import { BATCH_STORAGE_KEY, INITIAL_BATCH_STATE } from "./batch.data.js";

function readState() {
  try { return JSON.parse(localStorage.getItem(BATCH_STORAGE_KEY)) || INITIAL_BATCH_STATE; }
  catch { return INITIAL_BATCH_STATE; }
}

function id(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }
function joinCode() { return `${Math.random().toString(36).slice(2, 5)}-${Math.random().toString(36).slice(2, 5)}`.toUpperCase(); }

export function useBatchStore() {
  const [state, setState] = useState(readState);
  useEffect(() => localStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(state)), [state]);

  const actions = useMemo(() => ({
    saveBatch(record) {
      const saved = { ...record, id: record.id || id("batch"), joinCode: record.joinCode || joinCode() };
      setState((current) => ({ ...current, batches: current.batches.some((item) => item.id === saved.id) ? current.batches.map((item) => item.id === saved.id ? saved : item) : [saved, ...current.batches] }));
      return saved;
    },
    deleteBatch(batchId) {
      setState((current) => ({ ...current, batches: current.batches.filter((item) => item.id !== batchId), announcements: current.announcements.filter((item) => item.batchId !== batchId), attendance: current.attendance.filter((item) => item.batchId !== batchId), discussions: current.discussions.filter((item) => item.batchId !== batchId), sessions: current.sessions.filter((item) => item.batchId !== batchId), subjects: current.subjects.map((subject) => ({ ...subject, assignedBatchIds: subject.assignedBatchIds.filter((id) => id !== batchId) })) }));
    },
    archiveBatch(batchId) { setState((current) => ({ ...current, batches: current.batches.map((item) => item.id === batchId ? { ...item, status: item.status === "Archived" ? "Active" : "Archived" } : item) })); },
    regenerateJoinCode(batchId) { setState((current) => ({ ...current, batches: current.batches.map((item) => item.id === batchId ? { ...item, joinCode: joinCode(), joinCodeEnabled: true } : item) })); },
    toggleJoinCode(batchId) { setState((current) => ({ ...current, batches: current.batches.map((item) => item.id === batchId ? { ...item, joinCodeEnabled: !item.joinCodeEnabled } : item) })); },
    joinBatch(code, studentId) {
      let result = { ok: false, error: "Join code not found." };
      setState((current) => {
        const match = current.batches.find((batch) => batch.joinCode.toLowerCase() === code.trim().toLowerCase());
        if (!match) return current;
        if (!match.joinCodeEnabled) { result = { ok: false, error: "This join code is disabled." }; return current; }
        if (match.status !== "Active") { result = { ok: false, error: "This batch is archived." }; return current; }
        if (match.studentIds.includes(studentId)) { result = { ok: false, error: "You already belong to this batch." }; return current; }
        if (match.studentIds.length >= match.capacity) { result = { ok: false, error: "This batch is full." }; return current; }
        result = { ok: true, batch: match };
        return { ...current, batches: current.batches.map((batch) => batch.id === match.id ? { ...batch, studentIds: [...batch.studentIds, studentId] } : batch) };
      });
      return result;
    },
    saveSubject(record) {
      const saved = { ...record, id: record.id || id("subject") };
      setState((current) => ({ ...current, subjects: current.subjects.some((item) => item.id === saved.id) ? current.subjects.map((item) => item.id === saved.id ? saved : item) : [saved, ...current.subjects], batches: current.batches.map((batch) => ({ ...batch, subjectIds: saved.assignedBatchIds.includes(batch.id) ? [...new Set([...batch.subjectIds, saved.id])] : batch.subjectIds.filter((subjectId) => subjectId !== saved.id) })) }));
      return saved;
    },
    deleteSubject(subjectId) { setState((current) => ({ ...current, subjects: current.subjects.filter((item) => item.id !== subjectId), batches: current.batches.map((batch) => ({ ...batch, subjectIds: batch.subjectIds.filter((id) => id !== subjectId) })), discussions: current.discussions.filter((item) => item.subjectId !== subjectId) })); },
    saveAnnouncement(record) {
      const saved = { ...record, id: record.id || id("announcement"), createdAt: record.createdAt || new Date().toISOString() };
      setState((current) => ({ ...current, announcements: current.announcements.some((item) => item.id === saved.id) ? current.announcements.map((item) => item.id === saved.id ? saved : item) : [saved, ...current.announcements] }));
    },
    deleteAnnouncement(announcementId) { setState((current) => ({ ...current, announcements: current.announcements.filter((item) => item.id !== announcementId) })); },
    saveAttendance(batchId, subjectId, date, statuses) {
      setState((current) => { const existing = current.attendance.find((item) => item.batchId === batchId && item.date === date && item.subjectId === subjectId); const record = { id: existing?.id || id("attendance"), batchId, subjectId, date, statuses }; return { ...current, attendance: existing ? current.attendance.map((item) => item.id === existing.id ? record : item) : [record, ...current.attendance] }; });
    },
    createDiscussion(record) { setState((current) => ({ ...current, discussions: [{ ...record, id: id("discussion"), pinned: false, createdAt: new Date().toISOString(), replies: [] }, ...current.discussions] })); },
    replyDiscussion(discussionId, reply) { setState((current) => ({ ...current, discussions: current.discussions.map((item) => item.id === discussionId ? { ...item, replies: [...item.replies, { ...reply, id: id("reply"), createdAt: new Date().toISOString() }] } : item) })); },
    togglePin(discussionId) { setState((current) => ({ ...current, discussions: current.discussions.map((item) => item.id === discussionId ? { ...item, pinned: !item.pinned } : item) })); }
  }), []);
  return { state, ...actions };
}
