package com.xebia.lms.submodule.dto;

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
public class SubmoduleRequest {

    private UUID id;

    @NotNull(message = "Module ID is required")
    private UUID moduleId;

    @NotBlank(message = "Submodule name is required")
    @Size(max = 255, message = "Submodule name cannot exceed 255 characters")
    private String name;

    private String description;

    private String metadata;
}
