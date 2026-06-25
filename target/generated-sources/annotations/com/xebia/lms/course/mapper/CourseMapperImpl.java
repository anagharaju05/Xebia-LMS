package com.xebia.lms.course.mapper;

import com.xebia.lms.course.Course;
import com.xebia.lms.course.dto.CourseResponse;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-24T22:23:44+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.19 (Eclipse Adoptium)"
)
@Component
public class CourseMapperImpl implements CourseMapper {

    @Override
    public CourseResponse toResponse(Course course) {
        if ( course == null ) {
            return null;
        }

        CourseResponse.CourseResponseBuilder courseResponse = CourseResponse.builder();

        courseResponse.id( course.getId() );
        courseResponse.organizationId( course.getOrganizationId() );
        courseResponse.categoryId( course.getCategoryId() );
        courseResponse.trainerId( course.getTrainerId() );
        courseResponse.courseCode( course.getCourseCode() );
        courseResponse.courseName( course.getCourseName() );
        courseResponse.shortDescription( course.getShortDescription() );
        courseResponse.durationMinutes( course.getDurationMinutes() );
        courseResponse.difficulty( course.getDifficulty() );
        courseResponse.status( course.getStatus() );
        courseResponse.thumbnailUrl( course.getThumbnailUrl() );
        courseResponse.createdAt( course.getCreatedAt() );
        courseResponse.updatedAt( course.getUpdatedAt() );

        return courseResponse.build();
    }

    @Override
    public List<CourseResponse> toResponseList(List<Course> courses) {
        if ( courses == null ) {
            return null;
        }

        List<CourseResponse> list = new ArrayList<CourseResponse>( courses.size() );
        for ( Course course : courses ) {
            list.add( toResponse( course ) );
        }

        return list;
    }
}
