export default function Metric({ icon: Icon, value, label, tone }) {
  return (
    <article className={`metric ${tone || ""}`}>
      <div className="metric-icon"><Icon size={22} /></div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </article>
  );
}