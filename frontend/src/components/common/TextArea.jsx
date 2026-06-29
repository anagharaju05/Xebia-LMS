export default function TextArea({ label, value, onChange, placeholder, rows = 4, max, dark }) {
  const currentValue = value ?? "";
  return (
    <label className={`field textarea ${dark ? "dark-field" : ""}`}>
      <span>{label} {max && <small>max {max}</small>}</span>
      <textarea
        value={currentValue}
        maxLength={max}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
      {max && <b>{String(currentValue).length}/{max}</b>}
    </label>
  );
}