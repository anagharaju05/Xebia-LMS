import { brand } from "../../utils/data.js";
import { getCategoryImage } from "../../utils/categoryImage.utils.js";

export default function CategoryThumb({ category, courses = [], large }) {
  const image = getCategoryImage(category, courses);

  return (
    <div
      className={`category-thumb ${large ? "large" : ""}`}
      style={{ "--accent": category.accentColor || brand.teal }}
    >
      <img src={image} alt="" />
    </div>
  );
}
