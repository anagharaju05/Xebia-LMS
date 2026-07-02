package com.xebia.lms.analytics.controller;

import com.xebia.lms.analytics.dto.AnalyticsFilterRequest;
import com.xebia.lms.analytics.dto.AnalyticsResponse;
import com.xebia.lms.analytics.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*") // Adjust to match project's CORS policy if needed
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    private <T> AnalyticsResponse<T> buildResponse(T data, AnalyticsFilterRequest request) {
        return AnalyticsResponse.<T>builder()
                .success(true)
                .data(data)
                .meta(AnalyticsResponse.Meta.builder()
                        .generatedAt(LocalDateTime.now().toString())
                        .build())
                .build();
    }

    @GetMapping("/filters")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'LMS_ADMIN', 'LD_ADMIN', 'LEADERSHIP')")
    public ResponseEntity<AnalyticsResponse<Map<String, Object>>> getFilters() {
        return ResponseEntity.ok(buildResponse(analyticsService.getFilters(), null));
    }

    @GetMapping("/executive-summary")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'LMS_ADMIN', 'LD_ADMIN', 'LEADERSHIP')")
    public ResponseEntity<AnalyticsResponse<Map<String, Object>>> getExecutiveSummary(AnalyticsFilterRequest request) {
        return ResponseEntity.ok(buildResponse(analyticsService.getExecutiveSummary(request), request));
    }

    @GetMapping("/learning-coverage")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'LMS_ADMIN', 'LD_ADMIN', 'LEADERSHIP')")
    public ResponseEntity<AnalyticsResponse<Map<String, Object>>> getLearningCoverage(AnalyticsFilterRequest request) {
        return ResponseEntity.ok(buildResponse(analyticsService.getLearningCoverage(request), request));
    }

    @GetMapping("/learning-hours")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'LMS_ADMIN', 'LD_ADMIN', 'LEADERSHIP')")
    public ResponseEntity<AnalyticsResponse<Map<String, Object>>> getLearningHours(AnalyticsFilterRequest request) {
        return ResponseEntity.ok(buildResponse(analyticsService.getLearningHours(request), request));
    }

    @GetMapping("/learning-pillars")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'LMS_ADMIN', 'LD_ADMIN', 'LEADERSHIP')")
    public ResponseEntity<AnalyticsResponse<Map<String, Object>>> getLearningPillars(AnalyticsFilterRequest request) {
        return ResponseEntity.ok(buildResponse(analyticsService.getLearningPillars(request), request));
    }

    @GetMapping("/ai-transformation")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'LMS_ADMIN', 'LD_ADMIN', 'LEADERSHIP')")
    public ResponseEntity<AnalyticsResponse<Map<String, Object>>> getAiTransformation(AnalyticsFilterRequest request) {
        return ResponseEntity.ok(buildResponse(analyticsService.getAiTransformation(request), request));
    }

    @GetMapping("/certifications")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'LMS_ADMIN', 'LD_ADMIN', 'LEADERSHIP')")
    public ResponseEntity<AnalyticsResponse<Map<String, Object>>> getCertifications(AnalyticsFilterRequest request) {
        return ResponseEntity.ok(buildResponse(analyticsService.getCertifications(request), request));
    }

    @GetMapping("/flagship-programs")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'LMS_ADMIN', 'LD_ADMIN', 'LEADERSHIP')")
    public ResponseEntity<AnalyticsResponse<Map<String, Object>>> getFlagshipPrograms(AnalyticsFilterRequest request) {
        return ResponseEntity.ok(buildResponse(analyticsService.getFlagshipPrograms(request), request));
    }

    @GetMapping("/learning-trends")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'LMS_ADMIN', 'LD_ADMIN', 'LEADERSHIP')")
    public ResponseEntity<AnalyticsResponse<Map<String, Object>>> getLearningTrends(AnalyticsFilterRequest request) {
        return ResponseEntity.ok(buildResponse(analyticsService.getLearningTrends(request), request));
    }

    @GetMapping("/training-effectiveness")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'LMS_ADMIN', 'LD_ADMIN', 'LEADERSHIP')")
    public ResponseEntity<AnalyticsResponse<Map<String, Object>>> getTrainingEffectiveness(AnalyticsFilterRequest request) {
        return ResponseEntity.ok(buildResponse(analyticsService.getTrainingEffectiveness(request), request));
    }

    @GetMapping("/learning-champions")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'LMS_ADMIN', 'LD_ADMIN', 'LEADERSHIP')")
    public ResponseEntity<AnalyticsResponse<Map<String, Object>>> getLearningChampions(AnalyticsFilterRequest request) {
        return ResponseEntity.ok(buildResponse(analyticsService.getLearningChampions(request), request));
    }

    @GetMapping("/project-investment")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'LMS_ADMIN', 'LD_ADMIN', 'LEADERSHIP')")
    public ResponseEntity<AnalyticsResponse<Map<String, Object>>> getProjectInvestment(AnalyticsFilterRequest request) {
        return ResponseEntity.ok(buildResponse(analyticsService.getProjectInvestment(request), request));
    }

    @GetMapping("/fresher-journey")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'LMS_ADMIN', 'LD_ADMIN', 'LEADERSHIP')")
    public ResponseEntity<AnalyticsResponse<Map<String, Object>>> getFresherJourney(AnalyticsFilterRequest request) {
        return ResponseEntity.ok(buildResponse(analyticsService.getFresherJourney(request), request));
    }
}
