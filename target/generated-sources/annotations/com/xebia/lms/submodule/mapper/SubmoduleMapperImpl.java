package com.xebia.lms.submodule.mapper;

import com.xebia.lms.submodule.Submodule;
import com.xebia.lms.submodule.dto.SubmoduleResponse;
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
public class SubmoduleMapperImpl implements SubmoduleMapper {

    @Override
    public SubmoduleResponse toResponse(Submodule submodule) {
        if ( submodule == null ) {
            return null;
        }

        SubmoduleResponse.SubmoduleResponseBuilder submoduleResponse = SubmoduleResponse.builder();

        submoduleResponse.id( submodule.getId() );
        submoduleResponse.moduleId( submodule.getModuleId() );
        submoduleResponse.name( submodule.getName() );
        submoduleResponse.description( submodule.getDescription() );
        submoduleResponse.position( submodule.getPosition() );
        submoduleResponse.createdAt( submodule.getCreatedAt() );
        submoduleResponse.updatedAt( submodule.getUpdatedAt() );

        return submoduleResponse.build();
    }

    @Override
    public List<SubmoduleResponse> toResponseList(List<Submodule> submodules) {
        if ( submodules == null ) {
            return null;
        }

        List<SubmoduleResponse> list = new ArrayList<SubmoduleResponse>( submodules.size() );
        for ( Submodule submodule : submodules ) {
            list.add( toResponse( submodule ) );
        }

        return list;
    }
}
