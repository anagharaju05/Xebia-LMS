package com.xebia.lms.assessment;

import com.xebia.lms.assessment.dto.AssessmentRequest;
import com.xebia.lms.assessment.dto.AssessmentResponse;
import com.xebia.lms.student.StudentQuestion;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AssessmentController {

    private final AssessmentService assessmentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AssessmentResponse createAssessment(@Valid @RequestBody AssessmentRequest request) {
        return assessmentService.createAssessment(request);
    }

    @PutMapping("/{id}")
    public AssessmentResponse updateAssessment(@PathVariable UUID id, @Valid @RequestBody AssessmentRequest request) {
        return assessmentService.updateAssessment(id, request);
    }

    @GetMapping("/{id}")
    public AssessmentResponse getAssessmentById(@PathVariable UUID id) {
        return assessmentService.getAssessmentById(id);
    }

    @GetMapping
    public List<AssessmentResponse> getAllAssessments(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String status) {
        return assessmentService.getAllAssessments(subject, status);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAssessment(@PathVariable UUID id) {
        assessmentService.deleteAssessment(id);
    }

    // Student Q&A Forum Endpoints
    @GetMapping("/questions")
    public List<StudentQuestion> getAllQuestions() {
        return assessmentService.getAllQuestions();
    }

    @PostMapping("/questions/{questionId}/answer")
    public StudentQuestion answerQuestion(@PathVariable UUID questionId, @RequestBody Map<String, String> payload) {
        String answer = payload.get("answer");
        return assessmentService.answerQuestion(questionId, answer);
    }

    @PostMapping("/questions")
    @ResponseStatus(HttpStatus.CREATED)
    public StudentQuestion createQuestion(@RequestBody Map<String, String> payload) {
        UUID studentId = UUID.fromString(payload.get("studentId"));
        String subject = payload.get("subject");
        String content = payload.get("content");
        return assessmentService.createQuestion(studentId, subject, content);
    }
}
