package com.xebia.lms.module;

import com.xebia.lms.module.dto.ModuleRequest;
import com.xebia.lms.module.dto.ModuleResponse;
import com.xebia.lms.util.ReorderRequest;

import java.util.UUID;

public interface ModuleService {
    ModuleResponse createModule(ModuleRequest request);
    
    ModuleResponse updateModule(UUID id, ModuleRequest request);
    
    void deleteModule(UUID id);
    
    void reorderModules(ReorderRequest request);

    java.util.List<ModuleResponse> getModulesByCourseId(UUID courseId);

    java.util.List<ModuleResponse> getAllModules();

    ModuleResponse getModuleById(UUID id);
}
