package com.xebia.lms.batch;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatchAnnouncementRepository extends JpaRepository<BatchAnnouncement, String> {
    List<BatchAnnouncement> findByBatchId(String batchId);
}
