package com.xebia.lms.course.dto;

import com.xebia.lms.course.CourseDifficulty;
import com.xebia.lms.course.CourseStatus;
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
public class CourseResponse {
    private UUID id;
    private UUID organizationId;
    private UUID categoryId;
    private UUID trainerId;
    private String courseCode;
    private String courseName;
    private String shortDescription;
    private int durationMinutes;
    private CourseDifficulty difficulty;
    private CourseStatus status;
    private String thumbnailUrl;
    private String metadata;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
