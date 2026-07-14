package com.xebia.lms.event;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, UUID> {
    List<EventRegistration> findAllByOrganizationId(UUID organizationId);
    List<EventRegistration> findAllByOrganizationIdAndEventId(UUID organizationId, UUID eventId);
    boolean existsByOrganizationIdAndEventIdAndStudentEmail(UUID organizationId, UUID eventId, String studentEmail);
    Optional<EventRegistration> findFirstByOrganizationIdAndEventIdAndStatusOrderByRegisteredAtAsc(UUID organizationId, UUID eventId, String status);
    Integer countByOrganizationIdAndEventIdAndStatus(UUID organizationId, UUID eventId, String status);
}
