package com.xebia.lms.batch;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BatchServiceImpl implements BatchService {

    private final BatchRepository batchRepo;
    private final BatchSubjectRepository subjectRepo;
    private final BatchAnnouncementRepository announcementRepo;
    private final BatchAttendanceRepository attendanceRepo;
    private final BatchDiscussionRepository discussionRepo;
    private final BatchDiscussionReplyRepository replyRepo;
    private final BatchSessionRepository sessionRepo;

    @Override
    public BatchStateDto getFullState() {
        BatchStateDto state = new BatchStateDto();
        state.setBatches(batchRepo.findAll());
        state.setSubjects(subjectRepo.findAll());
        state.setAnnouncements(announcementRepo.findAll());
        state.setAttendance(attendanceRepo.findAll());
        state.setDiscussions(discussionRepo.findAll());
        state.setSessions(sessionRepo.findAll());
        return state;
    }

    @Override
    public Batch saveBatch(Batch batch) {
        if (batch.getId() == null || batch.getId().isEmpty()) {
            batch.setId("batch-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (batch.getJoinCode() == null || batch.getJoinCode().isEmpty()) {
            batch.setJoinCode(generateJoinCode());
            batch.setJoinCodeEnabled(true);
        }
        return batchRepo.save(batch);
    }

    @Override
    public void deleteBatch(String batchId) {
        batchRepo.deleteById(batchId);
        // Also cleanup related elements if needed, or rely on frontend to not fetch them
    }

    @Override
    public void archiveBatch(String batchId) {
        batchRepo.findById(batchId).ifPresent(batch -> {
            batch.setStatus("Archived".equals(batch.getStatus()) ? "Active" : "Archived");
            batchRepo.save(batch);
        });
    }

    @Override
    public void regenerateJoinCode(String batchId) {
        batchRepo.findById(batchId).ifPresent(batch -> {
            batch.setJoinCode(generateJoinCode());
            batch.setJoinCodeEnabled(true);
            batchRepo.save(batch);
        });
    }

    @Override
    public void toggleJoinCode(String batchId) {
        batchRepo.findById(batchId).ifPresent(batch -> {
            batch.setJoinCodeEnabled(!Boolean.TRUE.equals(batch.getJoinCodeEnabled()));
            batchRepo.save(batch);
        });
    }

    @Override
    public Map<String, Object> joinBatch(String code, String studentId) {
        Map<String, Object> result = new HashMap<>();
        List<Batch> batches = batchRepo.findAll();
        Batch match = batches.stream().filter(b -> b.getJoinCode() != null && b.getJoinCode().equalsIgnoreCase(code.trim())).findFirst().orElse(null);
        
        if (match == null) {
            result.put("ok", false);
            result.put("error", "Join code not found.");
            return result;
        }
        if (!Boolean.TRUE.equals(match.getJoinCodeEnabled())) {
            result.put("ok", false);
            result.put("error", "This join code is disabled.");
            return result;
        }
        if (!"Active".equals(match.getStatus())) {
            result.put("ok", false);
            result.put("error", "This batch is archived.");
            return result;
        }
        if (match.getStudentIds().contains(studentId)) {
            result.put("ok", false);
            result.put("error", "You already belong to this batch.");
            return result;
        }
        if (match.getCapacity() != null && match.getStudentIds().size() >= match.getCapacity()) {
            result.put("ok", false);
            result.put("error", "This batch is full.");
            return result;
        }
        
        match.getStudentIds().add(studentId);
        batchRepo.save(match);
        result.put("ok", true);
        result.put("batch", match);
        return result;
    }

    @Override
    public BatchSubject saveSubject(BatchSubject subject) {
        if (subject.getId() == null || subject.getId().isEmpty()) {
            subject.setId("subject-" + UUID.randomUUID().toString().substring(0, 8));
        }
        return subjectRepo.save(subject);
    }

    @Override
    public void deleteSubject(String subjectId) {
        subjectRepo.deleteById(subjectId);
    }

    @Override
    public BatchAnnouncement saveAnnouncement(BatchAnnouncement announcement) {
        if (announcement.getId() == null || announcement.getId().isEmpty()) {
            announcement.setId("announcement-" + UUID.randomUUID().toString().substring(0, 8));
            announcement.setCreatedAt(LocalDateTime.now().toString());
        }
        return announcementRepo.save(announcement);
    }

    @Override
    public void deleteAnnouncement(String announcementId) {
        announcementRepo.deleteById(announcementId);
    }

    @Override
    public BatchAttendance saveAttendance(BatchAttendance attendance) {
        if (attendance.getId() == null || attendance.getId().isEmpty()) {
            attendance.setId("attendance-" + UUID.randomUUID().toString().substring(0, 8));
        }
        return attendanceRepo.save(attendance);
    }

    @Override
    public BatchDiscussion createDiscussion(BatchDiscussion discussion) {
        if (discussion.getId() == null || discussion.getId().isEmpty()) {
            discussion.setId("discussion-" + UUID.randomUUID().toString().substring(0, 8));
            discussion.setCreatedAt(LocalDateTime.now().toString());
            discussion.setPinned(false);
        }
        return discussionRepo.save(discussion);
    }

    @Override
    public BatchDiscussion replyDiscussion(String discussionId, BatchDiscussionReply reply) {
        BatchDiscussion discussion = discussionRepo.findById(discussionId).orElseThrow();
        if (reply.getId() == null || reply.getId().isEmpty()) {
            reply.setId("reply-" + UUID.randomUUID().toString().substring(0, 8));
            reply.setCreatedAt(LocalDateTime.now().toString());
        }
        discussion.getReplies().add(reply);
        return discussionRepo.save(discussion);
    }

    @Override
    public void togglePin(String discussionId) {
        discussionRepo.findById(discussionId).ifPresent(d -> {
            d.setPinned(!Boolean.TRUE.equals(d.getPinned()));
            discussionRepo.save(d);
        });
    }

    private String generateJoinCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
