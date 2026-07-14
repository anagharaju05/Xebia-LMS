package com.xebia.lms.event;

import com.xebia.lms.event.dto.EventRequest;
import com.xebia.lms.event.dto.EventResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse createEvent(@RequestBody EventRequest request) {
        return eventService.createEvent(request);
    }

    @GetMapping
    public List<EventResponse> getAllEvents(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID courseId) {
        return eventService.getAllEvents(status, courseId);
    }

    @GetMapping("/{id}")
    public EventResponse getEventById(@PathVariable UUID id) {
        return eventService.getEventById(id);
    }

    @PutMapping("/{id}")
    public EventResponse updateEvent(@PathVariable UUID id, @RequestBody EventRequest request) {
        return eventService.updateEvent(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(@PathVariable UUID id) {
        eventService.deleteEvent(id);
    }
    
    @PutMapping("/{id}/cancel")
    public EventResponse cancelEvent(@PathVariable UUID id) {
        return eventService.cancelEvent(id);
    }
}
