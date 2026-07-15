package com.xebia.lms.event;

import com.xebia.lms.event.dto.EventRequest;
import com.xebia.lms.event.dto.EventResponse;
import com.xebia.lms.event.mapper.EventMapper;
import com.xebia.lms.exception.BadRequestException;
import com.xebia.lms.exception.ResourceNotFoundException;
import com.xebia.lms.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventMapper eventMapper;

    @Override
    @Transactional
    public EventResponse createEvent(EventRequest request) {
        UUID orgId = TenantContext.getCurrentTenant();
        if (orgId == null) {
            throw new BadRequestException("Organization ID must be provided via tenant context");
        }

        Event event = eventMapper.toEntity(request);
        if (request.getId() != null) {
            event.setId(request.getId());
        }
        event.setOrganizationId(orgId);
        event.setMaxCapacity(request.getMaxCapacity());
        event.setAccentColor(request.getAccentColor());
        event.setThumbnailUrl(request.getThumbnailUrl());
        
        Event saved = eventRepository.save(event);
        return eventMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public EventResponse updateEvent(UUID id, EventRequest request) {
        UUID orgId = TenantContext.getCurrentTenant();
        if (orgId == null) {
            throw new BadRequestException("Organization ID must be provided via tenant context");
        }

        Event existing = eventRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        existing.setTitle(request.getTitle());
        existing.setDescription(request.getDescription());
        existing.setStartTime(request.getStartTime());
        existing.setEndTime(request.getEndTime());
        existing.setEventType(request.getEventType());
        existing.setLocationOrLink(request.getLocationOrLink());
        existing.setCourseId(request.getCourseId());
        existing.setOrganizerId(request.getOrganizerId());
        existing.setMaxCapacity(request.getMaxCapacity());
        existing.setAccentColor(request.getAccentColor());
        existing.setThumbnailUrl(request.getThumbnailUrl());
        
        if (request.getStatus() != null) {
            existing.setStatus(request.getStatus());
        }

        Event saved = eventRepository.save(existing);
        return eventMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponse getEventById(UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        Event event = eventRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        return eventMapper.toResponse(event);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents(String status, UUID courseId) {
        UUID orgId = TenantContext.getCurrentTenant();
        
        List<Event> events;
        if (courseId != null) {
            events = eventRepository.findByOrganizationIdAndCourseIdOrderByStartTimeAsc(orgId, courseId);
        } else if (status != null && !status.isBlank()) {
            events = eventRepository.findByOrganizationIdAndStatusOrderByStartTimeAsc(orgId, status);
        } else {
            events = eventRepository.findByOrganizationIdOrderByStartTimeAsc(orgId);
        }
        
        return events.stream()
                .map(eventMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteEvent(UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        Event event = eventRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        eventRepository.delete(event);
    }
    
    @Override
    @Transactional
    public EventResponse cancelEvent(UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        Event event = eventRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        
        event.setStatus("CANCELLED");
        Event saved = eventRepository.save(event);
        return eventMapper.toResponse(saved);
    }
}
