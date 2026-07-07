package com.xebia.lms.assessment;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssessmentRepository extends JpaRepository<Assessment, UUID> {
    Optional<Assessment> findByIdAndOrganizationId(UUID id, UUID organizationId);
    List<Assessment> findAllByOrganizationId(UUID organizationId);
    List<Assessment> findAllByOrganizationIdAndSubject(UUID organizationId, String subject);
}
