import CourseCard from "../cards/CourseCard.jsx";

export default function CoursePreview({ course, category, moduleCount = 0 }) {
  return <CourseCard course={course} category={category} moduleCount={moduleCount} preview />;
}