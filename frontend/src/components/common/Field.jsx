export default function Field({ label, value, onChange, placeholder, required, type = "text", max }) {
  const currentValue = value ?? "";
  return (
    <label className="field">
      <span>{label} {required && <em>*</em>} {max && <small>max {max}</small>}</span>
      <input
        type={type}
        value={currentValue}
        maxLength={max}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      {max && <b>{String(currentValue).length}/{max}</b>}
    </label>
  );
}