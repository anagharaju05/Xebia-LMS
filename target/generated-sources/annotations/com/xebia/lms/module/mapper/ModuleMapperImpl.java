package com.xebia.lms.module.mapper;

import com.xebia.lms.module.Module;
import com.xebia.lms.module.dto.ModuleResponse;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-24T22:23:44+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.19 (Eclipse Adoptium)"
)
@Component
public class ModuleMapperImpl implements ModuleMapper {

    @Override
    public ModuleResponse toResponse(Module module) {
        if ( module == null ) {
            return null;
        }

        ModuleResponse.ModuleResponseBuilder moduleResponse = ModuleResponse.builder();

        moduleResponse.id( module.getId() );
        moduleResponse.courseId( module.getCourseId() );
        moduleResponse.name( module.getName() );
        moduleResponse.description( module.getDescription() );
        moduleResponse.position( module.getPosition() );
        moduleResponse.createdAt( module.getCreatedAt() );
        moduleResponse.updatedAt( module.getUpdatedAt() );

        return moduleResponse.build();
    }

    @Override
    public List<ModuleResponse> toResponseList(List<Module> modules) {
        if ( modules == null ) {
            return null;
        }

        List<ModuleResponse> list = new ArrayList<ModuleResponse>( modules.size() );
        for ( Module module : modules ) {
            list.add( toResponse( module ) );
        }

        return list;
    }
}
