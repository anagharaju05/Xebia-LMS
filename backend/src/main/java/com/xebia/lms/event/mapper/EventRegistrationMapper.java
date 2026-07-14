package com.xebia.lms.event.mapper;

import com.xebia.lms.event.EventRegistration;
import com.xebia.lms.event.dto.EventRegistrationResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class EventRegistrationMapper {

    public EventRegistrationResponse toResponse(EventRegistration registration) {
        if (registration == null) {
            return null;
        }

        return EventRegistrationResponse.builder()
                .id(registration.getId())
                .eventId(registration.getEventId())
                .studentId(registration.getStudentId())
                .studentName(registration.getStudentName())
                .studentEmail(registration.getStudentEmail())
                .registeredAt(registration.getRegisteredAt())
                .status(registration.getStatus())
                .attendanceStatus(registration.getAttendanceStatus())
                .rating(registration.getRating())
                .feedbackText(registration.getFeedbackText())
                .build();
    }

    public List<EventRegistrationResponse> toResponseList(List<EventRegistration> registrations) {
        if (registrations == null) {
            return null;
        }
        return registrations.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
