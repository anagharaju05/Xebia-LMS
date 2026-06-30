package com.xebia.lms.student;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StudentNotificationRepository extends JpaRepository<StudentNotification, String> {
    List<StudentNotification> findAllByStudentId(UUID studentId);
}
