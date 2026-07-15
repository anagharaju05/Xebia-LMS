export const STUDENT_STORAGE_KEY = "xebia-lms-student-state-v1";

export const ASSESSMENTS = [
  {
    id: "assessment-spring-theory",
    courseSlug: "spring-boot-masterclass",
    title: "Spring Boot Foundations",
    description: "Check your understanding of dependency injection and application setup.",
    duration: "15 minutes",
    questions: [
      {
        id: "q1",
        prompt: "Which annotation starts a Spring Boot application?",
        options: ["@SpringBootApplication", "@RestController", "@Bean", "@Entity"],
        answer: "@SpringBootApplication"
      },
      {
        id: "q2",
        prompt: "What is the main purpose of dependency injection?",
        options: ["Reduce coupling", "Create database tables", "Compile Java", "Serve static files"],
        answer: "Reduce coupling"
      }
    ]
  },
  {
    id: "assessment-react-practical",
    courseSlug: "react-typescript-deep-dive",
    title: "Component Design Exercise",
    description: "Describe a reusable component boundary and its state model.",
    duration: "30 minutes",
    practical: true
  },
  {
    id: "assessment-data-theory",
    courseSlug: "python-data-science-bootcamp",
    title: "Data Analysis Checkpoint",
    description: "A short knowledge check for data cleaning and visualization.",
    duration: "12 minutes",
    questions: [
      {
        id: "q1",
        prompt: "Which operation handles missing values?",
        options: ["fillna", "groupby", "plot", "merge"],
        answer: "fillna"
      }
    ]
  }
];

export const INITIAL_NOTIFICATIONS = [];

export const INITIAL_COMMENTS = [
  {
    id: "comment-1",
    lessonSlug: "what-is-spring-boot",
    author: "Meera S.",
    role: "Trainer",
    text: "Use this thread for questions about the lesson or examples.",
    createdAt: "Today, 9:10 AM",
    replies: []
  }
];
