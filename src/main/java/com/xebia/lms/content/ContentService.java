package com.xebia.lms.content;

import com.xebia.lms.content.dto.ContentRequest;
import com.xebia.lms.content.dto.ContentResponse;
import com.xebia.lms.util.ReorderRequest;

import java.util.UUID;

public interface ContentService {
    ContentResponse createContent(ContentRequest request);
    
    ContentResponse updateContent(UUID id, ContentRequest request);
    
    void deleteContent(UUID id);
    
    void reorderContent(ReorderRequest request);

    java.util.List<ContentResponse> getContentBySubmoduleId(UUID submoduleId);

    java.util.List<ContentResponse> getAllContents();

    ContentResponse getContentById(UUID id);
}
