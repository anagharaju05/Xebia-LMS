package com.xebia.lms.course;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "flagship_programs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlagshipProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "program_name", nullable = false)
    private String programName;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "completion_target")
    private Integer completionTarget = 100;

    @Column(name = "certification_target")
    private Integer certificationTarget = 100;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
