package com.xebia.lms.assessment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class AssessmentRequest {
    private UUID id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Type is required")
    private String type;

    @NotBlank(message = "Instructions are required")
    private String instructions;

    private LocalDateTime dueAt;

    private int points;

    @NotBlank(message = "Assignment scope is required")
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
}
