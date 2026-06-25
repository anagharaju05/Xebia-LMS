package com.xebia.lms.content.mapper;

import com.xebia.lms.content.Content;
import com.xebia.lms.content.dto.ContentResponse;
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
public class ContentMapperImpl implements ContentMapper {

    @Override
    public ContentResponse toResponse(Content content) {
        if ( content == null ) {
            return null;
        }

        ContentResponse.ContentResponseBuilder contentResponse = ContentResponse.builder();

        contentResponse.id( content.getId() );
        contentResponse.submoduleId( content.getSubmoduleId() );
        contentResponse.contentType( content.getContentType() );
        contentResponse.title( content.getTitle() );
        contentResponse.description( content.getDescription() );
        contentResponse.contentData( content.getContentData() );
        contentResponse.fileUrl( content.getFileUrl() );
        contentResponse.position( content.getPosition() );
        contentResponse.durationMinutes( content.getDurationMinutes() );
        contentResponse.createdAt( content.getCreatedAt() );
        contentResponse.updatedAt( content.getUpdatedAt() );

        return contentResponse.build();
    }

    @Override
    public List<ContentResponse> toResponseList(List<Content> contents) {
        if ( contents == null ) {
            return null;
        }

        List<ContentResponse> list = new ArrayList<ContentResponse>( contents.size() );
        for ( Content content : contents ) {
            list.add( toResponse( content ) );
        }

        return list;
    }
}
