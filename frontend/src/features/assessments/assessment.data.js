export const ASSESSMENT_STORAGE_KEY = "xebia-lms-assessments-v2";

export const DEMO_STUDENTS = [
  { id: "student-aarav", name: "Aarav Kumar", email: "student@xebia.com" },
  { id: "student-priya", name: "Priya Sharma", email: "priya.sharma@xebia.com" },
  { id: "student-daniel", name: "Daniel Joseph", email: "daniel.joseph@xebia.com" }
];

export const ASSESSMENT_TYPES = [
  { value: "file", label: "File upload", description: "Accept PDF or DOCX work" },
  { value: "quiz", label: "Excel quiz", description: "Import questions from XLSX or CSV" },
  { value: "coding", label: "Coding exercise", description: "Starter code, tests, and grading" }
];

export const INITIAL_ASSESSMENT_STATE = {
  assessments: [],
  submissions: [],
  questions: []
};

export function createBlankAssessment() {
  return {
    id: "",
    title: "",
    subject: "",
    className: "Backend Engineering - Cohort 7",
    type: "file",
    teacherId: "teacher-user-1",
    instructions: "",
    dueAt: "2026-07-15T18:00",
    points: 100,
    status: "Draft",
    allowedFileTypes: ["pdf", "docx"],
    attachmentName: "",
    quizFileName: "",
    quizQuestions: [],
    language: "javascript",
    starterCode: "function solve(input) {\n  // Write your solution here\n}\n",
    testCases: [{ id: "test-new-1", input: "", expected: "", hidden: false }],
    assignedStudentIds: [],
    assignmentScope: "",
    assignedBatchIds: []
  };
}
