export const VIEWS = {
  DASHBOARD: "dashboard",
  CATEGORIES: "categories",
  CATEGORY_FORM: "category-form",
  COURSES: "courses",
  COURSE_FORM: "course-form",
  CURRICULUM: "curriculum",
  CONTENT: "content"
};

export function getActiveNavigationView(view) {
  if (view.startsWith("category")) return VIEWS.CATEGORIES;
  if (view.startsWith("course")) return VIEWS.COURSES;
  return view;
}