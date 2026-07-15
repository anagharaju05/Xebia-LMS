package com.xebia.lms.batch;

import java.util.Map;

public interface BatchService {
    BatchStateDto getFullState();

    Batch saveBatch(Batch batch);
    void deleteBatch(String batchId);
    void archiveBatch(String batchId);
    void regenerateJoinCode(String batchId);
    void toggleJoinCode(String batchId);
    Map<String, Object> joinBatch(String code, String studentId);

    BatchSubject saveSubject(BatchSubject subject);
    void deleteSubject(String subjectId);

    BatchAnnouncement saveAnnouncement(BatchAnnouncement announcement);
    void deleteAnnouncement(String announcementId);

    BatchAttendance saveAttendance(BatchAttendance attendance);

    BatchDiscussion createDiscussion(BatchDiscussion discussion);
    BatchDiscussion replyDiscussion(String discussionId, BatchDiscussionReply reply);
    void togglePin(String discussionId);
}
