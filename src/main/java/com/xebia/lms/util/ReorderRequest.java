package com.xebia.lms.util;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReorderRequest {

    @NotEmpty(message = "The list of IDs to reorder must not be empty")
    private List<UUID> ids;
}
