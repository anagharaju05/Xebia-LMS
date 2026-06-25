package com.xebia.lms.content;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "contents")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Content {

    @Id
    private UUID id;

    @Column(name = "submodule_id", nullable = false)
    private UUID submoduleId;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false)
    private ContentType contentType;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(name = "content_data")
    private String contentData;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(nullable = false)
    private int position;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
