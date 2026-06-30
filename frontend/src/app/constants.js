import { BookOpen, Boxes, Layers3, LayoutDashboard, Tags, UsersRound } from "lucide-react";

export const STORAGE_KEY = "xebia-lms-admin-react-state-v1";
export const THEME_KEY = "xebia-lms-admin-react-theme-v1";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", path: "/", icon: LayoutDashboard },
  { id: "categories", label: "Categories", path: "/categories", icon: Tags },
  { id: "courses", label: "Courses", path: "/courses", icon: BookOpen },
  { id: "content", label: "Content", path: "/content", icon: Boxes },
  { id: "students", label: "Students", path: "/students", icon: UsersRound }
];
