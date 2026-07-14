package com.xebia.lms.event;

import com.xebia.lms.event.dto.EventRegistrationRequest;
import com.xebia.lms.event.dto.EventRegistrationResponse;

import java.util.List;
import java.util.UUID;

public interface EventRegistrationService {
    EventRegistrationResponse registerStudent(EventRegistrationRequest request);
    void unregisterStudent(UUID registrationId);
    List<EventRegistrationResponse> getAllRegistrations();
    List<EventRegistrationResponse> getRegistrationsForEvent(UUID eventId);
    void markAttendance(UUID registrationId, String status);
    void submitFeedback(UUID registrationId, Integer rating, String feedbackText);
}
