package com.xebia.lms.content;

import com.xebia.lms.course.Course;
import com.xebia.lms.course.CourseRepository;
import com.xebia.lms.course.CourseService;
import com.xebia.lms.course.CourseStatus;
import com.xebia.lms.exception.BadRequestException;
import com.xebia.lms.exception.ResourceNotFoundException;
import com.xebia.lms.security.TenantContext;
import com.xebia.lms.submodule.Submodule;
import com.xebia.lms.submodule.SubmoduleRepository;
import com.xebia.lms.content.dto.ContentRequest;
import com.xebia.lms.content.dto.ContentResponse;
import com.xebia.lms.content.mapper.ContentMapper;
import com.xebia.lms.module.Module;
import com.xebia.lms.module.ModuleRepository;
import com.xebia.lms.util.ReorderRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class ContentServiceImpl implements ContentService {

    private final ContentRepository contentRepository;
    private final SubmoduleRepository submoduleRepository;
    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;
    private final ContentMapper contentMapper;
    
    @Lazy
    private final CourseService courseService;

    @Override
    @Transactional
    public ContentResponse createContent(ContentRequest request) {
        UUID orgId = TenantContext.getCurrentTenant();
        Submodule submodule = submoduleRepository.findById(request.getSubmoduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found"));

        // Navigate to course to verify tenant scope
        Course course = getCourseFromSubmodule(submodule, orgId);
        validateWriteAccess(course);

        int count = contentRepository.countBySubmoduleId(request.getSubmoduleId());
        int calculatedDuration = calculateDuration(request);

        // Process special content type data formats
        String processedData = processContentData(request);

        Content content = Content.builder()
                .id(UUID.randomUUID())
                .submoduleId(request.getSubmoduleId())
                .contentType(request.getContentType())
                .title(request.getTitle())
                .description(request.getDescription())
                .contentData(processedData)
                .fileUrl(request.getFileUrl())
                .position(count + 1)
                .durationMinutes(calculatedDuration)
                .build();

        Content saved = contentRepository.save(content);

        // Trigger Course Duration Recalculation
        courseService.updateCourseDuration(course.getId());

        // For video type, trigger async HLS pipeline simulation
        if (request.getContentType() == ContentType.VIDEO) {
            triggerHlsConversionPipeline(saved.getId(), course.getId());
        }

        ContentResponse response = contentMapper.toResponse(saved);
        response.setCourseName(course.getCourseName());
        return response;
    }

    @Override
    @Transactional
    public ContentResponse updateContent(UUID id, ContentRequest request) {
        UUID orgId = TenantContext.getCurrentTenant();
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));

        Submodule submodule = submoduleRepository.findById(content.getSubmoduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found"));

        Course course = getCourseFromSubmodule(submodule, orgId);
        validateWriteAccess(course);

        // If changing submodule, validate new submodule
        if (!content.getSubmoduleId().equals(request.getSubmoduleId())) {
            Submodule newSubmodule = submoduleRepository.findById(request.getSubmoduleId())
                    .orElseThrow(() -> new ResourceNotFoundException("New Submodule not found"));
            Course newCourse = getCourseFromSubmodule(newSubmodule, orgId);
            validateWriteAccess(newCourse);
            
            content.setSubmoduleId(request.getSubmoduleId());
            int newCount = contentRepository.countBySubmoduleId(request.getSubmoduleId());
            content.setPosition(newCount + 1);
        }

        int calculatedDuration = calculateDuration(request);
        String processedData = processContentData(request);

        content.setContentType(request.getContentType());
        content.setTitle(request.getTitle());
        content.setDescription(request.getDescription());
        content.setContentData(processedData);
        content.setFileUrl(request.getFileUrl());
        content.setDurationMinutes(calculatedDuration);

        Content updated = contentRepository.save(content);

        // Trigger Course Duration Recalculation
        courseService.updateCourseDuration(course.getId());

        // For video type, trigger async HLS pipeline simulation
        if (request.getContentType() == ContentType.VIDEO) {
            triggerHlsConversionPipeline(updated.getId(), course.getId());
        }

        ContentResponse response = contentMapper.toResponse(updated);
        response.setCourseName(course.getCourseName());
        return response;
    }

    @Override
    @Transactional
    public void deleteContent(UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));

        Submodule submodule = submoduleRepository.findById(content.getSubmoduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found"));

        Course course = getCourseFromSubmodule(submodule, orgId);
        validateWriteAccess(course);

        contentRepository.delete(content);

        // Trigger Course Duration Recalculation
        courseService.updateCourseDuration(course.getId());
    }

    @Override
    @Transactional
    public void reorderContent(ReorderRequest request) {
        UUID orgId = TenantContext.getCurrentTenant();
        if (request.getIds() == null || request.getIds().isEmpty()) {
            throw new BadRequestException("Content IDs list to reorder cannot be empty");
        }

        UUID firstId = request.getIds().get(0);
        Content firstContent = contentRepository.findById(firstId)
                .orElseThrow(() -> new ResourceNotFoundException("Content " + firstId + " not found"));
        UUID submoduleId = firstContent.getSubmoduleId();

        Submodule submodule = submoduleRepository.findById(submoduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found"));

        Course course = getCourseFromSubmodule(submodule, orgId);
        validateWriteAccess(course);

        // Update positions sequentially
        for (int i = 0; i < request.getIds().size(); i++) {
            UUID id = request.getIds().get(i);
            Content content = contentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Content " + id + " not found"));
            
            if (!content.getSubmoduleId().equals(submoduleId)) {
                throw new BadRequestException("All content in the reorder request must belong to the same submodule");
            }
            
            content.setPosition(i + 1);
            contentRepository.save(content);
        }
    }

    private Course getCourseFromSubmodule(Submodule submodule, UUID orgId) {
        com.xebia.lms.module.Module module = com.xebia.lms.module.Module.builder().build();
        // Since we need module.courseId:
        UUID moduleId = submodule.getModuleId();
        com.xebia.lms.module.Module parentModule = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent module of submodule not found"));
        
        return courseRepository.findByIdAndOrganizationId(parentModule.getCourseId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for this organization"));
    }

    private void validateWriteAccess(Course course) {
        // No-op: Authorization checks disabled
    }

    private int calculateDuration(ContentRequest request) {
        if (request.getContentType() == ContentType.NOTE) {
            String html = request.getContentData();
            if (html == null || html.isBlank()) {
                return 0;
            }
            // Strip tags
            String text = html.replaceAll("<[^>]*>", " ").trim();
            if (text.isEmpty()) {
                return 0;
            }
            String[] words = text.split("\\s+");
            // Rich Text Notes = 200 words/minute. Round up.
            return (int) Math.ceil((double) words.length / 200.0);
        } else {
            // Videos = Actual Duration, others default to provided duration or 0
            return request.getDurationMinutes() != null ? request.getDurationMinutes() : 0;
        }
    }

    private String processContentData(ContentRequest request) {
        String data = request.getContentData();
        if (request.getContentType() == ContentType.COMPARISON_TABLE) {
            if (data == null || data.isBlank()) {
                return "{\"columns\":[],\"rows\":[]}";
            }
            // Simple structure check
            if (!data.contains("columns") || !data.contains("rows")) {
                throw new BadRequestException("Comparison table data must contain 'columns' and 'rows' fields");
            }
        }
        return data;
    }

    private void triggerHlsConversionPipeline(UUID contentId, UUID courseId) {
        CompletableFuture.runAsync(() -> {
            try {
                // Simulate processing delay (e.g. 2 seconds)
                Thread.sleep(2000);
                
                Content content = contentRepository.findById(contentId).orElse(null);
                if (content != null && content.getContentType() == ContentType.VIDEO) {
                    String fileUrl = content.getFileUrl();
                    String streamingUrl = "";
                    if (fileUrl != null && !fileUrl.isBlank()) {
                        int idx = fileUrl.lastIndexOf('.');
                        String base = idx > 0 ? fileUrl.substring(0, idx) : fileUrl;
                        streamingUrl = base + "/playlist.m3u8";
                    } else {
                        streamingUrl = "/files/video-" + contentId + "/playlist.m3u8";
                    }

                    // Extract original fileName and fileSize from existing contentData before overwriting it
                    String existingData = content.getContentData();
                    String fileName = "";
                    String fileSize = "";
                    if (existingData != null && !existingData.isBlank()) {
                        int fnIdx = existingData.indexOf("\"fileName\":\"");
                        if (fnIdx != -1) {
                            int fnStart = fnIdx + 12;
                            int fnEnd = existingData.indexOf("\"", fnStart);
                            if (fnEnd != -1) {
                                fileName = existingData.substring(fnStart, fnEnd);
                            }
                        }
                        int fsIdx = existingData.indexOf("\"fileSize\":\"");
                        if (fsIdx != -1) {
                            int fsStart = fsIdx + 12;
                            int fsEnd = existingData.indexOf("\"", fsStart);
                            if (fsEnd != -1) {
                                fileSize = existingData.substring(fsStart, fsEnd);
                            }
                        }
                    }

                    // Format HLS output details inside contentData
                    String hlsData = String.format(
                            "{\"originalFileUrl\":\"%s\",\"streamingUrl\":\"%s\",\"size\":\"%s\",\"status\":\"READY\",\"fileName\":\"%s\",\"fileSize\":\"%s\"}",
                            fileUrl != null ? fileUrl : "",
                            streamingUrl,
                            fileSize.isEmpty() ? "10.4MB" : fileSize,
                            fileName,
                            fileSize
                    );
                    
                    content.setContentData(hlsData);
                    contentRepository.save(content);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<ContentResponse> getContentBySubmoduleId(UUID submoduleId) {
        UUID orgId = TenantContext.getCurrentTenant();
        Submodule submodule = submoduleRepository.findById(submoduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found"));

        // Navigate to course to verify tenant scope
        Course course = getCourseFromSubmodule(submodule, orgId);

        List<Content> contents = contentRepository.findAllBySubmoduleIdOrderByPositionAsc(submoduleId);
        List<ContentResponse> responses = contentMapper.toResponseList(contents);
        for (ContentResponse response : responses) {
            response.setCourseName(course.getCourseName());
        }
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<ContentResponse> getAllContents() {
        UUID orgId = TenantContext.getCurrentTenant();
        List<Course> courses = courseRepository.findAllByOrganizationId(orgId);
        if (courses.isEmpty()) {
            return List.of();
        }
        java.util.Map<UUID, String> courseNameMap = courses.stream()
                .collect(java.util.stream.Collectors.toMap(Course::getId, Course::getCourseName));
        List<UUID> courseIds = courses.stream().map(Course::getId).collect(java.util.stream.Collectors.toList());

        List<Module> modules = moduleRepository.findAllByCourseIdIn(courseIds);
        if (modules.isEmpty()) {
            return List.of();
        }
        List<UUID> moduleIds = modules.stream().map(Module::getId).collect(java.util.stream.Collectors.toList());

        List<Submodule> submodules = submoduleRepository.findAllByModuleIdIn(moduleIds);
        if (submodules.isEmpty()) {
            return List.of();
        }
        java.util.Map<UUID, UUID> submoduleToCourseIdMap = new java.util.HashMap<>();
        for (Submodule submodule : submodules) {
            UUID moduleId = submodule.getModuleId();
            Module module = modules.stream().filter(m -> m.getId().equals(moduleId)).findFirst().orElse(null);
            if (module != null) {
                submoduleToCourseIdMap.put(submodule.getId(), module.getCourseId());
            }
        }
        List<UUID> submoduleIds = submodules.stream().map(Submodule::getId).collect(java.util.stream.Collectors.toList());

        List<Content> contents = contentRepository.findAllBySubmoduleIdIn(submoduleIds);
        List<ContentResponse> responses = contentMapper.toResponseList(contents);
        for (ContentResponse response : responses) {
            UUID courseId = submoduleToCourseIdMap.get(response.getSubmoduleId());
            if (courseId != null) {
                response.setCourseName(courseNameMap.getOrDefault(courseId, ""));
            }
        }
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public ContentResponse getContentById(UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));

        Submodule submodule = submoduleRepository.findById(content.getSubmoduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found"));

        Course course = getCourseFromSubmodule(submodule, orgId);

        ContentResponse response = contentMapper.toResponse(content);
        response.setCourseName(course.getCourseName());
        return response;
    }
}
