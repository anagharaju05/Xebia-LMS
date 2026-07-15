package com.xebia.lms.batch;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BatchDiscussionReplyRepository extends JpaRepository<BatchDiscussionReply, String> {
}
