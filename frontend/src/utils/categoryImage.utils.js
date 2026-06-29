const CATEGORY_IMAGES = {
  "ai-machine-learning": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=320&q=80",
  architecture: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=320&q=80",
  "backend-engineering": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=320&q=80",
  "cloud-devops": "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=320&q=80",
  "data-science": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=320&q=80",
  "mobile-development": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=320&q=80",
  security: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=320&q=80",
  "ui-ux-design": "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=320&q=80",
  "web-development": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=320&q=80"
};

export function getCategoryImage(category, courses = []) {
  if (category?.imageUrl) return category.imageUrl;
  const representativeCourse = courses.find(
    (course) => course.categoryId === category?.id && course.thumbnail
  );
  return representativeCourse?.thumbnail || CATEGORY_IMAGES[category?.slug] || CATEGORY_IMAGES["web-development"];
}
