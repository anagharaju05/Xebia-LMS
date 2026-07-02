package com.xebia.lms.student;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_tool_adoptions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiToolAdoption {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "tool_name", nullable = false)
    private String toolName;

    @Column(name = "adoption_status")
    private String adoptionStatus = "Not Started";

    @Column(name = "usage_level")
    private String usageLevel = "Low";

    @Column(name = "first_used_at")
    private LocalDateTime firstUsedAt;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "is_power_user")
    private boolean isPowerUser;

    @Column(name = "is_mentor")
    private boolean isMentor;

    @Column(name = "is_ambassador")
    private boolean isAmbassador;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
