package com.xebia.lms.module;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ModuleRepository extends JpaRepository<Module, UUID> {
    
    List<Module> findAllByCourseIdOrderByPositionAsc(UUID courseId);
    
    List<Module> findAllByCourseIdIn(List<UUID> courseIds);
    
    int countByCourseId(UUID courseId);
}
