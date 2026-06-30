package com.xebia.lms.student;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StudentAssignmentRepository extends JpaRepository<StudentAssignment, String> {
    List<StudentAssignment> findAllByStudentId(UUID studentId);
}
