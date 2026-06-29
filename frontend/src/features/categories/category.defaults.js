import { brand } from "../../utils/data.js";

export function createEmptyCategory() {
  return {
    id: "",
    name: "",
    slug: "",
    iconType: "emoji",
    icon: "💡",
    imageUrl: "",
    description: "",
    accentColor: brand.teal,
    status: "Active",
    courses: 0,
    learners: 0
  };
}