package com.xebia.lms.batch;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "batch_discussions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchDiscussion {
    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "batch_id")
    private String batchId;

    @Column(name = "subject_id")
    private String subjectId;

    @Column(name = "author_id")
    private String authorId;

    private String author;
    private String role;
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String body;
    
    private Boolean pinned;

    @Column(name = "created_at")
    private String createdAt;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "discussion_id")
    private List<BatchDiscussionReply> replies = new ArrayList<>();
}
