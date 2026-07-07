package com.xebia.lms.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentQuestionDto {
    private UUID id;
    private String prompt;
    private List<String> options;
    private String answer;
    private int marks;
    private String explanation;
}
