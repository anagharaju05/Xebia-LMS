import Field from "./Field.jsx";
import ColorDots from "./ColorDots.jsx";
import { brand } from "../../utils/data.js";

export default function AccentColorControl({ value, onChange }) {
  const color = value || brand.velvet;
  const displayColor = /^#[0-9a-f]{6}$/i.test(color) ? color : brand.velvet;

  function updateHex(rawValue) {
    const normalizedValue = rawValue.replace(/[^0-9a-f]/gi, "").slice(0, 6);
    onChange(`#${normalizedValue}`);
  }

  return (
    <>
      <div className="color-input-row">
        <input type="color" value={displayColor} onChange={(event) => onChange(event.target.value)} />
        <Field label="Hex" value={color.replace("#", "")} onChange={updateHex} placeholder="6C1D5F" />
      </div>
      <ColorDots value={displayColor} onChange={onChange} />
    </>
  );
}