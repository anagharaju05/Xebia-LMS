import { BookOpen, Boxes, Layers3, LayoutDashboard, Tags } from "lucide-react";

export const STORAGE_KEY = "xebia-lms-admin-react-state-v1";
export const THEME_KEY = "xebia-lms-admin-react-theme-v1";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "categories", label: "Categories", icon: Tags },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "curriculum", label: "Curriculum", icon: Layers3 },
  { id: "content", label: "Content", icon: Boxes }
];