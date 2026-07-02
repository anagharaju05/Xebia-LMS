package com.xebia.lms.student;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_certifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentCertification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "certification_name", nullable = false)
    private String certificationName;

    private String technology;
    private String provider;
    
    @Column(name = "lifecycle_status")
    private String lifecycleStatus = "Assigned";
    
    @Column(name = "certificate_url")
    private String certificateUrl;
    
    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "enrolled_at")
    private LocalDateTime enrolledAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
