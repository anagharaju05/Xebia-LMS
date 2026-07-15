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
    private Map<String, Object> nextLiveSession;
    private List<Map<String, String>> recentActivity;
    private Map<String, Object> learningStreak;
    private List<String> recommendedCourses;
    private Map<String, Object> weeklyLearning;
    private Integer assessmentAverage;
}
