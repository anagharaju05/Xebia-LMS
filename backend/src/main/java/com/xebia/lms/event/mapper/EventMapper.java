package com.xebia.lms.event.mapper;

import com.xebia.lms.event.Event;
import com.xebia.lms.event.dto.EventRequest;
import com.xebia.lms.event.dto.EventResponse;
import org.springframework.stereotype.Component;

@Component
public class EventMapper {

    public Event toEntity(EventRequest request) {
        if (request == null) {
            return null;
        }

        return Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .eventType(request.getEventType())
                .locationOrLink(request.getLocationOrLink())
                .thumbnailUrl(request.getThumbnailUrl())
                .courseId(request.getCourseId())
                .organizerId(request.getOrganizerId())
                .status(request.getStatus())
                .build();
    }

    public EventResponse toResponse(Event entity) {
        if (entity == null) {
            return null;
        }

        return EventResponse.builder()
                .id(entity.getId())
                .organizationId(entity.getOrganizationId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .eventType(entity.getEventType())
                .locationOrLink(entity.getLocationOrLink())
                .thumbnailUrl(entity.getThumbnailUrl())
                .courseId(entity.getCourseId())
                .organizerId(entity.getOrganizerId())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
