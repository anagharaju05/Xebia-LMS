package com.xebia.lms.event;

import com.xebia.lms.event.dto.EventRequest;
import com.xebia.lms.event.dto.EventResponse;

import java.util.List;
import java.util.UUID;

public interface EventService {
    EventResponse createEvent(EventRequest request);
    EventResponse updateEvent(UUID id, EventRequest request);
    EventResponse getEventById(UUID id);
    List<EventResponse> getAllEvents(String status, UUID courseId);
    void deleteEvent(UUID id);
    EventResponse cancelEvent(UUID id);
}
