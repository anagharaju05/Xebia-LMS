package com.xebia.lms.student;

import lombok.Data;
import java.util.UUID;

@Data
public class StudentAssignmentDto {
    private String id;
    private UUID studentId;
    private String courseSlug;
    private String title;
    private String instructions;
    private String dueDate;
    private String status;
    private String submission;
    private String submittedAt;
    private Integer score;
    private String reviewNotes;
}
