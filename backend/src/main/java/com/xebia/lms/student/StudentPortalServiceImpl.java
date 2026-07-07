package com.xebia.lms.student;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class StudentPortalServiceImpl implements StudentPortalService {

    private final StudentRepository studentRepository;
    private final StudentAssessmentResultRepository assessmentResultRepository;
    private final StudentNotificationRepository notificationRepository;
    private final LessonCommentRepository commentRepository;
    private final LessonCommentReplyRepository replyRepository;
    private final StudentFeedbackRepository feedbackRepository;
    private final StudentAssignmentRepository assignmentRepository;
    private final com.xebia.lms.assessment.AssessmentRepository assessmentRepository;

    @Override
    public StudentStateDto getStudentState(UUID studentId) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        StudentStateDto state = new StudentStateDto();
        
        state.setCompletedLessonIds(List.copyOf(student.getCompletedLessonIds()));
        
        Map<String, StudentAssessmentResult> resultsMap = assessmentResultRepository.findAllByStudentId(studentId)
                .stream().collect(Collectors.toMap(StudentAssessmentResult::getAssessmentId, r -> r));
        state.setAssessmentResults(resultsMap);
        
        state.setNotifications(notificationRepository.findAllByStudentId(studentId));
        state.setFeedback(feedbackRepository.findAllByStudentId(studentId));
        
        // Fetch all comments (for simplicity fetching all, ideally filter by active lessons)
        state.setComments(commentRepository.findAll());
        
        return state;
    }

    @Override
    @Transactional
    public void markLessonComplete(UUID studentId, String lessonId) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        student.getCompletedLessonIds().add(lessonId);
        studentRepository.save(student);
    }

    @Override
    @Transactional
    public StudentAssessmentResult submitAssessment(UUID studentId, String assessmentId, Map<String, String> answers) {
        StudentAssessmentResult result = new StudentAssessmentResult();
        result.setStudentId(studentId);
        result.setAssessmentId(assessmentId);
        
        // Very basic mock calculation, real logic would grade against real assessment questions.
        // Assuming 'practical' if answers has 'practical' key, else multiple choice.
        if (answers.containsKey("practical")) {
            result.setStatus("Submitted for review");
        } else {
            result.setStatus("Completed");
            result.setScore(100); // Mock score 100%
        }
        result.setSubmittedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM d, yyyy, h:mm a")));
        return assessmentResultRepository.save(result);
    }

    @Override
    @Transactional
    public void markNotificationRead(UUID studentId, String notificationId) {
        StudentNotification notification = notificationRepository.findById(notificationId).orElseThrow();
        if (notification.getStudentId().equals(studentId)) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    @Override
    @Transactional
    public void addComment(UUID studentId, String lessonSlug, String text) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        LessonComment comment = new LessonComment();
        comment.setId("comment-" + UUID.randomUUID().toString().substring(0, 8));
        comment.setLessonSlug(lessonSlug);
        comment.setAuthorName(student.getName());
        comment.setRole("Student");
        comment.setText(text);
        comment.setCreatedAtStr("Just now");
        commentRepository.save(comment);
    }

    @Override
    @Transactional
    public void addReply(UUID studentId, String commentId, String text) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        LessonComment comment = commentRepository.findById(commentId).orElseThrow();
        
        LessonCommentReply reply = new LessonCommentReply();
        reply.setId("reply-" + UUID.randomUUID().toString().substring(0, 8));
        reply.setComment(comment);
        reply.setAuthorName(student.getName());
        reply.setRole("Student");
        reply.setText(text);
        reply.setCreatedAtStr("Just now");
        replyRepository.save(reply);
    }

    @Override
    @Transactional
    public void submitFeedback(UUID studentId, String courseId, Integer rating, String message) {
        StudentFeedback feedback = new StudentFeedback();
        feedback.setId("feedback-" + UUID.randomUUID().toString().substring(0, 8));
        feedback.setStudentId(studentId);
        feedback.setCourseId(courseId);
        feedback.setRating(rating);
        feedback.setMessage(message);
        feedback.setSubmittedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM d, yyyy, h:mm a")));
        feedbackRepository.save(feedback);
    }

    @Override
    @Transactional
    public void submitTask(UUID studentId, String taskId, String submission) {
        StudentAssignment assignment = assignmentRepository.findById(taskId)
                .orElseGet(() -> {
                    StudentAssignment newAssignment = new StudentAssignment();
                    newAssignment.setId(taskId);
                    newAssignment.setStudentId(studentId);
                    
                    // Attempt to parse assessmentId from composite taskId (studentId-assessmentId)
                    try {
                        String[] parts = taskId.split("-");
                        if (parts.length >= 10) {
                            String uuidStr = String.join("-", java.util.Arrays.copyOfRange(parts, 5, 10));
                            UUID assessmentId = java.util.UUID.fromString(uuidStr);
                            assessmentRepository.findById(assessmentId).ifPresent(a -> {
                                newAssignment.setTitle(a.getTitle());
                                newAssignment.setCourseSlug(a.getSubject().toLowerCase().replace(" ", "-"));
                            });
                        }
                    } catch (Exception e) {
                        // ignore
                    }
                    
                    if (newAssignment.getTitle() == null) {
                        newAssignment.setTitle("Course Assessment");
                        newAssignment.setCourseSlug("general");
                    }
                    
                    return newAssignment;
                });

        if (assignment.getStudentId().equals(studentId)) {
            assignment.setSubmission(submission);
            assignment.setStatus("Submitted");
            assignment.setSubmittedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM d, yyyy, h:mm a")));
            
            // Try to extract auto-graded score and status from JSON payload
            try {
                if (submission != null && submission.contains("\"score\":")) {
                    com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    com.fasterxml.jackson.databind.JsonNode node = objectMapper.readTree(submission);
                    if (node.has("score")) {
                        assignment.setScore(node.get("score").asInt());
                        if (node.has("type") && "quiz".equals(node.get("type").asText())) {
                            assignment.setStatus("Graded");
                        }
                    }
                }
            } catch (Exception e) {
                // ignore
            }
            
            assignmentRepository.save(assignment);
        }
    }
}
