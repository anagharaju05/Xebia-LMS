package com.xebia.lms.course;

import com.xebia.lms.category.CategoryRepository;
import com.xebia.lms.course.dto.CourseRequest;
import com.xebia.lms.course.dto.CourseResponse;
import com.xebia.lms.course.mapper.CourseMapper;
import com.xebia.lms.exception.BadRequestException;
import com.xebia.lms.exception.ResourceNotFoundException;
import com.xebia.lms.security.TenantContext;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final CourseMapper courseMapper;
    private final com.xebia.lms.content.ContentRepository contentRepository;

    public CourseServiceImpl(CourseRepository courseRepository,
                             CategoryRepository categoryRepository,
                             CourseMapper courseMapper,
                             @Lazy com.xebia.lms.content.ContentRepository contentRepository) {
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
        this.courseMapper = courseMapper;
        this.contentRepository = contentRepository;
    }

    @Override
    @Transactional
    public CourseResponse createCourse(CourseRequest request) {
        UUID orgId = TenantContext.getCurrentTenant();
        if (orgId == null) {
            throw new BadRequestException("Organization ID must be provided via tenant context");
        }

        // Verify Category exists for this organization
        categoryRepository.findByIdAndOrganizationId(request.getCategoryId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found for this organization"));

        // Verify Course Code is unique
        if (courseRepository.existsByCourseCodeAndOrganizationId(request.getCourseCode(), orgId)) {
            throw new BadRequestException("Course code must be unique within the organization");
        }

        Course course = Course.builder()
                .id(UUID.randomUUID())
                .organizationId(orgId)
                .categoryId(request.getCategoryId())
                .trainerId(request.getTrainerId())
                .courseCode(request.getCourseCode())
                .courseName(request.getCourseName())
                .shortDescription(request.getShortDescription())
                .durationMinutes(0)
                .difficulty(request.getDifficulty())
                .status(CourseStatus.DRAFT)
                .thumbnailUrl(request.getThumbnailUrl())
                .build();

        Course saved = courseRepository.save(course);
        return courseMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public CourseResponse updateCourse(UUID id, CourseRequest request) {
        UUID orgId = TenantContext.getCurrentTenant();
        Course course = courseRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        validateWriteAccess(course);

        // Verify Category exists
        categoryRepository.findByIdAndOrganizationId(request.getCategoryId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found for this organization"));

        // Verify Course Code uniqueness
        if (courseRepository.existsByCourseCodeAndOrganizationIdAndIdNot(request.getCourseCode(), orgId, id)) {
            throw new BadRequestException("Course code must be unique within the organization");
        }

        course.setCategoryId(request.getCategoryId());
        course.setTrainerId(request.getTrainerId());
        course.setCourseCode(request.getCourseCode());
        course.setCourseName(request.getCourseName());
        course.setShortDescription(request.getShortDescription());
        course.setDifficulty(request.getDifficulty());
        course.setThumbnailUrl(request.getThumbnailUrl());

        Course updated = courseRepository.save(course);
        return courseMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCourse(UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        Course course = courseRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        validateWriteAccess(course);
        courseRepository.delete(course);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponse getCourseById(UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        Course course = courseRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return courseMapper.toResponse(course);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCourses() {
        UUID orgId = TenantContext.getCurrentTenant();
        List<Course> courses = courseRepository.findAllByOrganizationId(orgId);
        return courseMapper.toResponseList(courses);
    }

    @Override
    @Transactional
    public CourseResponse submitForReview(UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        Course course = courseRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        // Only Trainer/Organiser creates course and submits for review. But let's check workflow rules:
        // Trainer submits Course for Review. Saved as Draft -> Review
        if (course.getStatus() != CourseStatus.DRAFT) {
            throw new BadRequestException("Only courses in DRAFT status can be submitted for review");
        }

        course.setStatus(CourseStatus.REVIEW);
        Course updated = courseRepository.save(course);
        return courseMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public CourseResponse publishCourse(UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        Course course = courseRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        // Admin approves course. Must be in REVIEW status
        if (course.getStatus() != CourseStatus.REVIEW) {
            throw new BadRequestException("Only courses in REVIEW status can be published");
        }

        course.setStatus(CourseStatus.PUBLISHED);
        Course updated = courseRepository.save(course);
        return courseMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void updateCourseDuration(UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        Course course = courseRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        int totalDuration = contentRepository.sumDurationMinutesByCourseId(id);
        course.setDurationMinutes(totalDuration);
        courseRepository.save(course);
    }

    private void validateWriteAccess(Course course) {
        // Published courses are read-only for Trainers
        if (course.getStatus() == CourseStatus.PUBLISHED) {
            boolean isOnlyTrainer = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                    .stream()
                    .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_TRAINER"))
                    && SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                    .stream()
                    .noneMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN") 
                            || grantedAuthority.getAuthority().equals("ROLE_ORGANISER"));
            
            if (isOnlyTrainer) {
                throw new BadRequestException("Published courses are read-only for trainers");
            }
        }
    }
}
