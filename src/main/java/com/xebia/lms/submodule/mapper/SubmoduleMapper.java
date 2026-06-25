package com.xebia.lms.submodule.mapper;

import com.xebia.lms.submodule.Submodule;
import com.xebia.lms.submodule.dto.SubmoduleResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SubmoduleMapper {
    
    SubmoduleResponse toResponse(Submodule submodule);
    
    List<SubmoduleResponse> toResponseList(List<Submodule> submodules);
}
