package com.xebia.lms.batch;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class BatchDataInitializer implements CommandLineRunner {

    private final BatchRepository batchRepo;
    private final BatchSubjectRepository subjectRepo;
    private final BatchAnnouncementRepository announcementRepo;
    private final BatchAttendanceRepository attendanceRepo;
    private final BatchDiscussionRepository discussionRepo;
    private final BatchSessionRepository sessionRepo;

    @Override
    public void run(String... args) throws Exception {
        if (batchRepo.count() == 0) {
            System.out.println("Initializing Batch Mock Data...");

            Batch b1 = Batch.builder().id("batch-backend-7").name("Backend Engineering - Cohort 7").subject("Backend Engineering")
                    .department("Technology").semester("Semester 2").year("2026").description("Production-ready Java, Spring Boot, API design, and system design.")
                    .capacity(32).teacher("Meera Thomas").status("Active").joinCode("BE7-X26").joinCodeEnabled(true)
                    .studentIds(List.of("student-aarav", "student-daniel")).subjectIds(List.of("subject-java", "subject-spring", "subject-system"))
                    .completion(68).averageQuiz(78).averageAssignment(82).attendance(91).pendingAssignments(3).build();

            Batch b2 = Batch.builder().id("batch-frontend-4").name("Frontend Engineering - Cohort 4").subject("Frontend Engineering")
                    .department("Technology").semester("Semester 1").year("2026").description("Modern React, TypeScript, accessible UI, and product engineering practices.")
                    .capacity(28).teacher("Meera Thomas").status("Active").joinCode("FE4-R8K").joinCodeEnabled(true)
                    .studentIds(List.of("student-priya")).subjectIds(List.of("subject-react", "subject-typescript", "subject-system"))
                    .completion(74).averageQuiz(84).averageAssignment(80).attendance(94).pendingAssignments(2).build();

            Batch b3 = Batch.builder().id("batch-data-3").name("Data Academy - Cohort 3").subject("Data & AI")
                    .department("Data Science").semester("Semester 2").year("2026").description("Python, analytics, machine learning, and practical model evaluation.")
                    .capacity(24).teacher("Meera Thomas").status("Archived").joinCode("DA3-M42").joinCodeEnabled(false)
                    .studentIds(List.of()).subjectIds(List.of("subject-python", "subject-ml"))
                    .completion(100).averageQuiz(81).averageAssignment(86).attendance(93).pendingAssignments(0).build();

            batchRepo.saveAll(List.of(b1, b2, b3));

            BatchSubject s1 = BatchSubject.builder().id("subject-java").name("Java").description("Core Java, collections, streams, and testing.").color("#6C1D5F").lessons(18).assignments(4).quizzes(3).files(12).liveSessions(5).assignedBatchIds(List.of("batch-backend-7")).build();
            BatchSubject s2 = BatchSubject.builder().id("subject-spring").name("Spring Boot").description("REST APIs, persistence, validation, and security.").color("#01AC9F").lessons(24).assignments(6).quizzes(4).files(15).liveSessions(6).assignedBatchIds(List.of("batch-backend-7")).build();
            BatchSubject s3 = BatchSubject.builder().id("subject-react").name("React").description("Components, hooks, state, accessibility, and performance.").color("#84117C").lessons(20).assignments(5).quizzes(4).files(10).liveSessions(5).assignedBatchIds(List.of("batch-frontend-4")).build();
            BatchSubject s4 = BatchSubject.builder().id("subject-typescript").name("TypeScript").description("Types, generics, narrowing, and application architecture.").color("#5276b8").lessons(14).assignments(4).quizzes(3).files(8).liveSessions(4).assignedBatchIds(List.of("batch-frontend-4")).build();
            BatchSubject s5 = BatchSubject.builder().id("subject-python").name("Python").description("Python foundations for data analysis and automation.").color("#FF6200").lessons(22).assignments(5).quizzes(4).files(14).liveSessions(5).assignedBatchIds(List.of("batch-data-3")).build();
            BatchSubject s6 = BatchSubject.builder().id("subject-ml").name("Machine Learning").description("Model training, evaluation, and responsible ML.").color("#368b80").lessons(16).assignments(4).quizzes(3).files(11).liveSessions(4).assignedBatchIds(List.of("batch-data-3")).build();
            BatchSubject s7 = BatchSubject.builder().id("subject-system").name("System Design").description("Scalable services, messaging, caching, and reliability.").color("#4A1E47").lessons(12).assignments(3).quizzes(2).files(9).liveSessions(3).assignedBatchIds(List.of("batch-backend-7", "batch-frontend-4")).build();

            subjectRepo.saveAll(List.of(s1, s2, s3, s4, s5, s6, s7));

            BatchAnnouncement a1 = BatchAnnouncement.builder().id("announcement-1").batchId("batch-backend-7").title("API review session moved").message("Wednesday's review starts at 3:00 PM. Bring your endpoint diagrams.").author("Meera Thomas").createdAt("2026-07-06T07:30:00.000Z").build();
            BatchAnnouncement a2 = BatchAnnouncement.builder().id("announcement-2").batchId("batch-frontend-4").title("React lab resources").message("The component architecture worksheet is available in study materials.").author("Meera Thomas").createdAt("2026-07-05T12:10:00.000Z").build();

            announcementRepo.saveAll(List.of(a1, a2));

            BatchAttendance at1 = BatchAttendance.builder().id("attendance-1").batchId("batch-backend-7").date("2026-07-06").subjectId("subject-spring").statuses(Map.of("student-aarav", "Present", "student-daniel", "Absent")).build();
            BatchAttendance at2 = BatchAttendance.builder().id("attendance-2").batchId("batch-backend-7").date("2026-07-03").subjectId("subject-java").statuses(Map.of("student-aarav", "Present", "student-daniel", "Present")).build();
            BatchAttendance at3 = BatchAttendance.builder().id("attendance-3").batchId("batch-frontend-4").date("2026-07-06").subjectId("subject-react").statuses(Map.of("student-priya", "Present")).build();

            attendanceRepo.saveAll(List.of(at1, at2, at3));

            BatchDiscussionReply r1 = BatchDiscussionReply.builder().id("reply-1").author("Meera Thomas").role("Teacher").text("Keep request-shape validation at the boundary and business invariants in the service.").createdAt("2026-07-05T11:00:00.000Z").build();

            BatchDiscussion d1 = BatchDiscussion.builder().id("discussion-1").batchId("batch-backend-7").subjectId("subject-spring").authorId("student-aarav").author("Aarav Kumar").role("Student").title("Validation at controller or service layer?").body("Where should cross-field validation live when it also needs database state?").pinned(true).createdAt("2026-07-05T10:20:00.000Z").replies(List.of(r1)).build();
            BatchDiscussion d2 = BatchDiscussion.builder().id("discussion-2").batchId("batch-frontend-4").subjectId("subject-react").authorId("student-priya").author("Priya Sharma").role("Student").title("When should state move into context?").body("Is prop drilling through two levels enough reason to use context?").pinned(false).createdAt("2026-07-06T06:40:00.000Z").replies(List.of()).build();

            discussionRepo.saveAll(List.of(d1, d2));

            BatchSession se1 = BatchSession.builder().id("session-1").batchId("batch-backend-7").subjectId("subject-spring").title("Spring Security Workshop").startAt("2026-07-08T15:00").duration("75 min").build();
            BatchSession se2 = BatchSession.builder().id("session-2").batchId("batch-frontend-4").subjectId("subject-react").title("State Modelling Lab").startAt("2026-07-09T11:00").duration("60 min").build();
            BatchSession se3 = BatchSession.builder().id("session-3").batchId("batch-backend-7").subjectId("subject-system").title("System Design Office Hours").startAt("2026-07-13T16:00").duration("45 min").build();

            sessionRepo.saveAll(List.of(se1, se2, se3));

            System.out.println("Batch Mock Data Initialization Complete!");
        }
    }
}
