package com.xebia.lms.category;

import com.xebia.lms.category.dto.CategoryNode;
import com.xebia.lms.category.dto.CategoryRequest;
import com.xebia.lms.category.dto.CategoryResponse;
import com.xebia.lms.category.mapper.CategoryMapper;
import com.xebia.lms.course.CourseRepository;
import com.xebia.lms.exception.BadRequestException;
import com.xebia.lms.exception.ResourceNotFoundException;
import com.xebia.lms.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CourseRepository courseRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        UUID orgId = TenantContext.getCurrentTenant();
        if (orgId == null) {
            throw new BadRequestException("Organization ID must be provided via tenant context");
        }

        // Validate parent category if present
        if (request.getParentCategoryId() != null) {
            categoryRepository.findByIdAndOrganizationId(request.getParentCategoryId(), orgId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found for this organization"));
        }

        // Check for duplicate category name under the same parent for this tenant
        if (categoryRepository.existsByNameAndOrganizationIdAndParentCategoryId(
                request.getName(), orgId, request.getParentCategoryId())) {
            throw new BadRequestException("Category with this name already exists under the specified parent");
        }

        Category category = Category.builder()
                .id(request.getId() != null ? request.getId() : UUID.randomUUID())
                .organizationId(orgId)
                .parentCategoryId(request.getParentCategoryId())
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .metadata(request.getMetadata())
                .build();

        Category saved = categoryRepository.save(category);
        return categoryMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(UUID id, CategoryRequest request) {
        UUID orgId = TenantContext.getCurrentTenant();
        Category category = categoryRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Validate parent category if changed and present
        if (request.getParentCategoryId() != null && !request.getParentCategoryId().equals(category.getParentCategoryId())) {
            // Prevent circular dependency (a category cannot be its own parent, or under its descendants. For simplicity, prevent own parent)
            if (id.equals(request.getParentCategoryId())) {
                throw new BadRequestException("Category cannot be its own parent");
            }
            categoryRepository.findByIdAndOrganizationId(request.getParentCategoryId(), orgId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found for this organization"));
        }

        // Check for name duplicate under same parent
        if (categoryRepository.existsByNameAndOrganizationIdAndParentCategoryIdAndIdNot(
                request.getName(), orgId, request.getParentCategoryId(), id)) {
            throw new BadRequestException("Category with this name already exists under the specified parent");
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setParentCategoryId(request.getParentCategoryId());
        if (request.getStatus() != null) {
            category.setStatus(request.getStatus());
        }
        category.setMetadata(request.getMetadata());

        Category updated = categoryRepository.save(category);
        return categoryMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCategory(UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        Category category = categoryRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (courseRepository.existsByCategoryIdAndOrganizationId(id, orgId)) {
            throw new BadRequestException("Cannot delete category because there are courses assigned to it");
        }

        if (categoryRepository.existsByParentCategoryIdAndOrganizationId(id, orgId)) {
            throw new BadRequestException("Cannot delete category because it has subcategories");
        }

        categoryRepository.delete(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        UUID orgId = TenantContext.getCurrentTenant();
        List<Category> categories = categoryRepository.findAllByOrganizationId(orgId);
        return categoryMapper.toResponseList(categories);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryNode> getCategoryTree() {
        UUID orgId = TenantContext.getCurrentTenant();
        List<Category> categories = categoryRepository.findAllByOrganizationId(orgId);

        // Convert all categories to node objects
        List<CategoryNode> nodes = categories.stream()
                .map(categoryMapper::toNode)
                .collect(Collectors.toList());

        // Map nodes by their ID for fast lookup
        Map<UUID, CategoryNode> nodeMap = nodes.stream()
                .collect(Collectors.toMap(CategoryNode::getId, node -> node));

        List<CategoryNode> rootNodes = new ArrayList<>();

        for (CategoryNode node : nodes) {
            UUID parentId = node.getParentCategoryId();
            if (parentId == null) {
                rootNodes.add(node);
            } else {
                CategoryNode parentNode = nodeMap.get(parentId);
                if (parentNode != null) {
                    parentNode.getChildren().add(node);
                } else {
                    // Parent does not exist or belongs to another tenant/list, treat as root
                    rootNodes.add(node);
                }
            }
        }

        return rootNodes;
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        Category category = categoryRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new com.xebia.lms.exception.ResourceNotFoundException("Category not found"));
        return categoryMapper.toResponse(category);
    }
}
