package com.xebia.lms.batch;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatchAttendanceRepository extends JpaRepository<BatchAttendance, String> {
    List<BatchAttendance> findByBatchId(String batchId);
    Optional<BatchAttendance> findByBatchIdAndSubjectIdAndDate(String batchId, String subjectId, String date);
}
