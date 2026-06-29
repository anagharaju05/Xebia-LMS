import { createId } from "../utils/id.utils.js";

export function createAuditEntry(label, target) {
  return { id: createId("aud"), label, target, time: "Just now" };
}

export function prependAuditEntry(auditEntries, entry, limit = 8) {
  return [entry, ...auditEntries].slice(0, limit);
}