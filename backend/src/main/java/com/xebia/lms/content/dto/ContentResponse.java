package com.xebia.lms.content.dto;

import com.xebia.lms.content.ContentType;
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
public class ContentResponse {
    private UUID id;
    private UUID submoduleId;
    private ContentType contentType;
    private String title;
    private String description;
    private String contentData;
    private String fileUrl;
    private String courseName; // Added to map course name in UI tables
    private int position;
    private int durationMinutes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
