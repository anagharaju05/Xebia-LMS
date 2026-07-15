package com.xebia.lms.batch;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "batch_subjects")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchSubject {
    @Id
    @Column(name = "id")
    private String id; // e.g. "subject-java"

    private String name;
    private String description;
    private String color;
    private Integer lessons;
    private Integer assignments;
    private Integer quizzes;
    private Integer files;
    private Integer liveSessions;

    @ElementCollection
    @CollectionTable(name = "batch_subject_assignments", joinColumns = @JoinColumn(name = "subject_id"))
    @Column(name = "batch_id")
    private List<String> assignedBatchIds = new ArrayList<>();
}
