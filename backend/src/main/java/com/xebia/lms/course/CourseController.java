package com.xebia.lms.course;

import com.xebia.lms.course.dto.CourseRequest;
import com.xebia.lms.course.dto.CourseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@Tag(name = "Course Management", description = "Endpoints for managing course details, approval review process, and publishing.")
public class CourseController {

    private final CourseService courseService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new course", description = "Allows Admin, Trainer, or Organiser to create a new course. Status defaults to DRAFT.")
    public CourseResponse createCourse(@Valid @RequestBody CourseRequest request) {
        return courseService.createCourse(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update course details", description = "Allows Admin, Trainer, or Organiser to update details. Published courses are read-only for Trainers.")
    public CourseResponse updateCourse(@PathVariable UUID id, @Valid @RequestBody CourseRequest request) {
        return courseService.updateCourse(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a course", description = "Allows Admin, Trainer, or Organiser to delete a course. Published courses are read-only for Trainers.")
    public void deleteCourse(@PathVariable UUID id) {
        courseService.deleteCourse(id);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Retrieve course by ID", description = "Retrieves details of a specific course.")
    public CourseResponse getCourseById(@PathVariable UUID id) {
        return courseService.getCourseById(id);
    }

    @GetMapping
    @Operation(summary = "List all courses", description = "Lists all courses for the active organization tenant.")
    public List<CourseResponse> getAllCourses() {
        return courseService.getAllCourses();
    }

    @PostMapping("/{id}/submit-review")
    @Operation(summary = "Submit course for review", description = "Allows Trainer or Organiser to submit a DRAFT course for review.")
    public CourseResponse submitReview(@PathVariable UUID id) {
        return courseService.submitForReview(id);
    }

    @PostMapping("/{id}/publish")
    @Operation(summary = "Publish course", description = "Allows an Admin to publish a course that is under REVIEW status.")
    public CourseResponse publishCourse(@PathVariable UUID id) {
        return courseService.publishCourse(id);
    }
}
