export const BATCH_STORAGE_KEY = "xebia-lms-batch-workspace-v1";

export const BATCH_STUDENTS = [
  { id: "student-aarav", name: "Aarav Kumar", email: "student@xebia.com", department: "Engineering" },
  { id: "student-priya", name: "Priya Sharma", email: "priya.sharma@xebia.com", department: "Engineering" },
  { id: "student-daniel", name: "Daniel Joseph", email: "daniel.joseph@xebia.com", department: "Data" }
];

export const INITIAL_BATCH_STATE = {
  batches: [
    {
      id: "batch-backend-7", name: "Backend Engineering - Cohort 7", subject: "Backend Engineering",
      department: "Technology", semester: "Semester 2", year: "2026", description: "Production-ready Java, Spring Boot, API design, and system design.",
      capacity: 32, teacher: "Meera Thomas", status: "Active", joinCode: "BE7-X26", joinCodeEnabled: true,
      studentIds: ["student-aarav", "student-daniel"], subjectIds: ["subject-java", "subject-spring", "subject-system"],
      completion: 68, averageQuiz: 78, averageAssignment: 82, attendance: 91, pendingAssignments: 3
    },
    {
      id: "batch-frontend-4", name: "Frontend Engineering - Cohort 4", subject: "Frontend Engineering",
      department: "Technology", semester: "Semester 1", year: "2026", description: "Modern React, TypeScript, accessible UI, and product engineering practices.",
      capacity: 28, teacher: "Meera Thomas", status: "Active", joinCode: "FE4-R8K", joinCodeEnabled: true,
      studentIds: ["student-priya"], subjectIds: ["subject-react", "subject-typescript", "subject-system"],
      completion: 74, averageQuiz: 84, averageAssignment: 80, attendance: 94, pendingAssignments: 2
    },
    {
      id: "batch-data-3", name: "Data Academy - Cohort 3", subject: "Data & AI",
      department: "Data Science", semester: "Semester 2", year: "2026", description: "Python, analytics, machine learning, and practical model evaluation.",
      capacity: 24, teacher: "Meera Thomas", status: "Archived", joinCode: "DA3-M42", joinCodeEnabled: false,
      studentIds: [], subjectIds: ["subject-python", "subject-ml"], completion: 100, averageQuiz: 81,
      averageAssignment: 86, attendance: 93, pendingAssignments: 0
    }
  ],
  subjects: [
    { id: "subject-java", name: "Java", description: "Core Java, collections, streams, and testing.", color: "#6C1D5F", lessons: 18, assignments: 4, quizzes: 3, files: 12, liveSessions: 5, assignedBatchIds: ["batch-backend-7"] },
    { id: "subject-spring", name: "Spring Boot", description: "REST APIs, persistence, validation, and security.", color: "#01AC9F", lessons: 24, assignments: 6, quizzes: 4, files: 15, liveSessions: 6, assignedBatchIds: ["batch-backend-7"] },
    { id: "subject-react", name: "React", description: "Components, hooks, state, accessibility, and performance.", color: "#84117C", lessons: 20, assignments: 5, quizzes: 4, files: 10, liveSessions: 5, assignedBatchIds: ["batch-frontend-4"] },
    { id: "subject-typescript", name: "TypeScript", description: "Types, generics, narrowing, and application architecture.", color: "#5276b8", lessons: 14, assignments: 4, quizzes: 3, files: 8, liveSessions: 4, assignedBatchIds: ["batch-frontend-4"] },
    { id: "subject-python", name: "Python", description: "Python foundations for data analysis and automation.", color: "#FF6200", lessons: 22, assignments: 5, quizzes: 4, files: 14, liveSessions: 5, assignedBatchIds: ["batch-data-3"] },
    { id: "subject-ml", name: "Machine Learning", description: "Model training, evaluation, and responsible ML.", color: "#368b80", lessons: 16, assignments: 4, quizzes: 3, files: 11, liveSessions: 4, assignedBatchIds: ["batch-data-3"] },
    { id: "subject-system", name: "System Design", description: "Scalable services, messaging, caching, and reliability.", color: "#4A1E47", lessons: 12, assignments: 3, quizzes: 2, files: 9, liveSessions: 3, assignedBatchIds: ["batch-backend-7", "batch-frontend-4"] }
  ],
  announcements: [
    { id: "announcement-1", batchId: "batch-backend-7", title: "API review session moved", message: "Wednesday's review starts at 3:00 PM. Bring your endpoint diagrams.", author: "Meera Thomas", createdAt: "2026-07-06T07:30:00.000Z" },
    { id: "announcement-2", batchId: "batch-frontend-4", title: "React lab resources", message: "The component architecture worksheet is available in study materials.", author: "Meera Thomas", createdAt: "2026-07-05T12:10:00.000Z" }
  ],
  attendance: [
    { id: "attendance-1", batchId: "batch-backend-7", date: "2026-07-06", subjectId: "subject-spring", statuses: { "student-aarav": "Present", "student-daniel": "Absent" } },
    { id: "attendance-2", batchId: "batch-backend-7", date: "2026-07-03", subjectId: "subject-java", statuses: { "student-aarav": "Present", "student-daniel": "Present" } },
    { id: "attendance-3", batchId: "batch-frontend-4", date: "2026-07-06", subjectId: "subject-react", statuses: { "student-priya": "Present" } }
  ],
  discussions: [
    { id: "discussion-1", batchId: "batch-backend-7", subjectId: "subject-spring", authorId: "student-aarav", author: "Aarav Kumar", role: "Student", title: "Validation at controller or service layer?", body: "Where should cross-field validation live when it also needs database state?", pinned: true, createdAt: "2026-07-05T10:20:00.000Z", replies: [{ id: "reply-1", author: "Meera Thomas", role: "Teacher", text: "Keep request-shape validation at the boundary and business invariants in the service.", createdAt: "2026-07-05T11:00:00.000Z" }] },
    { id: "discussion-2", batchId: "batch-frontend-4", subjectId: "subject-react", authorId: "student-priya", author: "Priya Sharma", role: "Student", title: "When should state move into context?", body: "Is prop drilling through two levels enough reason to use context?", pinned: false, createdAt: "2026-07-06T06:40:00.000Z", replies: [] }
  ],
  sessions: [
    { id: "session-1", batchId: "batch-backend-7", subjectId: "subject-spring", title: "Spring Security Workshop", startAt: "2026-07-08T15:00", duration: "75 min" },
    { id: "session-2", batchId: "batch-frontend-4", subjectId: "subject-react", title: "State Modelling Lab", startAt: "2026-07-09T11:00", duration: "60 min" },
    { id: "session-3", batchId: "batch-backend-7", subjectId: "subject-system", title: "System Design Office Hours", startAt: "2026-07-13T16:00", duration: "45 min" }
  ]
};

export function blankBatch(teacher = "Meera Thomas") {
  return { id: "", name: "", subject: "", department: "Technology", semester: "Semester 1", year: "2026", description: "", capacity: 30, teacher, status: "Active", joinCode: "", joinCodeEnabled: true, studentIds: [], subjectIds: [], completion: 0, averageQuiz: 0, averageAssignment: 0, attendance: 0, pendingAssignments: 0 };
}

export function blankSubject() {
  return { id: "", name: "", description: "", color: "#6C1D5F", lessons: 0, assignments: 0, quizzes: 0, files: 0, liveSessions: 0, assignedBatchIds: [] };
}
