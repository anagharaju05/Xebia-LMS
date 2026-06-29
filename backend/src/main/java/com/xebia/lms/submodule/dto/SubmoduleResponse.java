package com.xebia.lms.submodule.dto;

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
public class SubmoduleResponse {
    private UUID id;
    private UUID moduleId;
    private String name;
    private String description;
    private int position;
    private String metadata;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
