package com.xebia.lms.event;

import com.xebia.lms.event.dto.EventRegistrationRequest;
import com.xebia.lms.event.dto.EventRegistrationResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/event-registrations")
@RequiredArgsConstructor
@Tag(name = "Event Registrations", description = "Endpoints for managing student event registrations")
public class EventRegistrationController {

    private final EventRegistrationService registrationService;

    @PostMapping
    @Operation(summary = "Register for an event", description = "Allows a student to register for a specific event.")
    public ResponseEntity<EventRegistrationResponse> registerStudent(@Valid @RequestBody EventRegistrationRequest request) {
        EventRegistrationResponse response = registrationService.registerStudent(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel registration", description = "Allows a student or admin to cancel an event registration.")
    public ResponseEntity<Void> unregisterStudent(@PathVariable UUID id) {
        registrationService.unregisterStudent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "Get all registrations", description = "Retrieves all event registrations for the organization.")
    public ResponseEntity<List<EventRegistrationResponse>> getAllRegistrations() {
        return ResponseEntity.ok(registrationService.getAllRegistrations());
    }

    @GetMapping("/event/{eventId}")
    @Operation(summary = "Get registrations for event", description = "Retrieves all registrations for a specific event.")
    public ResponseEntity<List<EventRegistrationResponse>> getRegistrationsForEvent(@PathVariable UUID eventId) {
        return ResponseEntity.ok(registrationService.getRegistrationsForEvent(eventId));
    }

    @PatchMapping("/{registrationId}/attendance")
    @Operation(summary = "Mark attendance", description = "Marks attendance for a registered student.")
    public ResponseEntity<Void> markAttendance(
            @PathVariable UUID registrationId,
            @RequestParam String status) {
        registrationService.markAttendance(registrationId, status);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{registrationId}/feedback")
    @Operation(summary = "Submit feedback", description = "Submits feedback for an event.")
    public ResponseEntity<Void> submitFeedback(
            @PathVariable UUID registrationId,
            @RequestParam Integer rating,
            @RequestParam String feedbackText) {
        registrationService.submitFeedback(registrationId, rating, feedbackText);
        return ResponseEntity.ok().build();
    }
}
