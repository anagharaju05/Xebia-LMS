package com.xebia.lms.event;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {
    
    List<Event> findByOrganizationIdOrderByStartTimeAsc(UUID organizationId);
    
    List<Event> findByOrganizationIdAndStatusOrderByStartTimeAsc(UUID organizationId, String status);
    
    List<Event> findByOrganizationIdAndCourseIdOrderByStartTimeAsc(UUID organizationId, UUID courseId);
    
    Optional<Event> findByIdAndOrganizationId(UUID id, UUID organizationId);
}
