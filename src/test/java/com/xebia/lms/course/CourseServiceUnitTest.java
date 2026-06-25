package com.xebia.lms.course;

import com.xebia.lms.category.Category;
import com.xebia.lms.category.CategoryRepository;
import com.xebia.lms.content.ContentRepository;
import com.xebia.lms.course.dto.CourseRequest;
import com.xebia.lms.course.dto.CourseResponse;
import com.xebia.lms.course.mapper.CourseMapper;
import com.xebia.lms.exception.BadRequestException;
import com.xebia.lms.exception.ResourceNotFoundException;
import com.xebia.lms.security.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CourseServiceUnitTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CourseMapper courseMapper;

    @Mock
    private ContentRepository contentRepository;

    @InjectMocks
    private CourseServiceImpl courseService;

    private UUID orgId;
    private UUID categoryId;
    private UUID courseId;
    private UUID trainerId;
    private Course mockCourse;
    private Category mockCategory;

    @BeforeEach
    void setUp() {
        orgId = UUID.randomUUID();
        categoryId = UUID.randomUUID();
        courseId = UUID.randomUUID();
        trainerId = UUID.randomUUID();

        TenantContext.setCurrentTenant(orgId);

        mockCategory = Category.builder()
                .id(categoryId)
                .organizationId(orgId)
                .name("Technical")
                .status("ACTIVE")
                .build();

        mockCourse = Course.builder()
                .id(courseId)
                .organizationId(orgId)
                .categoryId(categoryId)
                .trainerId(trainerId)
                .courseCode("JV-101")
                .courseName("Java Basics")
                .status(CourseStatus.DRAFT)
                .durationMinutes(0)
                .difficulty(CourseDifficulty.BEGINNER)
                .build();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        SecurityContextHolder.clearContext();
    }

    @Test
    void createCourse_Success() {
        CourseRequest request = CourseRequest.builder()
                .categoryId(categoryId)
                .trainerId(trainerId)
                .courseCode("JV-101")
                .courseName("Java Basics")
                .difficulty(CourseDifficulty.BEGINNER)
                .build();

        when(categoryRepository.findByIdAndOrganizationId(categoryId, orgId)).thenReturn(Optional.of(mockCategory));
        when(courseRepository.existsByCourseCodeAndOrganizationId("JV-101", orgId)).thenReturn(false);
        when(courseRepository.save(any(Course.class))).thenReturn(mockCourse);
        
        CourseResponse mockResponse = CourseResponse.builder()
                .id(courseId)
                .courseCode("JV-101")
                .status(CourseStatus.DRAFT)
                .build();
        when(courseMapper.toResponse(any(Course.class))).thenReturn(mockResponse);

        CourseResponse response = courseService.createCourse(request);

        assertNotNull(response);
        assertEquals(CourseStatus.DRAFT, response.getStatus());
        verify(courseRepository, times(1)).save(any(Course.class));
    }

    @Test
    void createCourse_DuplicateCode_ThrowsException() {
        CourseRequest request = CourseRequest.builder()
                .categoryId(categoryId)
                .trainerId(trainerId)
                .courseCode("JV-101")
                .courseName("Java Basics")
                .difficulty(CourseDifficulty.BEGINNER)
                .build();

        when(categoryRepository.findByIdAndOrganizationId(categoryId, orgId)).thenReturn(Optional.of(mockCategory));
        when(courseRepository.existsByCourseCodeAndOrganizationId("JV-101", orgId)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> courseService.createCourse(request));
    }

    @Test
    void submitForReview_Success() {
        when(courseRepository.findByIdAndOrganizationId(courseId, orgId)).thenReturn(Optional.of(mockCourse));
        when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CourseResponse mockResponse = CourseResponse.builder().id(courseId).status(CourseStatus.REVIEW).build();
        when(courseMapper.toResponse(any(Course.class))).thenReturn(mockResponse);

        CourseResponse response = courseService.submitForReview(courseId);

        assertNotNull(response);
        assertEquals(CourseStatus.REVIEW, response.getStatus());
    }

    @Test
    void submitForReview_NotDraft_ThrowsException() {
        mockCourse.setStatus(CourseStatus.REVIEW);
        when(courseRepository.findByIdAndOrganizationId(courseId, orgId)).thenReturn(Optional.of(mockCourse));

        assertThrows(BadRequestException.class, () -> courseService.submitForReview(courseId));
    }

    @Test
    void publishCourse_Success() {
        mockCourse.setStatus(CourseStatus.REVIEW);
        when(courseRepository.findByIdAndOrganizationId(courseId, orgId)).thenReturn(Optional.of(mockCourse));
        when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CourseResponse mockResponse = CourseResponse.builder().id(courseId).status(CourseStatus.PUBLISHED).build();
        when(courseMapper.toResponse(any(Course.class))).thenReturn(mockResponse);

        CourseResponse response = courseService.publishCourse(courseId);

        assertNotNull(response);
        assertEquals(CourseStatus.PUBLISHED, response.getStatus());
    }

    @Test
    void updateCourse_PublishedAndTrainerRole_ThrowsException() {
        mockCourse.setStatus(CourseStatus.PUBLISHED);
        when(courseRepository.findByIdAndOrganizationId(courseId, orgId)).thenReturn(Optional.of(mockCourse));

        // Mock security context for Trainer
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_TRAINER"))).when(authentication).getAuthorities();
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        CourseRequest request = CourseRequest.builder()
                .categoryId(categoryId)
                .trainerId(trainerId)
                .courseCode("JV-101")
                .courseName("Java Basics Edited")
                .difficulty(CourseDifficulty.BEGINNER)
                .build();

        assertThrows(BadRequestException.class, () -> courseService.updateCourse(courseId, request));
    }

    @Test
    void updateCourse_PublishedAndAdminRole_Success() {
        mockCourse.setStatus(CourseStatus.PUBLISHED);
        when(courseRepository.findByIdAndOrganizationId(courseId, orgId)).thenReturn(Optional.of(mockCourse));
        when(categoryRepository.findByIdAndOrganizationId(categoryId, orgId)).thenReturn(Optional.of(mockCategory));
        when(courseRepository.existsByCourseCodeAndOrganizationIdAndIdNot("JV-101", orgId, courseId)).thenReturn(false);
        when(courseRepository.save(any(Course.class))).thenReturn(mockCourse);

        // Mock security context for Admin
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))).when(authentication).getAuthorities();
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        CourseRequest request = CourseRequest.builder()
                .categoryId(categoryId)
                .trainerId(trainerId)
                .courseCode("JV-101")
                .courseName("Java Basics Edited")
                .difficulty(CourseDifficulty.BEGINNER)
                .build();

        CourseResponse mockResponse = CourseResponse.builder().id(courseId).status(CourseStatus.PUBLISHED).build();
        when(courseMapper.toResponse(any(Course.class))).thenReturn(mockResponse);

        CourseResponse response = courseService.updateCourse(courseId, request);
        assertNotNull(response);
    }
}
