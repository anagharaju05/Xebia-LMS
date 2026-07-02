export const API_ROUTES = {
  DASHBOARD: "/api/dashboard",
  CATEGORIES: "/api/categories",
  COURSES: "/api/courses",
  CONTENT: "/api/content",
  STUDENTS: "/api/students",
  CURRICULUM: "/api/curriculum"
};

export const APP_ROUTES = {
  DASHBOARD: "/",
  CATEGORIES: "/categories",
  CATEGORY_FORM: "/categories/:id",
  COURSES: "/courses",
  COURSE_FORM: "/courses/:id",
  CURRICULUM: "/courses/:courseId/curriculum",
  CONTENT: "/content",
  STUDENTS: "/students",
  ANALYTICS_EXEC_SUMMARY: "/admin/learning-analytics/executive-summary",
  ANALYTICS_COVERAGE: "/admin/learning-analytics/coverage",
  ANALYTICS_HOURS: "/admin/learning-analytics/learning-hours",
  ANALYTICS_PILLARS: "/admin/learning-analytics/pillars",
  ANALYTICS_AI: "/admin/learning-analytics/ai-transformation",
  ANALYTICS_CERTS: "/admin/learning-analytics/certifications",
  ANALYTICS_FLAGSHIP: "/admin/learning-analytics/flagship-programs",
  ANALYTICS_TRENDS: "/admin/learning-analytics/trends",
  ANALYTICS_EFFECTIVENESS: "/admin/learning-analytics/effectiveness",
  ANALYTICS_CHAMPIONS: "/admin/learning-analytics/champions",
  ANALYTICS_INVESTMENT: "/admin/learning-analytics/project-investment",
  ANALYTICS_FRESHER: "/admin/learning-analytics/fresher-journey"
};

export function getActiveNavigationView(pathname) {
  if (pathname.startsWith("/categories")) return APP_ROUTES.CATEGORIES;
  if (pathname.startsWith("/courses")) return APP_ROUTES.COURSES;
  return pathname;
}
