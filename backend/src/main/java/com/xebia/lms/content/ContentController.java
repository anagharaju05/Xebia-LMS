package com.xebia.lms.content;

import com.xebia.lms.content.dto.ContentRequest;
import com.xebia.lms.content.dto.ContentResponse;
import com.xebia.lms.util.ReorderRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
@Tag(name = "Content Management", description = "Endpoints for managing content items (Notes, Videos, PPTs, PDFs) in submodules.")
public class ContentController {

    private final ContentService contentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new content item", description = "Allows Admin, Trainer, or Organiser to create content (e.g. Note, Video, PDF). Word count reading time is calculated dynamically.")
    public ContentResponse createContent(@Valid @RequestBody ContentRequest request) {
        return contentService.createContent(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update content item details", description = "Allows Admin, Trainer, or Organiser to update details. Duration is automatically updated.")
    public ContentResponse updateContent(@PathVariable UUID id, @Valid @RequestBody ContentRequest request) {
        return contentService.updateContent(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete content item", description = "Allows Admin, Trainer, or Organiser to delete content.")
    public void deleteContent(@PathVariable UUID id) {
        contentService.deleteContent(id);
    }

    @PostMapping("/reorder")
    @Operation(summary = "Reorder content items inside a submodule", description = "Allows Admin, Trainer, or Organiser to reorder content items using drag-and-drop order.")
    public void reorderContent(@Valid @RequestBody ReorderRequest request) {
        contentService.reorderContent(request);
    }

    @GetMapping("/submodule/{submoduleId}")
    @Operation(summary = "Get content items by submodule ID", description = "Retrieves all content items of a submodule sorted by position.")
    public java.util.List<ContentResponse> getContentBySubmoduleId(@PathVariable UUID submoduleId) {
        return contentService.getContentBySubmoduleId(submoduleId);
    }

    @GetMapping
    @Operation(summary = "Get all content items", description = "Retrieves all content items for the organization tenant.")
    public java.util.List<ContentResponse> getAllContents() {
        return contentService.getAllContents();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get content item by ID", description = "Retrieves a content item by its unique identifier.")
    public ContentResponse getContentById(@PathVariable UUID id) {
        return contentService.getContentById(id);
    }
}
