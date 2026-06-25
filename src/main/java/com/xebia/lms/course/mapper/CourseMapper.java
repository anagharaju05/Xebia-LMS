package com.xebia.lms.course.mapper;

import com.xebia.lms.course.Course;
import com.xebia.lms.course.dto.CourseResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CourseMapper {
    
    CourseResponse toResponse(Course course);
    
    List<CourseResponse> toResponseList(List<Course> courses);
}
