package com.xebia.lms.student;

import lombok.Data;
import java.util.Map;

@Data
public class SubmitAssessmentRequest {
    private Map<String, String> answers;
}
