package com.xebia.lms.submodule;

import com.xebia.lms.course.Course;
import com.xebia.lms.course.CourseRepository;
import com.xebia.lms.course.CourseService;
import com.xebia.lms.course.CourseStatus;
import com.xebia.lms.exception.BadRequestException;
import com.xebia.lms.exception.ResourceNotFoundException;
import com.xebia.lms.module.Module;
import com.xebia.lms.module.ModuleRepository;
import com.xebia.lms.security.TenantContext;
import com.xebia.lms.submodule.dto.SubmoduleRequest;
import com.xebia.lms.submodule.dto.SubmoduleResponse;
import com.xebia.lms.submodule.mapper.SubmoduleMapper;
import com.xebia.lms.util.ReorderRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubmoduleServiceImpl implements SubmoduleService {

    private final SubmoduleRepository submoduleRepository;
    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;
    private final SubmoduleMapper submoduleMapper;
    
    @Lazy
    private final CourseService courseService;

    @Override
    @Transactional
    public SubmoduleResponse createSubmodule(SubmoduleRequest request) {
        UUID orgId = TenantContext.getCurrentTenant();
        Module module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        Course course = courseRepository.findByIdAndOrganizationId(module.getCourseId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for this organization"));

        validateWriteAccess(course);

        int count = submoduleRepository.countByModuleId(request.getModuleId());

        Submodule submodule = Submodule.builder()
                .id(UUID.randomUUID())
                .moduleId(request.getModuleId())
                .name(request.getName())
                .description(request.getDescription())
                .position(count + 1)
                .build();

        Submodule saved = submoduleRepository.save(submodule);
        return submoduleMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public SubmoduleResponse updateSubmodule(UUID id, SubmoduleRequest request) {
        UUID orgId = TenantContext.getCurrentTenant();
        Submodule submodule = submoduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found"));

        Module module = moduleRepository.findById(submodule.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        Course course = courseRepository.findByIdAndOrganizationId(module.getCourseId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for this organization"));

        validateWriteAccess(course);

        // If changing module ID, validate new module context
        if (!submodule.getModuleId().equals(request.getModuleId())) {
            Module newModule = moduleRepository.findById(request.getModuleId())
                    .orElseThrow(() -> new ResourceNotFoundException("New Module not found"));
            
            Course newCourse = courseRepository.findByIdAndOrganizationId(newModule.getCourseId(), orgId)
                    .orElseThrow(() -> new ResourceNotFoundException("New parent Course not found for this organization"));
            
            validateWriteAccess(newCourse);
            submodule.setModuleId(request.getModuleId());
            int count = submoduleRepository.countByModuleId(request.getModuleId());
            submodule.setPosition(count + 1);
        }

        submodule.setName(request.getName());
        submodule.setDescription(request.getDescription());

        Submodule updated = submoduleRepository.save(submodule);
        return submoduleMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteSubmodule(UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        Submodule submodule = submoduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found"));

        Module module = moduleRepository.findById(submodule.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        Course course = courseRepository.findByIdAndOrganizationId(module.getCourseId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for this organization"));

        validateWriteAccess(course);

        submoduleRepository.delete(submodule);
        
        // Recalculate duration of course since this submodule and its content are deleted
        courseService.updateCourseDuration(course.getId());
    }

    @Override
    @Transactional
    public void reorderSubmodules(ReorderRequest request) {
        UUID orgId = TenantContext.getCurrentTenant();
        if (request.getIds() == null || request.getIds().isEmpty()) {
            throw new BadRequestException("Submodule IDs list to reorder cannot be empty");
        }

        UUID firstId = request.getIds().get(0);
        Submodule firstSubmodule = submoduleRepository.findById(firstId)
                .orElseThrow(() -> new ResourceNotFoundException("Submodule " + firstId + " not found"));
        UUID moduleId = firstSubmodule.getModuleId();

        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        Course course = courseRepository.findByIdAndOrganizationId(module.getCourseId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for this organization"));

        validateWriteAccess(course);

        // Update positions sequentially
        for (int i = 0; i < request.getIds().size(); i++) {
            UUID id = request.getIds().get(i);
            Submodule submodule = submoduleRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Submodule " + id + " not found"));
            
            if (!submodule.getModuleId().equals(moduleId)) {
                throw new BadRequestException("All submodules in the reorder request must belong to the same module");
            }
            
            submodule.setPosition(i + 1);
            submoduleRepository.save(submodule);
        }
    }

    private void validateWriteAccess(Course course) {
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

    @Override
    @Transactional(readOnly = true)
    public java.util.List<SubmoduleResponse> getSubmodulesByModuleId(UUID moduleId) {
        UUID orgId = TenantContext.getCurrentTenant();
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        courseRepository.findByIdAndOrganizationId(module.getCourseId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for this organization"));

        List<Submodule> submodules = submoduleRepository.findAllByModuleIdOrderByPositionAsc(moduleId);
        return submoduleMapper.toResponseList(submodules);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<SubmoduleResponse> getAllSubmodules() {
        UUID orgId = TenantContext.getCurrentTenant();
        List<Course> courses = courseRepository.findAllByOrganizationId(orgId);
        if (courses.isEmpty()) {
            return List.of();
        }
        List<UUID> courseIds = courses.stream().map(Course::getId).collect(java.util.stream.Collectors.toList());

        List<Module> modules = moduleRepository.findAllByCourseIdIn(courseIds);
        if (modules.isEmpty()) {
            return List.of();
        }
        List<UUID> moduleIds = modules.stream().map(Module::getId).collect(java.util.stream.Collectors.toList());

        List<Submodule> submodules = submoduleRepository.findAllByModuleIdIn(moduleIds);
        return submoduleMapper.toResponseList(submodules);
    }

    @Override
    @Transactional(readOnly = true)
    public SubmoduleResponse getSubmoduleById(UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        Submodule submodule = submoduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found"));

        Module module = moduleRepository.findById(submodule.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        courseRepository.findByIdAndOrganizationId(module.getCourseId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for this organization"));

        return submoduleMapper.toResponse(submodule);
    }
}
