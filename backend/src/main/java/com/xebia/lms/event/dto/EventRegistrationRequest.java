package com.xebia.lms.event.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class EventRegistrationRequest {
    private UUID id; // Optional, can be provided by frontend

    @NotNull(message = "Event ID is required")
    private UUID eventId;

    @NotBlank(message = "Student ID is required")
    private String studentId;

    @NotBlank(message = "Student Name is required")
    private String studentName;

    @NotBlank(message = "Student Email is required")
    @Email(message = "Valid Student Email is required")
    private String studentEmail;
}
