package com.xebia.lms.assessment;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface AssessmentQuestionRepository extends JpaRepository<AssessmentQuestion, UUID> {
}
