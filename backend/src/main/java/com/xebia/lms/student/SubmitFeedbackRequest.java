package com.xebia.lms.student;

import lombok.Data;

@Data
public class SubmitFeedbackRequest {
    private String courseId;
    private Integer rating;
    private String message;
}
