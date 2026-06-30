package com.xebia.lms.student;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_assignments")
@Getter
@Setter
public class StudentAssignment {

    @Id
    private String id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "course_slug", nullable = false)
    private String courseSlug;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "due_date")
    private String dueDate;

    @Column(nullable = false)
    private String status = "Assigned";

    @Column(columnDefinition = "TEXT")
    private String submission;

    @Column(name = "submitted_at")
    private String submittedAt;

    private Integer score;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
