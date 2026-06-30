package com.xebia.lms.student;

import java.util.List;
import java.util.UUID;

public interface StudentManagementService {
    StudentDto addStudent(CreateStudentRequest request, UUID organizationId);
    List<StudentDto> getAllStudents(UUID organizationId);
    StudentDto toggleStudentStatus(UUID studentId);
    void assignCourse(UUID studentId, String courseSlug);
    StudentAssignmentDto createAssignment(CreateAssignmentRequest request);
    List<StudentAssignmentDto> getAllAssignments(UUID organizationId);
    StudentAssignmentDto reviewAssignment(String assignmentId, ReviewAssignmentRequest request);
}
