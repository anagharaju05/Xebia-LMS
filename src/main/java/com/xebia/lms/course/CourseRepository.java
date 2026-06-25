package com.xebia.lms.course;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    
    List<Course> findAllByOrganizationId(UUID organizationId);
    
    Optional<Course> findByIdAndOrganizationId(UUID id, UUID organizationId);
    
    boolean existsByCourseCodeAndOrganizationId(String courseCode, UUID organizationId);
    
    boolean existsByCourseCodeAndOrganizationIdAndIdNot(String courseCode, UUID organizationId, UUID id);

    boolean existsByCategoryIdAndOrganizationId(UUID categoryId, UUID organizationId);
}
