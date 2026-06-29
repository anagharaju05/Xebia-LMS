import { CheckCircle2, X } from "lucide-react";

export default function FieldSummary({ items }) {
  return (
    <section className="summary-card">
      <strong>Field Summary</strong>
      {items.map(([label, value, isComplete]) => (
        <div key={label}>
          <span>{label}</span>
          <b>{value}</b>
          {isComplete ? <CheckCircle2 size={16} /> : <X size={16} />}
        </div>
      ))}
    </section>
  );
}