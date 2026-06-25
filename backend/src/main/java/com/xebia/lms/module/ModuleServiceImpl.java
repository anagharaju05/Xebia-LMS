package com.xebia.lms.module;

import com.xebia.lms.course.Course;
import com.xebia.lms.course.CourseRepository;
import com.xebia.lms.course.CourseService;
import com.xebia.lms.course.CourseStatus;
import com.xebia.lms.exception.BadRequestException;
import com.xebia.lms.exception.ResourceNotFoundException;
import com.xebia.lms.module.dto.ModuleRequest;
import com.xebia.lms.module.dto.ModuleResponse;
import com.xebia.lms.module.mapper.ModuleMapper;
import com.xebia.lms.security.TenantContext;
import com.xebia.lms.util.ReorderRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;

import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ModuleServiceImpl implements ModuleService {

    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;
    private final ModuleMapper moduleMapper;
    
    @Lazy
    private final CourseService courseService;

    @Override
    @Transactional
    public ModuleResponse createModule(ModuleRequest request) {
        UUID orgId = TenantContext.getCurrentTenant();
        Course course = courseRepository.findByIdAndOrganizationId(request.getCourseId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for this organization"));

        validateWriteAccess(course);

        int count = moduleRepository.countByCourseId(request.getCourseId());

        Module module = Module.builder()
                .id(UUID.randomUUID())
                .courseId(request.getCourseId())
                .name(request.getName())
                .description(request.getDescription())
                .position(count + 1)
                .build();

        Module saved = moduleRepository.save(module);
        ModuleResponse response = moduleMapper.toResponse(saved);
        response.setCourseName(course.getCourseName());
        return response;
    }

    @Override
    @Transactional
    public ModuleResponse updateModule(UUID id, ModuleRequest request) {
        UUID orgId = TenantContext.getCurrentTenant();
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        // Validate course access (implicitly checks organization)
        Course course = courseRepository.findByIdAndOrganizationId(module.getCourseId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for this organization"));

        validateWriteAccess(course);

        Course targetCourse = course;
        // If trying to change course, validate new course
        if (!module.getCourseId().equals(request.getCourseId())) {
            Course newCourse = courseRepository.findByIdAndOrganizationId(request.getCourseId(), orgId)
                    .orElseThrow(() -> new ResourceNotFoundException("New course not found for this organization"));
            validateWriteAccess(newCourse);
            module.setCourseId(request.getCourseId());
            int newCount = moduleRepository.countByCourseId(request.getCourseId());
            module.setPosition(newCount + 1);
            targetCourse = newCourse;
        }

        module.setName(request.getName());
        module.setDescription(request.getDescription());

        Module updated = moduleRepository.save(module);
        ModuleResponse response = moduleMapper.toResponse(updated);
        response.setCourseName(targetCourse.getCourseName());
        return response;
    }

    @Override
    @Transactional
    public void deleteModule(UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        Course course = courseRepository.findByIdAndOrganizationId(module.getCourseId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for this organization"));

        validateWriteAccess(course);

        moduleRepository.delete(module);
        
        // Recalculate duration of course since this module and its content are deleted
        courseService.updateCourseDuration(course.getId());
    }

    @Override
    @Transactional
    public void reorderModules(ReorderRequest request) {
        UUID orgId = TenantContext.getCurrentTenant();
        if (request.getIds() == null || request.getIds().isEmpty()) {
            throw new BadRequestException("Module IDs list to reorder cannot be empty");
        }

        // Retrieve first module to determine course context
        UUID firstId = request.getIds().get(0);
        Module firstModule = moduleRepository.findById(firstId)
                .orElseThrow(() -> new ResourceNotFoundException("Module " + firstId + " not found"));
        UUID courseId = firstModule.getCourseId();

        Course course = courseRepository.findByIdAndOrganizationId(courseId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for this organization"));

        validateWriteAccess(course);

        // Update positions sequentially
        for (int i = 0; i < request.getIds().size(); i++) {
            UUID id = request.getIds().get(i);
            Module module = moduleRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Module " + id + " not found"));
            
            if (!module.getCourseId().equals(courseId)) {
                throw new BadRequestException("All modules in the reorder request must belong to the same course");
            }
            
            module.setPosition(i + 1);
            moduleRepository.save(module);
        }
    }

    private void validateWriteAccess(Course course) {
        // No-op: Authorization checks disabled
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<ModuleResponse> getModulesByCourseId(UUID courseId) {
        UUID orgId = TenantContext.getCurrentTenant();
        Course course = courseRepository.findByIdAndOrganizationId(courseId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for this organization"));

        List<Module> modules = moduleRepository.findAllByCourseIdOrderByPositionAsc(courseId);
        List<ModuleResponse> responses = moduleMapper.toResponseList(modules);
        for (ModuleResponse response : responses) {
            response.setCourseName(course.getCourseName());
        }
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<ModuleResponse> getAllModules() {
        UUID orgId = TenantContext.getCurrentTenant();
        List<Course> courses = courseRepository.findAllByOrganizationId(orgId);
        if (courses.isEmpty()) {
            return List.of();
        }

        java.util.Map<UUID, String> courseNameMap = courses.stream()
                .collect(java.util.stream.Collectors.toMap(Course::getId, Course::getCourseName));

        List<UUID> courseIds = courses.stream().map(Course::getId).collect(java.util.stream.Collectors.toList());
        List<Module> modules = moduleRepository.findAllByCourseIdIn(courseIds);

        List<ModuleResponse> responses = moduleMapper.toResponseList(modules);
        for (ModuleResponse response : responses) {
            response.setCourseName(courseNameMap.getOrDefault(response.getCourseId(), ""));
        }
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public ModuleResponse getModuleById(UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        Course course = courseRepository.findByIdAndOrganizationId(module.getCourseId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for this organization"));

        ModuleResponse response = moduleMapper.toResponse(module);
        response.setCourseName(course.getCourseName());
        return response;
    }
}
