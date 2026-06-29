export default function StatusBadge({ active, label, muted }) {
  return <span className={`status-badge ${active ? "active" : ""} ${muted ? "muted" : ""}`}>{label}</span>;
}