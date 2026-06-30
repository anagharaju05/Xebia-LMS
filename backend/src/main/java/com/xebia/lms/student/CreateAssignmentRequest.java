package com.xebia.lms.student;

import lombok.Data;
import java.util.UUID;

@Data
public class CreateAssignmentRequest {
    private UUID studentId;
    private String courseSlug;
    private String title;
    private String instructions;
    private String dueDate;
}
