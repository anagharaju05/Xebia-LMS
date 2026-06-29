import { Copy } from "lucide-react";

export default function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <Copy size={24} />
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}