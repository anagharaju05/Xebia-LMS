package com.xebia.lms.batch;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/batches")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class BatchController {

    private final BatchService service;

    @GetMapping("/state")
    public BatchStateDto getFullState() {
        return service.getFullState();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Batch saveBatch(@RequestBody Batch batch) {
        return service.saveBatch(batch);
    }

    @DeleteMapping("/{batchId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBatch(@PathVariable String batchId) {
        service.deleteBatch(batchId);
    }

    @PutMapping("/{batchId}/archive")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archiveBatch(@PathVariable String batchId) {
        service.archiveBatch(batchId);
    }

    @PutMapping("/{batchId}/join-code/regenerate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void regenerateJoinCode(@PathVariable String batchId) {
        service.regenerateJoinCode(batchId);
    }

    @PutMapping("/{batchId}/join-code/toggle")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void toggleJoinCode(@PathVariable String batchId) {
        service.toggleJoinCode(batchId);
    }

    @PostMapping("/join")
    public Map<String, Object> joinBatch(@RequestBody Map<String, String> payload) {
        return service.joinBatch(payload.get("code"), payload.get("studentId"));
    }

    @PostMapping("/subjects")
    @ResponseStatus(HttpStatus.CREATED)
    public BatchSubject saveSubject(@RequestBody BatchSubject subject) {
        return service.saveSubject(subject);
    }

    @DeleteMapping("/subjects/{subjectId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSubject(@PathVariable String subjectId) {
        service.deleteSubject(subjectId);
    }

    @PostMapping("/announcements")
    @ResponseStatus(HttpStatus.CREATED)
    public BatchAnnouncement saveAnnouncement(@RequestBody BatchAnnouncement announcement) {
        return service.saveAnnouncement(announcement);
    }

    @DeleteMapping("/announcements/{announcementId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAnnouncement(@PathVariable String announcementId) {
        service.deleteAnnouncement(announcementId);
    }

    @PostMapping("/attendance")
    @ResponseStatus(HttpStatus.CREATED)
    public BatchAttendance saveAttendance(@RequestBody BatchAttendance attendance) {
        return service.saveAttendance(attendance);
    }

    @PostMapping("/discussions")
    @ResponseStatus(HttpStatus.CREATED)
    public BatchDiscussion createDiscussion(@RequestBody BatchDiscussion discussion) {
        return service.createDiscussion(discussion);
    }

    @PostMapping("/discussions/{discussionId}/reply")
    @ResponseStatus(HttpStatus.CREATED)
    public BatchDiscussion replyDiscussion(@PathVariable String discussionId, @RequestBody BatchDiscussionReply reply) {
        return service.replyDiscussion(discussionId, reply);
    }

    @PutMapping("/discussions/{discussionId}/pin")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void togglePin(@PathVariable String discussionId) {
        service.togglePin(discussionId);
    }
}
