package com.xebia.lms.student;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/management/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class StudentManagementController {

    private final StudentManagementService service;
    
    // Hardcoded organizationId for mock tenant logic
    private final UUID ORG_ID = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentDto addStudent(@RequestBody CreateStudentRequest request) {
        return service.addStudent(request, ORG_ID);
    }

    @GetMapping
    public List<StudentDto> getAllStudents() {
        return service.getAllStudents(ORG_ID);
    }

    @PutMapping("/{studentId}/toggle-status")
    public StudentDto toggleStudentStatus(@PathVariable UUID studentId) {
        return service.toggleStudentStatus(studentId);
    }

    @PostMapping("/{studentId}/courses/{courseSlug}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void assignCourse(@PathVariable UUID studentId, @PathVariable String courseSlug) {
        service.assignCourse(studentId, courseSlug);
    }

    @PostMapping("/assignments")
    @ResponseStatus(HttpStatus.CREATED)
    public StudentAssignmentDto createAssignment(@RequestBody CreateAssignmentRequest request) {
        return service.createAssignment(request);
    }

    @GetMapping("/assignments")
    public List<StudentAssignmentDto> getAllAssignments() {
        return service.getAllAssignments(ORG_ID);
    }

    @PutMapping("/assignments/{assignmentId}/review")
    public StudentAssignmentDto reviewAssignment(@PathVariable String assignmentId, @RequestBody ReviewAssignmentRequest request) {
        return service.reviewAssignment(assignmentId, request);
    }
}
