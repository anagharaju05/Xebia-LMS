package com.xebia.lms.student;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lesson_comments")
@Getter
@Setter
public class LessonComment {

    @Id
    private String id;

    @Column(name = "lesson_slug", nullable = false)
    private String lessonSlug;

    @Column(name = "author_name", nullable = false)
    private String authorName;

    @Column(nullable = false)
    private String role;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String text;

    @Column(name = "created_at_str")
    private String createdAtStr;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LessonCommentReply> replies = new ArrayList<>();
}
