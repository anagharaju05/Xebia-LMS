package com.xebia.lms.module.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleResponse {
    private UUID id;
    private UUID courseId;
    private String courseName; // Added to map course name in UI dropdowns
    private String name;
    private String description;
    private int position;
    private String metadata;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
