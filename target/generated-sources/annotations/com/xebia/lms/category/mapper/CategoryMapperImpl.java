package com.xebia.lms.category.mapper;

import com.xebia.lms.category.Category;
import com.xebia.lms.category.dto.CategoryNode;
import com.xebia.lms.category.dto.CategoryResponse;
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
public class CategoryMapperImpl implements CategoryMapper {

    @Override
    public CategoryResponse toResponse(Category category) {
        if ( category == null ) {
            return null;
        }

        CategoryResponse.CategoryResponseBuilder categoryResponse = CategoryResponse.builder();

        categoryResponse.id( category.getId() );
        categoryResponse.organizationId( category.getOrganizationId() );
        categoryResponse.parentCategoryId( category.getParentCategoryId() );
        categoryResponse.name( category.getName() );
        categoryResponse.description( category.getDescription() );
        categoryResponse.status( category.getStatus() );
        categoryResponse.createdAt( category.getCreatedAt() );
        categoryResponse.updatedAt( category.getUpdatedAt() );

        return categoryResponse.build();
    }

    @Override
    public CategoryNode toNode(Category category) {
        if ( category == null ) {
            return null;
        }

        CategoryNode.CategoryNodeBuilder categoryNode = CategoryNode.builder();

        categoryNode.id( category.getId() );
        categoryNode.organizationId( category.getOrganizationId() );
        categoryNode.parentCategoryId( category.getParentCategoryId() );
        categoryNode.name( category.getName() );
        categoryNode.description( category.getDescription() );
        categoryNode.status( category.getStatus() );
        categoryNode.createdAt( category.getCreatedAt() );
        categoryNode.updatedAt( category.getUpdatedAt() );

        return categoryNode.build();
    }

    @Override
    public List<CategoryResponse> toResponseList(List<Category> categories) {
        if ( categories == null ) {
            return null;
        }

        List<CategoryResponse> list = new ArrayList<CategoryResponse>( categories.size() );
        for ( Category category : categories ) {
            list.add( toResponse( category ) );
        }

        return list;
    }
}
