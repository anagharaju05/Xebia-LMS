export default function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="toggle-card">
      <div>
        <strong>{label}</strong>
        {description && <span>{description}</span>}
      </div>
      <input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} />
      <i />
    </label>
  );
}