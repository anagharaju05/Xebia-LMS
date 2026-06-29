import { brand } from "../../utils/data.js";

export default function CategoryThumb({ category, large }) {
  const image = category.iconType === "image" && category.imageUrl;
  return (
    <div className={`category-thumb ${large ? "large" : ""}`} style={{ "--accent": category.accentColor || brand.teal }}>
      {image ? <img src={image} alt="" /> : <span>{category.icon || "💡"}</span>}
    </div>
  );
}