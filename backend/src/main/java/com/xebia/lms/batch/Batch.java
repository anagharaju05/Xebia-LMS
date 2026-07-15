package com.xebia.lms.batch;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "batches")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Batch {
    @Id
    @Column(name = "id")
    private String id; // we use String because frontend generates IDs like "batch-frontend-4"

    private String name;
    private String subject;
    private String department;
    private String semester;
    private String year;
    private String description;
    private Integer capacity;
    private String teacher;
    private String status;
    private String joinCode;
    private Boolean joinCodeEnabled;
    private Integer completion;
    private Integer averageQuiz;
    private Integer averageAssignment;
    private Integer attendance;
    private Integer pendingAssignments;

    @ElementCollection
    @CollectionTable(name = "batch_students", joinColumns = @JoinColumn(name = "batch_id"))
    @Column(name = "student_id")
    private List<String> studentIds = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "batch_subjects", joinColumns = @JoinColumn(name = "batch_id"))
    @Column(name = "subject_id")
    private List<String> subjectIds = new ArrayList<>();
}
