export default function Select({ value, onChange, options, icon: Icon }) {
  const normalizedOptions = options.map((item) => (Array.isArray(item) ? item : [item, item]));
  return (
    <label className="select-box">
      {Icon && <Icon size={17} />}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {normalizedOptions.map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>{label}</option>
        ))}
      </select>
    </label>
  );
}