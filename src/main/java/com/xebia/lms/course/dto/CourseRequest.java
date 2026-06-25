package com.xebia.lms.course.dto;

import com.xebia.lms.course.CourseDifficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseRequest {

    @NotNull(message = "Category ID is required")
    private UUID categoryId;

    @NotNull(message = "Trainer ID is required")
    private UUID trainerId;

    @NotBlank(message = "Course code is required")
    @Size(max = 100, message = "Course code cannot exceed 100 characters")
    private String courseCode;

    @NotBlank(message = "Course name is required")
    @Size(max = 255, message = "Course name cannot exceed 255 characters")
    private String courseName;

    private String shortDescription;

    @NotNull(message = "Difficulty level is required")
    private CourseDifficulty difficulty;

    private String thumbnailUrl;
}
