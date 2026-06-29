export default function Segmented({ value, onChange, options, compact, wrap }) {
  const normalizedOptions = options.map((item) => (Array.isArray(item) ? item : [item, item]));
  return (
    <div className={`segmented ${compact ? "compact" : ""} ${wrap ? "wrap" : ""}`}>
      {normalizedOptions.map(([optionValue, label]) => (
        <button
          key={optionValue}
          className={value === optionValue ? "active" : ""}
          onClick={() => onChange(optionValue)}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}