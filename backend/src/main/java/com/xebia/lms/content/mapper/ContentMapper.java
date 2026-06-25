package com.xebia.lms.content.mapper;

import com.xebia.lms.content.Content;
import com.xebia.lms.content.dto.ContentResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ContentMapper {
    
    ContentResponse toResponse(Content content);
    
    List<ContentResponse> toResponseList(List<Content> contents);
}
