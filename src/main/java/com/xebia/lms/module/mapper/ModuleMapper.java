package com.xebia.lms.module.mapper;

import com.xebia.lms.module.Module;
import com.xebia.lms.module.dto.ModuleResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ModuleMapper {
    
    ModuleResponse toResponse(Module module);
    
    List<ModuleResponse> toResponseList(List<Module> modules);
}
