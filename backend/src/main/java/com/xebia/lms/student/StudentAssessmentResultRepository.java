package com.xebia.lms.student;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StudentAssessmentResultRepository extends JpaRepository<StudentAssessmentResult, UUID> {
    List<StudentAssessmentResult> findAllByStudentId(UUID studentId);
}
