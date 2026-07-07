package com.xebia.lms.assessment;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "assessment_questions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentQuestion {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String prompt;

    @ElementCollection
    @CollectionTable(name = "assessment_question_options", joinColumns = @JoinColumn(name = "assessment_question_id"))
    @Column(name = "option_text")
    private List<String> options;

    @Column(nullable = false)
    private String answer;

    @Column(nullable = false)
    private int marks;

    @Column(columnDefinition = "TEXT")
    private String explanation;
}
