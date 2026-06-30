package com.xebia.lms.student;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class StudentStateDto {
    private List<String> completedLessonIds;
    private Map<String, StudentAssessmentResult> assessmentResults;
    private List<StudentNotification> notifications;
    private List<LessonComment> comments;
    private List<StudentFeedback> feedback;
}
