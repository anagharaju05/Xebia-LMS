package com.xebia.lms.submodule;

import com.xebia.lms.submodule.dto.SubmoduleRequest;
import com.xebia.lms.submodule.dto.SubmoduleResponse;
import com.xebia.lms.util.ReorderRequest;

import java.util.UUID;

public interface SubmoduleService {
    SubmoduleResponse createSubmodule(SubmoduleRequest request);
    
    SubmoduleResponse updateSubmodule(UUID id, SubmoduleRequest request);
    
    void deleteSubmodule(UUID id);
    
    void reorderSubmodules(ReorderRequest request);

    java.util.List<SubmoduleResponse> getSubmodulesByModuleId(UUID moduleId);

    java.util.List<SubmoduleResponse> getAllSubmodules();

    SubmoduleResponse getSubmoduleById(UUID id);
}
