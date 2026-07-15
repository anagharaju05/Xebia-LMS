package com.xebia.lms.batch;

import lombok.Data;
import java.util.List;

@Data
public class BatchStateDto {
    private List<Batch> batches;
    private List<BatchSubject> subjects;
    private List<BatchAnnouncement> announcements;
    private List<BatchAttendance> attendance;
    private List<BatchDiscussion> discussions;
    private List<BatchSession> sessions;
}
