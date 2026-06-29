export const STUDENT_MANAGEMENT_KEY = "xebia-lms-student-management-v1";

export const INITIAL_STUDENT_MANAGEMENT = {
  students: [
    {
      id: "student-aarav",
      name: "Aarav Kumar",
      email: "student@xebia.com",
      cohort: "Backend Engineering",
      status: "Active",
      courseSlugs: [
        "spring-boot-masterclass",
        "react-typescript-deep-dive",
        "python-data-science-bootcamp",
        "system-design-fundamentals"
      ]
    },
    {
      id: "student-priya",
      name: "Priya Sharma",
      email: "priya.sharma@xebia.com",
      cohort: "Frontend Engineering",
      status: "Active",
      courseSlugs: ["react-typescript-deep-dive", "system-design-fundamentals"]
    },
    {
      id: "student-daniel",
      name: "Daniel Joseph",
      email: "daniel.joseph@xebia.com",
      cohort: "Data Academy",
      status: "Active",
      courseSlugs: ["python-data-science-bootcamp"]
    }
  ],
  assignments: [
    {
      id: "task-spring-api",
      studentId: "student-aarav",
      courseSlug: "spring-boot-masterclass",
      title: "Build a REST endpoint",
      instructions: "Create a Spring Boot endpoint with validation and explain the controller-service flow.",
      dueDate: "2026-07-05",
      status: "Assigned",
      submission: "",
      submittedAt: "",
      score: "",
      reviewNotes: ""
    },
    {
      id: "task-react-state",
      studentId: "student-priya",
      courseSlug: "react-typescript-deep-dive",
      title: "Model a reusable state flow",
      instructions: "Describe the component boundary, events, loading state, and failure state.",
      dueDate: "2026-07-02",
      status: "Submitted",
      submission: "I separated server state from local form state and documented loading, success, and retry transitions.",
      submittedAt: "Jun 29, 2026, 11:15 AM",
      score: "",
      reviewNotes: ""
    },
    {
      id: "task-data-cleaning",
      studentId: "student-daniel",
      courseSlug: "python-data-science-bootcamp",
      title: "Clean a sample dataset",
      instructions: "Explain how you handled missing values, duplicates, and invalid date values.",
      dueDate: "2026-06-28",
      status: "Reviewed",
      submission: "Used fillna for numeric medians, removed duplicate identifiers, and normalized date parsing.",
      submittedAt: "Jun 28, 2026, 3:40 PM",
      score: 88,
      reviewNotes: "Clear approach. Add a validation summary before exporting the cleaned dataset."
    }
  ]
};
