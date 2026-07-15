package com.xebia.lms.batch;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "batch_discussion_replies")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchDiscussionReply {
    @Id
    @Column(name = "id")
    private String id;

    private String author;
    private String role;
    
    @Column(columnDefinition = "TEXT")
    private String text;
    
    @Column(name = "created_at")
    private String createdAt;
}
