import { brand } from "../../utils/data.js";

export function createEmptyModule(courseId, order) {
  return {
    id: "",
    courseId,
    title: "",
    slug: "",
    description: "",
    accentColor: brand.velvet,
    order,
    isActive: true
  };
}

export function createEmptySubmodule(moduleId, order) {
  return {
    id: "",
    moduleId,
    title: "",
    slug: "",
    description: "",
    accentColor: brand.teal,
    order,
    isActive: true,
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    ogTitle: "",
    ogImage: ""
  };
}

export function getSortedCourseModules(modules, courseId) {
  return modules
    .filter((item) => item.courseId === courseId)
    .sort((firstItem, secondItem) => firstItem.order - secondItem.order);
}

export function getSortedSubmodules(submodules, moduleId) {
  return submodules
    .filter((item) => item.moduleId === moduleId)
    .sort((firstItem, secondItem) => firstItem.order - secondItem.order);
}