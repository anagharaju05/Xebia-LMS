export default function SelectField({ label, value, onChange, options }) {
  const normalizedOptions = options.map((item) => (Array.isArray(item) ? item : [item, item]));
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {normalizedOptions.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}