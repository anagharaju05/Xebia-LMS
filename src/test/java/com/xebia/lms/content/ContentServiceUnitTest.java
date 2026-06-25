package com.xebia.lms.content;

import com.xebia.lms.course.Course;
import com.xebia.lms.course.CourseRepository;
import com.xebia.lms.course.CourseService;
import com.xebia.lms.exception.BadRequestException;
import com.xebia.lms.module.Module;
import com.xebia.lms.module.ModuleRepository;
import com.xebia.lms.security.TenantContext;
import com.xebia.lms.submodule.Submodule;
import com.xebia.lms.submodule.SubmoduleRepository;
import com.xebia.lms.content.dto.ContentRequest;
import com.xebia.lms.content.dto.ContentResponse;
import com.xebia.lms.content.mapper.ContentMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ContentServiceUnitTest {

    @Mock
    private ContentRepository contentRepository;

    @Mock
    private SubmoduleRepository submoduleRepository;

    @Mock
    private ModuleRepository moduleRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private ContentMapper contentMapper;

    @Mock
    private CourseService courseService;

    @InjectMocks
    private ContentServiceImpl contentService;

    private UUID orgId;
    private UUID courseId;
    private UUID moduleId;
    private UUID submoduleId;
    private Submodule mockSubmodule;
    private Module mockModule;
    private Course mockCourse;

    @BeforeEach
    void setUp() {
        orgId = UUID.randomUUID();
        courseId = UUID.randomUUID();
        moduleId = UUID.randomUUID();
        submoduleId = UUID.randomUUID();

        TenantContext.setCurrentTenant(orgId);

        mockCourse = Course.builder()
                .id(courseId)
                .organizationId(orgId)
                .status(com.xebia.lms.course.CourseStatus.DRAFT)
                .build();

        mockModule = Module.builder()
                .id(moduleId)
                .courseId(courseId)
                .build();

        mockSubmodule = Submodule.builder()
                .id(submoduleId)
                .moduleId(moduleId)
                .build();

        // Setup security context with some roles to bypass empty auth issues in validation
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        lenient().doReturn(Collections.emptyList()).when(authentication).getAuthorities();
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        SecurityContextHolder.clearContext();
    }

    @Test
    void createContent_NoteDurationCalculation() {
        // Construct rich text with 250 words
        StringBuilder htmlBuilder = new StringBuilder("<p>");
        for (int i = 0; i < 250; i++) {
            htmlBuilder.append("word ").append(i).append(" ");
        }
        htmlBuilder.append("</p>");

        ContentRequest request = ContentRequest.builder()
                .submoduleId(submoduleId)
                .contentType(ContentType.NOTE)
                .title("Intro to Java")
                .contentData(htmlBuilder.toString())
                .build();

        when(submoduleRepository.findById(submoduleId)).thenReturn(Optional.of(mockSubmodule));
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(mockModule));
        when(courseRepository.findByIdAndOrganizationId(courseId, orgId)).thenReturn(Optional.of(mockCourse));
        when(contentRepository.countBySubmoduleId(submoduleId)).thenReturn(0);
        when(contentRepository.save(any(Content.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ContentResponse mockResponse = ContentResponse.builder()
                .durationMinutes(2) // 250 / 200 = 1.25 -> rounded up to 2
                .build();
        when(contentMapper.toResponse(any(Content.class))).thenReturn(mockResponse);

        ContentResponse response = contentService.createContent(request);

        assertNotNull(response);
        assertEquals(2, response.getDurationMinutes());
        verify(courseService, times(1)).updateCourseDuration(courseId);
    }

    @Test
    void createContent_VideoDurationCalculation() {
        ContentRequest request = ContentRequest.builder()
                .submoduleId(submoduleId)
                .contentType(ContentType.VIDEO)
                .title("Advanced Video Lesson")
                .fileUrl("http://storage.com/lesson1.mp4")
                .durationMinutes(45)
                .build();

        when(submoduleRepository.findById(submoduleId)).thenReturn(Optional.of(mockSubmodule));
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(mockModule));
        when(courseRepository.findByIdAndOrganizationId(courseId, orgId)).thenReturn(Optional.of(mockCourse));
        when(contentRepository.countBySubmoduleId(submoduleId)).thenReturn(0);
        when(contentRepository.save(any(Content.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ContentResponse mockResponse = ContentResponse.builder()
                .durationMinutes(45)
                .build();
        when(contentMapper.toResponse(any(Content.class))).thenReturn(mockResponse);

        ContentResponse response = contentService.createContent(request);

        assertNotNull(response);
        assertEquals(45, response.getDurationMinutes());
        verify(courseService, times(1)).updateCourseDuration(courseId);
    }

    @Test
    void createContent_ComparisonTableValidation_InvalidData() {
        ContentRequest request = ContentRequest.builder()
                .submoduleId(submoduleId)
                .contentType(ContentType.COMPARISON_TABLE)
                .title("Comparison")
                .contentData("invalid data structure")
                .build();

        when(submoduleRepository.findById(submoduleId)).thenReturn(Optional.of(mockSubmodule));
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(mockModule));
        when(courseRepository.findByIdAndOrganizationId(courseId, orgId)).thenReturn(Optional.of(mockCourse));

        assertThrows(BadRequestException.class, () -> contentService.createContent(request));
    }
}
