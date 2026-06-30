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
  STUDENTS: "/students"
};

export function getActiveNavigationView(pathname) {
  if (pathname.startsWith("/categories")) return APP_ROUTES.CATEGORIES;
  if (pathname.startsWith("/courses")) return APP_ROUTES.COURSES;
  return pathname;
}
