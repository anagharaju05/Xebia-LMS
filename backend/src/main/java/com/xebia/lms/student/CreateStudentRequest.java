package com.xebia.lms.student;

import lombok.Data;

@Data
public class CreateStudentRequest {
    private String name;
    private String email;
    private String cohort;
}
