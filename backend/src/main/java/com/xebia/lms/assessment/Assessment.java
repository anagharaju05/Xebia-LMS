package com.xebia.lms.assessment;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "assessments")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Assessment {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String type;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String instructions;

    @Column(name = "due_at")
    private LocalDateTime dueAt;

    @Column(nullable = false)
    private int points;

    @Column(name = "assignment_scope", nullable = false)
    private String assignmentScope;

    @Column(nullable = false)
    private String status = "Draft";

    private String language;

    @Column(name = "starter_code", columnDefinition = "TEXT")
    private String starterCode;

    @Column(name = "quiz_file_name")
    private String quizFileName;

    @Column(name = "attachment_name")
    private String attachmentName;

    @Column(name = "class_name")
    private String className;

    @Column(name = "teacher_id")
    private String teacherId;

    @ElementCollection
    @CollectionTable(name = "assessment_allowed_file_types", joinColumns = @JoinColumn(name = "assessment_id"))
    @Column(name = "file_type")
    private List<String> allowedFileTypes;

    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AssessmentQuestion> questions;

    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TestCase> testCases;

    @ElementCollection
    @CollectionTable(name = "assessment_batch_allocations", joinColumns = @JoinColumn(name = "assessment_id"))
    @Column(name = "batch_id")
    private List<UUID> assignedBatchIds;

    @ElementCollection
    @CollectionTable(name = "assessment_student_allocations", joinColumns = @JoinColumn(name = "assessment_id"))
    @Column(name = "student_id")
    private List<UUID> assignedStudentIds;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
