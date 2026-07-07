package com.xebia.lms.assessment;

import com.xebia.lms.assessment.dto.AssessmentRequest;
import com.xebia.lms.assessment.dto.AssessmentResponse;
import com.xebia.lms.assessment.mapper.AssessmentMapper;
import com.xebia.lms.exception.BadRequestException;
import com.xebia.lms.exception.ResourceNotFoundException;
import com.xebia.lms.security.TenantContext;
import com.xebia.lms.student.StudentQuestion;
import com.xebia.lms.student.StudentQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssessmentServiceImpl implements AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentMapper assessmentMapper;
    private final StudentQuestionRepository studentQuestionRepository;

    @Override
    @Transactional
    @CacheEvict(value = "assessments", allEntries = true)
    public AssessmentResponse createAssessment(AssessmentRequest request) {
        UUID orgId = TenantContext.getCurrentTenant();
        if (orgId == null) {
            throw new BadRequestException("Organization ID must be provided via tenant context");
        }

        Assessment assessment = assessmentMapper.toEntity(request);
        assessment.setId(request.getId() != null ? request.getId() : UUID.randomUUID());
        assessment.setOrganizationId(orgId);
        
        if (request.getStatus() == null) {
            assessment.setStatus("Draft");
        }

        // Establish bidirectional relationships and set UUIDs
        if (assessment.getQuestions() != null) {
            assessment.getQuestions().forEach(q -> {
                q.setAssessment(assessment);
                if (q.getId() == null) {
                    q.setId(UUID.randomUUID());
                }
            });
        }
        if (assessment.getTestCases() != null) {
            assessment.getTestCases().forEach(tc -> {
                tc.setAssessment(assessment);
                if (tc.getId() == null) {
                    tc.setId(UUID.randomUUID());
                }
            });
        }

        Assessment saved = assessmentRepository.save(assessment);
        return assessmentMapper.toResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "assessments", allEntries = true)
    public AssessmentResponse updateAssessment(UUID id, AssessmentRequest request) {
        UUID orgId = TenantContext.getCurrentTenant();
        if (orgId == null) {
            throw new BadRequestException("Organization ID must be provided via tenant context");
        }

        Assessment existing = assessmentRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));

        // Map request to new entity layout, preserving IDs
        Assessment updated = assessmentMapper.toEntity(request);
        updated.setId(id);
        updated.setOrganizationId(orgId);
        
        if (request.getStatus() != null) {
            updated.setStatus(request.getStatus());
        } else {
            updated.setStatus(existing.getStatus());
        }

        // Bind relationships
        if (updated.getQuestions() != null) {
            updated.getQuestions().forEach(q -> {
                q.setAssessment(updated);
                if (q.getId() == null) {
                    q.setId(UUID.randomUUID());
                }
            });
        }
        if (updated.getTestCases() != null) {
            updated.getTestCases().forEach(tc -> {
                tc.setAssessment(updated);
                if (tc.getId() == null) {
                    tc.setId(UUID.randomUUID());
                }
            });
        }

        Assessment saved = assessmentRepository.save(updated);
        return assessmentMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AssessmentResponse getAssessmentById(UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        Assessment assessment = assessmentRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));
        return assessmentMapper.toResponse(assessment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssessmentResponse> getAllAssessments(String subject, String status) {
        UUID orgId = TenantContext.getCurrentTenant();
        if (orgId == null) {
            throw new BadRequestException("Organization ID must be provided via tenant context");
        }

        List<Assessment> assessments = assessmentRepository.findAllByOrganizationId(orgId);

        // Filter in memory for simplicity or match database calls if query grows
        if (subject != null && !subject.isBlank()) {
            assessments = assessments.stream()
                    .filter(a -> a.getSubject().equalsIgnoreCase(subject.trim()))
                    .collect(Collectors.toList());
        }

        if (status != null && !status.isBlank()) {
            assessments = assessments.stream()
                    .filter(a -> a.getStatus().equalsIgnoreCase(status.trim()))
                    .collect(Collectors.toList());
        }

        return assessmentMapper.toResponseList(assessments);
    }

    @Override
    @Transactional
    @CacheEvict(value = "assessments", allEntries = true)
    public void deleteAssessment(UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        Assessment assessment = assessmentRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));
        assessmentRepository.delete(assessment);
    }

    // Student Q&A Forum Implementations
    @Override
    @Transactional(readOnly = true)
    public List<StudentQuestion> getAllQuestions() {
        UUID orgId = TenantContext.getCurrentTenant();
        if (orgId == null) {
            throw new BadRequestException("Organization ID must be provided via tenant context");
        }
        return studentQuestionRepository.findAllByOrganizationId(orgId);
    }

    @Override
    @Transactional
    public StudentQuestion answerQuestion(UUID questionId, String answer) {
        UUID orgId = TenantContext.getCurrentTenant();
        StudentQuestion question = studentQuestionRepository.findByIdAndOrganizationId(questionId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        question.setAnswer(answer);
        question.setAnsweredAt(LocalDateTime.now());
        return studentQuestionRepository.save(question);
    }

    @Override
    @Transactional
    public StudentQuestion createQuestion(UUID studentId, String subject, String content) {
        UUID orgId = TenantContext.getCurrentTenant();
        if (orgId == null) {
            throw new BadRequestException("Organization ID must be provided via tenant context");
        }
        StudentQuestion question = StudentQuestion.builder()
                .id(UUID.randomUUID())
                .organizationId(orgId)
                .studentId(studentId)
                .subject(subject)
                .content(content)
                .askedAt(LocalDateTime.now())
                .build();
        return studentQuestionRepository.save(question);
    }
}
