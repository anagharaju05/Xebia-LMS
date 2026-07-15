package com.xebia.lms.batch;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "batch_sessions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchSession {
    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "batch_id")
    private String batchId;

    @Column(name = "subject_id")
    private String subjectId;

    private String title;

    @Column(name = "start_at")
    private String startAt;
    
    private String duration;
}
