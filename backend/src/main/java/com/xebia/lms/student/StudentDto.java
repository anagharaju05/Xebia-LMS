package com.xebia.lms.student;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class StudentDto {
    private UUID id;
    private String name;
    private String email;
    private String cohort;
    private String status;
    private List<String> courseSlugs;
}
