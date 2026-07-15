package com.xebia.lms.batch;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatchDiscussionRepository extends JpaRepository<BatchDiscussion, String> {
    List<BatchDiscussion> findByBatchId(String batchId);
}
