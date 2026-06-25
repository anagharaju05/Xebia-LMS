package com.xebia.lms.content.dto;

import com.xebia.lms.content.ContentType;
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
public class ContentRequest {

    @NotNull(message = "Submodule ID is required")
    private UUID submoduleId;

    @NotNull(message = "Content type is required")
    private ContentType contentType;

    @NotBlank(message = "Content title is required")
    @Size(max = 255, message = "Content title cannot exceed 255 characters")
    private String title;

    private String description;

    private String contentData;

    private String fileUrl;

    private Integer durationMinutes;
}
