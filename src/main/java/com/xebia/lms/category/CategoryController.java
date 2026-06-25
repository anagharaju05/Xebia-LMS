package com.xebia.lms.category;

import com.xebia.lms.category.dto.CategoryNode;
import com.xebia.lms.category.dto.CategoryRequest;
import com.xebia.lms.category.dto.CategoryResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Category Management", description = "Endpoints for managing course categories and hierarchical tree retrieval.")
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'ORGANISER')")
    @Operation(summary = "Create a new category", description = "Allows Admin, Trainer, or Organiser to create a new category.")
    public CategoryResponse createCategory(@Valid @RequestBody CategoryRequest request) {
        return categoryService.createCategory(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'ORGANISER')")
    @Operation(summary = "Update an existing category", description = "Allows Admin, Trainer, or Organiser to update category details.")
    public CategoryResponse updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryRequest request) {
        return categoryService.updateCategory(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'ORGANISER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a category", description = "Deletes a category from the database if no courses or subcategories are attached.")
    public void deleteCategory(@PathVariable UUID id) {
        categoryService.deleteCategory(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'ORGANISER', 'STUDENT')")
    @Operation(summary = "List all categories", description = "Retrieves all categories for the current tenant organization.")
    public List<CategoryResponse> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/tree")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'ORGANISER', 'STUDENT')")
    @Operation(summary = "Retrieve category tree", description = "Retrieves categories organized in a parent-child hierarchy tree.")
    public List<CategoryNode> getCategoryTree() {
        return categoryService.getCategoryTree();
    }
}
