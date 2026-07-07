package com.xebia.lms.student;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class StudentManagementServiceImpl implements StudentManagementService {

    private final StudentRepository studentRepository;
    private final StudentAssignmentRepository assignmentRepository;

    @Override
    @Transactional
    public StudentDto addStudent(CreateStudentRequest request, UUID organizationId) {
        Student student = new Student();
        student.setOrganizationId(organizationId);
        student.setName(request.getName());
        student.setEmail(request.getEmail());
        student.setCohort(request.getCohort());
        student.setPassword(request.getPassword());
        student = studentRepository.save(student);
        return mapToDto(student);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<StudentDto> getAllStudents(UUID organizationId) {
        return studentRepository.findAllByOrganizationId(organizationId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StudentDto toggleStudentStatus(UUID studentId) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        student.setStatus("Active".equals(student.getStatus()) ? "Inactive" : "Active");
        return mapToDto(studentRepository.save(student));
    }

    @Override
    @Transactional
    public void assignCourse(UUID studentId, String courseSlug) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        student.getCourseSlugs().add(courseSlug);
        studentRepository.save(student);
    }

    @Override
    @Transactional
    public StudentAssignmentDto createAssignment(CreateAssignmentRequest request) {
        StudentAssignment assignment = new StudentAssignment();
        assignment.setId("task-" + UUID.randomUUID().toString().substring(0, 8));
        assignment.setStudentId(request.getStudentId());
        assignment.setCourseSlug(request.getCourseSlug());
        assignment.setTitle(request.getTitle());
        assignment.setInstructions(request.getInstructions());
        assignment.setDueDate(request.getDueDate());
        assignment = assignmentRepository.save(assignment);
        return mapToAssignmentDto(assignment);
    }

    @Override
    public List<StudentAssignmentDto> getAllAssignments(UUID organizationId) {
        // Simple implementation: fetch all assignments for all students in the organization
        List<Student> students = studentRepository.findAllByOrganizationId(organizationId);
        List<UUID> studentIds = students.stream().map(Student::getId).toList();
        return assignmentRepository.findAll().stream()
                .filter(a -> studentIds.contains(a.getStudentId()))
                .map(this::mapToAssignmentDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StudentAssignmentDto reviewAssignment(String assignmentId, ReviewAssignmentRequest request) {
        StudentAssignment assignment = assignmentRepository.findById(assignmentId).orElseThrow();
        assignment.setScore(request.getScore());
        assignment.setReviewNotes(request.getNotes());
        assignment.setStatus("Reviewed");
        return mapToAssignmentDto(assignmentRepository.save(assignment));
    }

    private StudentDto mapToDto(Student student) {
        StudentDto dto = new StudentDto();
        dto.setId(student.getId());
        dto.setName(student.getName());
        dto.setEmail(student.getEmail());
        dto.setCohort(student.getCohort());
        dto.setStatus(student.getStatus());
        dto.setCourseSlugs(List.copyOf(student.getCourseSlugs()));
        return dto;
    }

    private StudentAssignmentDto mapToAssignmentDto(StudentAssignment assignment) {
        StudentAssignmentDto dto = new StudentAssignmentDto();
        dto.setId(assignment.getId());
        dto.setStudentId(assignment.getStudentId());
        dto.setCourseSlug(assignment.getCourseSlug());
        dto.setTitle(assignment.getTitle());
        dto.setInstructions(assignment.getInstructions());
        dto.setDueDate(assignment.getDueDate());
        dto.setStatus(assignment.getStatus());
        dto.setSubmission(assignment.getSubmission());
        dto.setSubmittedAt(assignment.getSubmittedAt());
        dto.setScore(assignment.getScore());
        dto.setReviewNotes(assignment.getReviewNotes());
        return dto;
    }
}
