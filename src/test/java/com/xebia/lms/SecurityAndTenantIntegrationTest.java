package com.xebia.lms;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xebia.lms.category.Category;
import com.xebia.lms.category.CategoryRepository;
import com.xebia.lms.course.CourseDifficulty;
import com.xebia.lms.course.dto.CourseRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class SecurityAndTenantIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID tenantA;
    private UUID tenantB;
    private Category categoryA;

    @BeforeEach
    void setUp() {
        tenantA = UUID.randomUUID();
        tenantB = UUID.randomUUID();

        // Create tenant-isolated category
        categoryA = Category.builder()
                .id(UUID.randomUUID())
                .organizationId(tenantA)
                .name("Software")
                .status("ACTIVE")
                .build();
        categoryRepository.save(categoryA);
    }

    @Test
    void createCourse_Success_AsTrainer() throws Exception {
        CourseRequest request = CourseRequest.builder()
                .categoryId(categoryA.getId())
                .trainerId(UUID.randomUUID())
                .courseCode("INT-001")
                .courseName("Integration Testing")
                .difficulty(CourseDifficulty.INTERMEDIATE)
                .build();

        mockMvc.perform(post("/api/courses")
                        .header("X-Organization-ID", tenantA.toString())
                        .header("X-User-Id", UUID.randomUUID().toString())
                        .header("X-User-Role", "TRAINER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.courseCode").value("INT-001"))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void createCourse_Forbidden_AsStudent() throws Exception {
        CourseRequest request = CourseRequest.builder()
                .categoryId(categoryA.getId())
                .trainerId(UUID.randomUUID())
                .courseCode("INT-002")
                .courseName("Integration Testing Student")
                .difficulty(CourseDifficulty.INTERMEDIATE)
                .build();

        mockMvc.perform(post("/api/courses")
                        .header("X-Organization-ID", tenantA.toString())
                        .header("X-User-Id", UUID.randomUUID().toString())
                        .header("X-User-Role", "STUDENT")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void getCourses_TenantIsolation_ShieldedData() throws Exception {
        // First create a course in tenant A
        CourseRequest request = CourseRequest.builder()
                .categoryId(categoryA.getId())
                .trainerId(UUID.randomUUID())
                .courseCode("INT-003")
                .courseName("Integration Testing Isolation")
                .difficulty(CourseDifficulty.INTERMEDIATE)
                .build();

        mockMvc.perform(post("/api/courses")
                        .header("X-Organization-ID", tenantA.toString())
                        .header("X-User-Id", UUID.randomUUID().toString())
                        .header("X-User-Role", "TRAINER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Query courses for Tenant A -> Should find 1 course
        mockMvc.perform(get("/api/courses")
                        .header("X-Organization-ID", tenantA.toString())
                        .header("X-User-Id", UUID.randomUUID().toString())
                        .header("X-User-Role", "TRAINER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        // Query courses for Tenant B -> Should find 0 courses (Isolated!)
        mockMvc.perform(get("/api/courses")
                        .header("X-Organization-ID", tenantB.toString())
                        .header("X-User-Id", UUID.randomUUID().toString())
                        .header("X-User-Role", "TRAINER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void missingTenantHeader_BadRequest() throws Exception {
        mockMvc.perform(get("/api/courses")
                        .header("X-User-Id", UUID.randomUUID().toString())
                        .header("X-User-Role", "TRAINER"))
                .andExpect(status().isBadRequest());
    }
}
