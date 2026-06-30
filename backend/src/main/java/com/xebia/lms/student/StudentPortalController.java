package com.xebia.lms.student;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/portal/students/{studentId}")
@RequiredArgsConstructor
public class StudentPortalController {

    private final StudentPortalService service;

    @GetMapping("/state")
    public StudentStateDto getStudentState(@PathVariable UUID studentId) {
        return service.getStudentState(studentId);
    }

    @PostMapping("/lessons/{lessonId}/complete")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markLessonComplete(@PathVariable UUID studentId, @PathVariable String lessonId) {
        service.markLessonComplete(studentId, lessonId);
    }

    @PostMapping("/assessments/{assessmentId}/submit")
    public StudentAssessmentResult submitAssessment(@PathVariable UUID studentId, @PathVariable String assessmentId, @RequestBody SubmitAssessmentRequest request) {
        return service.submitAssessment(studentId, assessmentId, request.getAnswers());
    }

    @PostMapping("/notifications/{notificationId}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markNotificationRead(@PathVariable UUID studentId, @PathVariable String notificationId) {
        service.markNotificationRead(studentId, notificationId);
    }

    @PostMapping("/comments")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addComment(@PathVariable UUID studentId, @RequestBody Map<String, String> payload) {
        service.addComment(studentId, payload.get("lessonSlug"), payload.get("text"));
    }

    @PostMapping("/comments/{commentId}/replies")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addReply(@PathVariable UUID studentId, @PathVariable String commentId, @RequestBody Map<String, String> payload) {
        service.addReply(studentId, commentId, payload.get("text"));
    }

    @PostMapping("/feedback")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void submitFeedback(@PathVariable UUID studentId, @RequestBody SubmitFeedbackRequest request) {
        service.submitFeedback(studentId, request.getCourseId(), request.getRating(), request.getMessage());
    }

    @PostMapping("/tasks/{taskId}/submit")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void submitTask(@PathVariable UUID studentId, @PathVariable String taskId, @RequestBody Map<String, String> payload) {
        service.submitTask(studentId, taskId, payload.get("submission"));
    }
}
