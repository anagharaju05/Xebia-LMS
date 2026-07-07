package com.xebia.lms.student;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentQuestionRepository extends JpaRepository<StudentQuestion, UUID> {
    Optional<StudentQuestion> findByIdAndOrganizationId(UUID id, UUID organizationId);
    List<StudentQuestion> findAllByOrganizationId(UUID organizationId);
}
