package com.xebia.lms.student;

import lombok.Data;

@Data
public class ReviewAssignmentRequest {
    private Integer score;
    private String notes;
}
