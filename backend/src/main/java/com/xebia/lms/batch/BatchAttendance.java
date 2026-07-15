package com.xebia.lms.batch;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "batch_attendance")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchAttendance {
    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "batch_id")
    private String batchId;

    @Column(name = "subject_id")
    private String subjectId;

    @Column(name = "attendance_date") // "date" is a reserved keyword in some SQL dialects
    private String date;

    @ElementCollection
    @CollectionTable(name = "batch_attendance_statuses", joinColumns = @JoinColumn(name = "attendance_id"))
    @MapKeyColumn(name = "student_id")
    @Column(name = "status")
    private Map<String, String> statuses = new HashMap<>();
}
