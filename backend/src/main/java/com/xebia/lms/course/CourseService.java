package com.xebia.lms.course;

import com.xebia.lms.course.dto.CourseRequest;
import com.xebia.lms.course.dto.CourseResponse;

import java.util.List;
import java.util.UUID;

public interface CourseService {
    CourseResponse createCourse(CourseRequest request);
    
    CourseResponse updateCourse(UUID id, CourseRequest request);
    
    void deleteCourse(UUID id);
    
    CourseResponse getCourseById(UUID id);
    
    List<CourseResponse> getAllCourses();
    
    CourseResponse submitForReview(UUID id);
    
    CourseResponse publishCourse(UUID id);
    
    void updateCourseDuration(UUID id);
}
