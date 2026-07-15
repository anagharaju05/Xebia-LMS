import { useEffect, useMemo, useState } from "react";
import { INITIAL_BATCH_STATE } from "./batch.data.js";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
const BASE_URL = `${baseUrl}/api/batches`;

function getHeaders() {
  const headers = {
    "Content-Type": "application/json",
    "X-Organization-ID": "123e4567-e89b-12d3-a456-426614174000",
    "X-User-Id": "admin-1",
    "X-User-Role": "TEACHER"
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

export function useBatchStore() {
  const [state, setState] = useState({
    batches: [],
    subjects: [],
    announcements: [],
    attendance: [],
    discussions: [],
    sessions: [],
    loading: true
  });

  const fetchState = async () => {
    try {
      const res = await fetch(`${BASE_URL}/state`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setState({ ...data, loading: false });
      } else {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    } catch (e) {
      console.error("Failed to fetch batch state", e);
      setState({ ...INITIAL_BATCH_STATE, loading: false });
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const actions = useMemo(() => ({
    async saveBatch(record) {
      try {
        const res = await fetch(BASE_URL, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(record)
        });
        if (res.ok) await fetchState();
      } catch (e) { console.error(e); }
    },
    async deleteBatch(batchId) {
      try {
        const res = await fetch(`${BASE_URL}/${batchId}`, { method: "DELETE", headers: getHeaders() });
        if (res.ok) await fetchState();
      } catch (e) { console.error(e); }
    },
    async archiveBatch(batchId) {
      try {
        const res = await fetch(`${BASE_URL}/${batchId}/archive`, { method: "PUT", headers: getHeaders() });
        if (res.ok) await fetchState();
      } catch (e) { console.error(e); }
    },
    async regenerateJoinCode(batchId) {
      try {
        const res = await fetch(`${BASE_URL}/${batchId}/join-code/regenerate`, { method: "PUT", headers: getHeaders() });
        if (res.ok) await fetchState();
      } catch (e) { console.error(e); }
    },
    async toggleJoinCode(batchId) {
      try {
        const res = await fetch(`${BASE_URL}/${batchId}/join-code/toggle`, { method: "PUT", headers: getHeaders() });
        if (res.ok) await fetchState();
      } catch (e) { console.error(e); }
    },
    async joinBatch(code, studentId) {
      try {
        const res = await fetch(`${BASE_URL}/join`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ code, studentId })
        });
        if (res.ok) {
          const result = await res.json();
          await fetchState();
          return result;
        }
      } catch (e) { console.error(e); }
      return { ok: false, error: "Network error" };
    },
    async saveSubject(record) {
      try {
        const res = await fetch(`${BASE_URL}/subjects`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(record)
        });
        if (res.ok) await fetchState();
      } catch (e) { console.error(e); }
    },
    async deleteSubject(subjectId) {
      try {
        const res = await fetch(`${BASE_URL}/subjects/${subjectId}`, { method: "DELETE", headers: getHeaders() });
        if (res.ok) await fetchState();
      } catch (e) { console.error(e); }
    },
    async saveAnnouncement(record) {
      try {
        const res = await fetch(`${BASE_URL}/announcements`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(record)
        });
        if (res.ok) await fetchState();
      } catch (e) { console.error(e); }
    },
    async deleteAnnouncement(announcementId) {
      try {
        const res = await fetch(`${BASE_URL}/announcements/${announcementId}`, { method: "DELETE", headers: getHeaders() });
        if (res.ok) await fetchState();
      } catch (e) { console.error(e); }
    },
    async saveAttendance(batchId, subjectId, date, statuses) {
      try {
        const res = await fetch(`${BASE_URL}/attendance`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ batchId, subjectId, date, statuses })
        });
        if (res.ok) await fetchState();
      } catch (e) { console.error(e); }
    },
    async createDiscussion(record) {
      try {
        const res = await fetch(`${BASE_URL}/discussions`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(record)
        });
        if (res.ok) await fetchState();
      } catch (e) { console.error(e); }
    },
    async replyDiscussion(discussionId, reply) {
      try {
        const res = await fetch(`${BASE_URL}/discussions/${discussionId}/reply`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(reply)
        });
        if (res.ok) await fetchState();
      } catch (e) { console.error(e); }
    },
    async togglePin(discussionId) {
      try {
        const res = await fetch(`${BASE_URL}/discussions/${discussionId}/pin`, { method: "PUT", headers: getHeaders() });
        if (res.ok) await fetchState();
      } catch (e) { console.error(e); }
    }
  }), []);
  return { state, ...actions };
}
