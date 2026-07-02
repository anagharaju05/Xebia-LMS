package com.xebia.lms.student;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "session_attendances")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "course_id", nullable = false)
    private UUID courseId;

    @Column(name = "nomination_status")
    private String nominationStatus = "Pending";

    @Column(name = "enrollment_status")
    private String enrollmentStatus = "Enrolled";

    @Column(name = "attendance_status")
    private String attendanceStatus = "Registered";

    @Column(name = "progress_percentage")
    private Integer progressPercentage = 0;

    @Column(name = "actual_learning_hours")
    private BigDecimal actualLearningHours;

    @Column(name = "nominated_at")
    private LocalDateTime nominatedAt;

    @Column(name = "enrolled_at")
    private LocalDateTime enrolledAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
