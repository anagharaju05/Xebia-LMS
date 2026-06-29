export function createEmptyContentBlock(submoduleId, order) {
  return {
    id: "",
    submoduleId,
    type: "Heading",
    title: "",
    text: "",
    language: "",
    url: "",
    caption: "",
    fileName: "",
    fileType: "",
    fileSize: 0,
    order,
    isActive: true
  };
}

export function getContentPlaceholder(type) {
  const placeholders = {
    Code: "// Paste your code here...",
    Table: "| Column A | Column B |\n| --- | --- |\n| Value 1 | Value 2 |",
    Notes: "Lesson notes...",
    Callout: "Callout body text...",
    Text: "Enter text content..."
  };
  return placeholders[type] || "Enter content...";
}

export function filterContentBlocks(contentBlocks, query, type) {
  return contentBlocks
    .filter((item) => `${item.title} ${item.text} ${item.type}`.toLowerCase().includes(query.toLowerCase()))
    .filter((item) => type === "All" || item.type === type);
}