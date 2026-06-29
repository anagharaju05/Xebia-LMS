import { brand } from "../../utils/data.js";

const BRAND_COLORS = [
  brand.velvet,
  brand.teal,
  brand.orange,
  brand.brightVelvet,
  brand.velvetDark,
  "#5C4F61",
  "#793B74",
  "#B8AFCF"
];

export default function ColorDots({ value, onChange }) {
  return (
    <div className="color-dots">
      {BRAND_COLORS.map((color) => (
        <button
          key={color}
          title={color}
          className={value === color ? "active" : ""}
          style={{ background: color }}
          onClick={() => onChange(color)}
          type="button"
        />
      ))}
    </div>
  );
}