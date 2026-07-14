package com.xebia.lms.event;

import com.xebia.lms.exception.ResourceNotFoundException;
import com.xebia.lms.security.TenantContext;
import com.xebia.lms.event.dto.EventRegistrationRequest;
import com.xebia.lms.event.dto.EventRegistrationResponse;
import com.xebia.lms.event.mapper.EventRegistrationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventRegistrationServiceImpl implements EventRegistrationService {

    private final EventRegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationMapper registrationMapper;

    @Override
    @Transactional
    public EventRegistrationResponse registerStudent(EventRegistrationRequest request) {
        UUID orgId = TenantContext.getCurrentTenant();

        // Check if event exists
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + request.getEventId()));

        if (!event.getOrganizationId().equals(orgId)) {
            throw new ResourceNotFoundException("Event not found with id: " + request.getEventId());
        }

        // Check if already registered
        boolean exists = registrationRepository.existsByOrganizationIdAndEventIdAndStudentEmail(
                orgId, request.getEventId(), request.getStudentEmail());

        if (exists) {
            throw new IllegalArgumentException("Student is already registered for this event.");
        }

        // Handle capacity and waitlist
        String status = "REGISTERED";
        if (event.getMaxCapacity() != null && event.getMaxCapacity() > 0) {
            Integer currentRegistrations = registrationRepository.countByOrganizationIdAndEventIdAndStatus(orgId, request.getEventId(), "REGISTERED");
            if (currentRegistrations >= event.getMaxCapacity()) {
                status = "WAITLISTED";
            }
        }

        EventRegistration registration = EventRegistration.builder()
                .id(request.getId() != null ? request.getId() : UUID.randomUUID())
                .organizationId(orgId)
                .eventId(request.getEventId())
                .studentId(request.getStudentId())
                .studentName(request.getStudentName())
                .studentEmail(request.getStudentEmail())
                .registeredAt(LocalDateTime.now())
                .status(status)
                .attendanceStatus("PENDING")
                .build();

        EventRegistration savedRegistration = registrationRepository.save(registration);
        return registrationMapper.toResponse(savedRegistration);
    }

    @Override
    @Transactional
    public void unregisterStudent(UUID registrationId) {
        UUID orgId = TenantContext.getCurrentTenant();
        
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found with id: " + registrationId));

        if (!registration.getOrganizationId().equals(orgId)) {
            throw new ResourceNotFoundException("Registration not found with id: " + registrationId);
        }

        String previousStatus = registration.getStatus();
        UUID eventId = registration.getEventId();
        
        registrationRepository.delete(registration);

        // If the unregistered student was taking up a spot, promote the next waitlisted student
        if ("REGISTERED".equals(previousStatus)) {
            registrationRepository.findFirstByOrganizationIdAndEventIdAndStatusOrderByRegisteredAtAsc(orgId, eventId, "WAITLISTED")
                    .ifPresent(nextReg -> {
                        nextReg.setStatus("REGISTERED");
                        registrationRepository.save(nextReg);
                    });
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventRegistrationResponse> getAllRegistrations() {
        UUID orgId = TenantContext.getCurrentTenant();
        List<EventRegistration> registrations = registrationRepository.findAllByOrganizationId(orgId);
        return registrationMapper.toResponseList(registrations);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventRegistrationResponse> getRegistrationsForEvent(UUID eventId) {
        UUID orgId = TenantContext.getCurrentTenant();
        List<EventRegistration> registrations = registrationRepository.findAllByOrganizationIdAndEventId(orgId, eventId);
        return registrationMapper.toResponseList(registrations);
    }
    @Override
    @Transactional
    public void markAttendance(UUID registrationId, String status) {
        UUID orgId = TenantContext.getCurrentTenant();
        EventRegistration registration = registrationRepository.findById(registrationId).orElse(null);
        if (registration == null || !registration.getOrganizationId().equals(orgId)) {
            throw new ResourceNotFoundException("Registration not found with id: " + registrationId);
        }
        registration.setAttendanceStatus(status);
        registrationRepository.save(registration);
    }

    @Override
    @Transactional
    public void submitFeedback(UUID registrationId, Integer rating, String feedbackText) {
        UUID orgId = TenantContext.getCurrentTenant();
        EventRegistration registration = registrationRepository.findById(registrationId).orElse(null);
        if (registration == null || !registration.getOrganizationId().equals(orgId)) {
            throw new ResourceNotFoundException("Registration not found with id: " + registrationId);
        }
        registration.setRating(rating);
        registration.setFeedbackText(feedbackText);
        registrationRepository.save(registration);
    }
}
