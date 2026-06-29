export function filterAndSortCategories(categories, query, status, sort) {
  return categories
    .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
    .filter((item) => status === "All" || item.status === status)
    .sort((firstItem, secondItem) => {
      if (sort === "courses") return secondItem.courses - firstItem.courses;
      if (sort === "learners") return secondItem.learners - firstItem.learners;
      return firstItem.name.localeCompare(secondItem.name);
    });
}

export function hasDuplicateCategoryName(categories, category) {
  return categories.some(
    (item) =>
      item.id !== category.id &&
      item.name.trim().toLowerCase() === category.name.trim().toLowerCase()
  );
}