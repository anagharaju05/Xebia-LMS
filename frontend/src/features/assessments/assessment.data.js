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
  assessments: [
    {
      id: "assess-api-design",
      title: "REST API Design Brief",
      subject: "Spring Boot Masterclass",
      className: "Backend Engineering - Cohort 7",
      type: "file",
      teacherId: "teacher-user-1",
      instructions: "Design three REST endpoints for an order service. Include request models, validation rules, response codes, and a short architecture note.",
      dueAt: "2026-07-10T18:00",
      points: 100,
      status: "Published",
      assignmentScope: "selected_batch",
      assignedBatchIds: ["batch-backend-7"],
      allowedFileTypes: ["pdf", "docx"],
      attachmentName: "order-service-brief.pdf",
      assignedStudentIds: DEMO_STUDENTS.map((student) => student.id),
      createdAt: "2026-07-01T09:30:00.000Z",
      updatedAt: "2026-07-04T12:10:00.000Z"
    },
    {
      id: "assess-react-quiz",
      title: "React State & Effects Quiz",
      subject: "React + TypeScript Deep Dive",
      className: "Frontend Engineering - Cohort 4",
      type: "quiz",
      teacherId: "teacher-user-1",
      instructions: "Complete every question and submit your answers before the deadline.",
      dueAt: "2026-07-12T17:00",
      points: 50,
      status: "Published",
      assignmentScope: "selected_batch",
      assignedBatchIds: ["batch-frontend-4"],
      quizFileName: "react-state-quiz.xlsx",
      quizQuestions: [
        { id: "react-q1", prompt: "Which hook is intended for synchronizing with an external system?", options: ["useEffect", "useMemo", "useId", "useReducer"], answer: "useEffect", marks: 10, explanation: "Effects synchronize React with systems outside React." },
        { id: "react-q2", prompt: "What should be used to update state based on its previous value?", options: ["A functional updater", "A global variable", "A DOM query", "A ref callback"], answer: "A functional updater", marks: 10, explanation: "Functional updaters receive the latest queued state." },
        { id: "react-q3", prompt: "Which value should be included in an effect dependency array?", options: ["Every reactive value read by the effect", "Only props", "Only state", "No values"], answer: "Every reactive value read by the effect", marks: 15, explanation: "Dependencies describe all reactive values used by an effect." },
        { id: "react-q4", prompt: "What is the best default location for derived display data?", options: ["Calculate during render", "Duplicate it in state", "Store it globally", "Write it to localStorage"], answer: "Calculate during render", marks: 15, explanation: "Derived values usually do not need separate state." }
      ],
      assignedStudentIds: DEMO_STUDENTS.map((student) => student.id),
      createdAt: "2026-07-02T10:00:00.000Z",
      updatedAt: "2026-07-05T08:45:00.000Z"
    },
    {
      id: "assess-array-transform",
      title: "Transform Order Totals",
      subject: "JavaScript Foundations",
      className: "Frontend Engineering - Cohort 4",
      type: "coding",
      teacherId: "teacher-user-1",
      instructions: "Implement solve(numbers) so it returns the sum of all positive numbers. Ignore zero and negative values.",
      dueAt: "2026-07-15T20:00",
      points: 100,
      status: "Published",
      assignmentScope: "selected_students",
      assignedBatchIds: [],
      language: "javascript",
      starterCode: "function solve(numbers) {\n  // Write your solution here\n  return 0;\n}",
      testCases: [
        { id: "test-1", input: "[1, 2, 3]", expected: "6", hidden: false },
        { id: "test-2", input: "[-2, 5, 0, 7]", expected: "12", hidden: false },
        { id: "test-3", input: "[-4, -1]", expected: "0", hidden: true }
      ],
      assignedStudentIds: DEMO_STUDENTS.map((student) => student.id),
      createdAt: "2026-07-03T11:30:00.000Z",
      updatedAt: "2026-07-03T11:30:00.000Z"
    },
    {
      id: "assess-draft",
      title: "Database Indexing Notes",
      subject: "System Design Fundamentals",
      className: "Backend Engineering - Cohort 7",
      type: "file",
      teacherId: "teacher-user-1",
      instructions: "Explain when an index helps and when it can hurt write performance.",
      dueAt: "2026-07-18T18:00",
      points: 75,
      status: "Draft",
      assignmentScope: "entire_course",
      assignedBatchIds: [],
      allowedFileTypes: ["pdf", "docx"],
      attachmentName: "",
      assignedStudentIds: DEMO_STUDENTS.map((student) => student.id),
      createdAt: "2026-07-05T13:00:00.000Z",
      updatedAt: "2026-07-05T13:00:00.000Z"
    }
  ],
  submissions: [
    {
      id: "submission-api-aarav",
      assessmentId: "assess-api-design",
      studentId: "student-aarav",
      studentName: "Aarav Kumar",
      type: "file",
      fileName: "aarav-order-api.pdf",
      fileSize: "1.4 MB",
      note: "I included the controller contracts and validation flow.",
      submittedAt: "2026-07-05T14:20:00.000Z",
      status: "Graded",
      score: 86,
      feedback: "Strong endpoint design. Add an idempotency strategy for order creation.",
      gradedAt: "2026-07-06T08:10:00.000Z"
    },
    {
      id: "submission-api-priya",
      assessmentId: "assess-api-design",
      studentId: "student-priya",
      studentName: "Priya Sharma",
      type: "file",
      fileName: "priya-api-design.docx",
      fileSize: "820 KB",
      note: "Please review the error response section on page 4.",
      submittedAt: "2026-07-06T05:35:00.000Z",
      status: "Submitted",
      score: null,
      feedback: ""
    },
    {
      id: "submission-code-priya",
      assessmentId: "assess-array-transform",
      studentId: "student-priya",
      studentName: "Priya Sharma",
      type: "coding",
      code: "function solve(numbers) {\n  return numbers.filter(n => n > 0).reduce((sum, n) => sum + n, 0);\n}",
      language: "javascript",
      testResults: { passed: 3, total: 3 },
      submittedAt: "2026-07-05T16:40:00.000Z",
      status: "Submitted",
      score: null,
      feedback: ""
    }
  ],
  questions: [
    {
      id: "question-1",
      assessmentId: "assess-api-design",
      studentId: "student-aarav",
      studentName: "Aarav Kumar",
      text: "Should the architecture note include a database schema diagram?",
      answer: "A small diagram is welcome, but the endpoint and validation decisions matter most.",
      askedAt: "2026-07-04T10:15:00.000Z",
      answeredAt: "2026-07-04T11:05:00.000Z"
    },
    {
      id: "question-2",
      assessmentId: "assess-array-transform",
      studentId: "student-priya",
      studentName: "Priya Sharma",
      text: "Can we use Array.reduce in the solution?",
      answer: "",
      askedAt: "2026-07-06T06:30:00.000Z",
      answeredAt: ""
    }
  ]
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
