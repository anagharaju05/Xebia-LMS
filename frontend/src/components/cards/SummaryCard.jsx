export default function SummaryCard({ title, children, className = "" }) {
  return (
    <section className={`summary-card ${className}`}>
      {title && <strong>{title}</strong>}
      {children}
    </section>
  );
}