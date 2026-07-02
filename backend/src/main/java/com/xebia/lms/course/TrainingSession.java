package com.xebia.lms.course;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "training_sessions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "course_id")
    private UUID courseId;

    @Column(name = "trainer_id", nullable = false)
    private UUID trainerId;

    @Column(name = "session_date", nullable = false)
    private LocalDateTime sessionDate;

    @Column(name = "duration_hours")
    private BigDecimal durationHours;

    @Column(name = "delivery_mode")
    private String deliveryMode;

    private Integer capacity;
    private String region;
    private String location;
    private String project;
    
    private String status = "Scheduled";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
