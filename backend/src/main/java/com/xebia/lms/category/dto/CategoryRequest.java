package com.xebia.lms.category.dto;

import jakarta.validation.constraints.NotBlank;
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
public class CategoryRequest {
    
    private UUID parentCategoryId;

    @NotBlank(message = "Category name is required")
    @Size(max = 255, message = "Category name cannot exceed 255 characters")
    private String name;

    private String description;
}
