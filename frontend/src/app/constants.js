import { BookOpen, Boxes, Layers3, LayoutDashboard, Tags, UsersRound, TrendingUp, BarChart2, CheckSquare, Clock, Shield, Zap, Award, Star, Target, Users, Briefcase, GraduationCap, ClipboardCheck, CalendarDays } from "lucide-react";

export const STORAGE_KEY = "xebia-lms-admin-react-state-v1";
export const THEME_KEY = "xebia-lms-admin-react-theme-v1";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", path: "/", icon: LayoutDashboard },
  { id: "categories", label: "Categories", path: "/categories", icon: Tags },
  { id: "courses", label: "Courses", path: "/courses", icon: BookOpen },
  { id: "content", label: "Content", path: "/content", icon: Boxes },
  { id: "students", label: "Students", path: "/students", icon: UsersRound },
  { id: "assessments", label: "Assessments", path: "/assessments", icon: ClipboardCheck },
  { id: "events", label: "Events", path: "/events", icon: CalendarDays },
  { 
    id: "analytics", 
    label: "Learning Analytics", 
    path: "/admin/learning-analytics", 
    icon: TrendingUp,
    subItems: [
      { id: "exec-summary", label: "Executive Summary", path: "/admin/learning-analytics/executive-summary", icon: LayoutDashboard },
      { id: "coverage", label: "Learning Coverage", path: "/admin/learning-analytics/coverage", icon: Users },
      { id: "hours", label: "Learning Hours", path: "/admin/learning-analytics/learning-hours", icon: Clock },
      { id: "pillars", label: "Learning Pillars", path: "/admin/learning-analytics/pillars", icon: Layers3 },
      { id: "ai-trans", label: "AI Transformation", path: "/admin/learning-analytics/ai-transformation", icon: Zap },
      { id: "certs", label: "Certifications", path: "/admin/learning-analytics/certifications", icon: Award },
      { id: "flagship", label: "Flagship Programs", path: "/admin/learning-analytics/flagship-programs", icon: Star },
      { id: "trends", label: "Learning Trends", path: "/admin/learning-analytics/trends", icon: TrendingUp },
      { id: "effectiveness", label: "Training Effectiveness", path: "/admin/learning-analytics/effectiveness", icon: CheckSquare },
      { id: "champions", label: "Learning Champions", path: "/admin/learning-analytics/champions", icon: Award },
      { id: "investment", label: "Project Investment", path: "/admin/learning-analytics/project-investment", icon: Target },
      { id: "fresher", label: "Fresher Journey", path: "/admin/learning-analytics/fresher-journey", icon: GraduationCap }
    ]
  }
];
