import { fromLines, toLines } from "../../utils/format.utils.js";
import { createEmptyCourse } from "./course.defaults.js";

export function getCourseFormData(course, categories) {
  if (!course) return createEmptyCourse(categories);
  return {
    ...course,
    learningOutcomes: toLines(course.learningOutcomes),
    prerequisites: toLines(course.prerequisites),
    targetAudience: toLines(course.targetAudience)
  };
}

export function mapFormToCourse(form) {
  return {
    ...form,
    learningOutcomes: fromLines(form.learningOutcomes),
    prerequisites: fromLines(form.prerequisites),
    targetAudience: fromLines(form.targetAudience)
  };
}

export function calculateSeoScore(form) {
  const fields = [
    "metaTitle",
    "metaDescription",
    "primaryKeyword",
    "metaKeywords",
    "seoTags",
    "ogTitle",
    "ogImage",
    "faqContent"
  ];
  const completedFields = fields.filter((field) => Boolean(form[field])).length;
  return Math.round((completedFields / fields.length) * 100);
}

export function filterCourses(courses, query, level, status) {
  return courses
    .filter((course) => course.title.toLowerCase().includes(query.toLowerCase()))
    .filter((course) => level === "All" || course.level === level)
    .filter(
      (course) =>
        status === "All" ||
        (status === "Published"
          ? course.isPublished
          : status === "Draft"
            ? !course.isPublished
            : course.isActive)
    );
}