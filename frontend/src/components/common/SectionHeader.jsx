export default function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="section-header">
      <Icon size={17} />
      <h3>{title}</h3>
    </div>
  );
}