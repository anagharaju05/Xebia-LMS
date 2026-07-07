package com.xebia.lms.assessment;

import com.xebia.lms.assessment.dto.AssessmentRequest;
import com.xebia.lms.assessment.dto.AssessmentResponse;
import com.xebia.lms.student.StudentQuestion;

import java.util.List;
import java.util.UUID;

public interface AssessmentService {
    AssessmentResponse createAssessment(AssessmentRequest request);
    AssessmentResponse updateAssessment(UUID id, AssessmentRequest request);
    AssessmentResponse getAssessmentById(UUID id);
    List<AssessmentResponse> getAllAssessments(String subject, String status);
    void deleteAssessment(UUID id);

    // Student Q&A Forum Endpoints
    List<StudentQuestion> getAllQuestions();
    StudentQuestion answerQuestion(UUID questionId, String answer);
    StudentQuestion createQuestion(UUID studentId, String subject, String content);
}
