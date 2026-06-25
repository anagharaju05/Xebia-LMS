package com.xebia.lms.submodule;

import com.xebia.lms.submodule.dto.SubmoduleRequest;
import com.xebia.lms.submodule.dto.SubmoduleResponse;
import com.xebia.lms.util.ReorderRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/submodules")
@RequiredArgsConstructor
@Tag(name = "Submodule Management", description = "Endpoints for managing submodules inside course modules.")
public class SubmoduleController {

    private final SubmoduleService submoduleService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'ORGANISER')")
    @Operation(summary = "Create a new submodule", description = "Allows Admin, Trainer, or Organiser to create a new submodule in a module.")
    public SubmoduleResponse createSubmodule(@Valid @RequestBody SubmoduleRequest request) {
        return submoduleService.createSubmodule(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'ORGANISER')")
    @Operation(summary = "Update submodule details", description = "Allows Admin, Trainer, or Organiser to update submodule details.")
    public SubmoduleResponse updateSubmodule(@PathVariable UUID id, @Valid @RequestBody SubmoduleRequest request) {
        return submoduleService.updateSubmodule(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'ORGANISER')")
    @Operation(summary = "Delete a submodule", description = "Allows Admin, Trainer, or Organiser to delete a submodule.")
    public void deleteSubmodule(@PathVariable UUID id) {
        submoduleService.deleteSubmodule(id);
    }

    @PostMapping("/reorder")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'ORGANISER')")
    @Operation(summary = "Reorder submodules in a module", description = "Allows Admin, Trainer, or Organiser to reorder submodules using drag-and-drop order.")
    public void reorderSubmodules(@Valid @RequestBody ReorderRequest request) {
        submoduleService.reorderSubmodules(request);
    }

    @GetMapping("/module/{moduleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'ORGANISER', 'STUDENT')")
    @Operation(summary = "Get submodules by module ID", description = "Retrieves all submodules of a module sorted by position.")
    public java.util.List<SubmoduleResponse> getSubmodulesByModuleId(@PathVariable UUID moduleId) {
        return submoduleService.getSubmodulesByModuleId(moduleId);
    }

    @GetMapping("/module/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'ORGANISER', 'STUDENT')")
    @Operation(summary = "Get all submodules across all modules", description = "Retrieves all submodules across all modules for the tenant organization.")
    public java.util.List<SubmoduleResponse> getAllSubmodules() {
        return submoduleService.getAllSubmodules();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'ORGANISER', 'STUDENT')")
    @Operation(summary = "Get submodule by ID", description = "Retrieves a submodule by its unique identifier.")
    public SubmoduleResponse getSubmoduleById(@PathVariable UUID id) {
        return submoduleService.getSubmoduleById(id);
    }
}
