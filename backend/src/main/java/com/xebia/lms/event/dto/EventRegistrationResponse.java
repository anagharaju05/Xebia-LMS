package com.xebia.lms.event.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class EventRegistrationResponse {
    private UUID id;
    private UUID eventId;
    private String studentId;
    private String studentName;
    private String studentEmail;
    private LocalDateTime registeredAt;
    private String status;
    private String attendanceStatus;
    private Integer rating;
    private String feedbackText;
}
