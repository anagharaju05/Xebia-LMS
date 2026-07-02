package com.xebia.lms.course;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "courses")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    @Column(name = "trainer_id", nullable = false)
    private UUID trainerId;

    @Column(name = "course_code", nullable = false, unique = true)
    private String courseCode;

    @Column(name = "course_name", nullable = false)
    private String courseName;

    @Column(name = "short_description")
    private String shortDescription;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourseDifficulty difficulty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourseStatus status;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    private String metadata;

    @Column(name = "learning_pillar")
    private String learningPillar;

    @Column(name = "is_ai_training")
    private boolean isAiTraining;

    @Column(name = "is_flagship_program")
    private boolean isFlagshipProgram;

    @Column(name = "certification_available")
    private boolean certificationAvailable;

    @Column(name = "estimated_learning_hours")
    private Integer estimatedLearningHours;

    @Column(name = "delivery_type")
    private String deliveryType;

    @Column(name = "program_name")
    private String programName;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
