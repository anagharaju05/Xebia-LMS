package com.xebia.lms.student;

import java.util.UUID;
import java.util.Map;

public interface StudentPortalService {
    StudentStateDto getStudentState(UUID studentId);
    void markLessonComplete(UUID studentId, String lessonId);
    StudentAssessmentResult submitAssessment(UUID studentId, String assessmentId, Map<String, String> answers);
    void markNotificationRead(UUID studentId, String notificationId);
    void addComment(UUID studentId, String lessonSlug, String text);
    void addReply(UUID studentId, String commentId, String text);
    void submitFeedback(UUID studentId, String courseId, Integer rating, String message);
    void submitTask(UUID studentId, String taskId, String submission);
}
