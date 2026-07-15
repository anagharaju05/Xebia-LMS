package com.xebia.lms.batch;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "batch_announcements")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchAnnouncement {
    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "batch_id")
    private String batchId;

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    private String author;

    @Column(name = "created_at")
    private String createdAt;
}
