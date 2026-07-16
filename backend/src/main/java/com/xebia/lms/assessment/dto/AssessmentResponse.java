package com.xebia.lms.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentResponse {
    private UUID id;
    private UUID organizationId;
    private String title;
    private String subject;
    private String type;
    private String instructions;
    private LocalDateTime dueAt;
    private int points;
    private String assignmentScope;
    private String status;
    private String language;
    private String starterCode;
    private String quizFileName;
    private List<String> allowedFileTypes;
    private String attachmentName;
    private String className;
    private String teacherId;
    private List<AssessmentQuestionDto> quizQuestions;
    private List<TestCaseDto> testCases;
    private List<UUID> assignedBatchIds;
    private List<UUID> assignedStudentIds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
