package com.xebia.lms.student;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_feedback")
@Getter
@Setter
public class StudentFeedback {

    @Id
    private String id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "course_id", nullable = false)
    private String courseId;

    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "submitted_at")
    private String submittedAt;

    @Column(name = "trainer_rating")
    private Integer trainerRating;

    @Column(name = "session_rating")
    private Integer sessionRating;

    @Column(name = "recommendation_answer")
    private Boolean recommendationAnswer;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
