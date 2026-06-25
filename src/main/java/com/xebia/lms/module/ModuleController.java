package com.xebia.lms.module;

import com.xebia.lms.module.dto.ModuleRequest;
import com.xebia.lms.module.dto.ModuleResponse;
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
@RequestMapping("/api/modules")
@RequiredArgsConstructor
@Tag(name = "Module Management", description = "Endpoints for managing course modules and their sequential positions.")
public class ModuleController {

    private final ModuleService moduleService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'ORGANISER')")
    @Operation(summary = "Create a new module", description = "Allows Admin, Trainer, or Organiser to create a new module in a course.")
    public ModuleResponse createModule(@Valid @RequestBody ModuleRequest request) {
        return moduleService.createModule(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'ORGANISER')")
    @Operation(summary = "Update module details", description = "Allows Admin, Trainer, or Organiser to update module details.")
    public ModuleResponse updateModule(@PathVariable UUID id, @Valid @RequestBody ModuleRequest request) {
        return moduleService.updateModule(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'ORGANISER')")
    @Operation(summary = "Delete a module", description = "Allows Admin, Trainer, or Organiser to delete a module.")
    public void deleteModule(@PathVariable UUID id) {
        moduleService.deleteModule(id);
    }

    @PostMapping("/reorder")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'ORGANISER')")
    @Operation(summary = "Reorder modules in a course", description = "Allows Admin, Trainer, or Organiser to reorder modules using drag-and-drop order.")
    public void reorderModules(@Valid @RequestBody ReorderRequest request) {
        moduleService.reorderModules(request);
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'ORGANISER', 'STUDENT')")
    @Operation(summary = "Get modules by course ID", description = "Retrieves all modules of a course sorted by position.")
    public java.util.List<ModuleResponse> getModulesByCourseId(@PathVariable UUID courseId) {
        return moduleService.getModulesByCourseId(courseId);
    }

    @GetMapping("/course/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'ORGANISER', 'STUDENT')")
    @Operation(summary = "Get all modules across all courses", description = "Retrieves all modules across all courses for the tenant organization.")
    public java.util.List<ModuleResponse> getAllModules() {
        return moduleService.getAllModules();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'ORGANISER', 'STUDENT')")
    @Operation(summary = "Get module by ID", description = "Retrieves a module by its unique identifier.")
    public ModuleResponse getModuleById(@PathVariable UUID id) {
        return moduleService.getModuleById(id);
    }
}
