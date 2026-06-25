package com.xebia.lms.category.mapper;

import com.xebia.lms.category.Category;
import com.xebia.lms.category.dto.CategoryNode;
import com.xebia.lms.category.dto.CategoryResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    
    CategoryResponse toResponse(Category category);
    
    CategoryNode toNode(Category category);
    
    List<CategoryResponse> toResponseList(List<Category> categories);
}
