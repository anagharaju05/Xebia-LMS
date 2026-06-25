package com.xebia.lms.category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    
    List<Category> findAllByOrganizationId(UUID organizationId);
    
    Optional<Category> findByIdAndOrganizationId(UUID id, UUID organizationId);
    
    boolean existsByNameAndOrganizationIdAndParentCategoryId(String name, UUID organizationId, UUID parentCategoryId);
    
    boolean existsByNameAndOrganizationIdAndParentCategoryIdAndIdNot(String name, UUID organizationId, UUID parentCategoryId, UUID id);

    boolean existsByParentCategoryIdAndOrganizationId(UUID parentCategoryId, UUID organizationId);
}
