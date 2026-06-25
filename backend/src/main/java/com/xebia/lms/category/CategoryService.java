package com.xebia.lms.category;

import com.xebia.lms.category.dto.CategoryNode;
import com.xebia.lms.category.dto.CategoryRequest;
import com.xebia.lms.category.dto.CategoryResponse;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    CategoryResponse createCategory(CategoryRequest request);
    
    CategoryResponse updateCategory(UUID id, CategoryRequest request);
    
    void deleteCategory(UUID id);
    
    CategoryResponse getCategoryById(UUID id);
    
    List<CategoryResponse> getAllCategories();
    
    List<CategoryNode> getCategoryTree();
}
