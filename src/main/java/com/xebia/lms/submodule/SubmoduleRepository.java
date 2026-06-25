package com.xebia.lms.submodule;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubmoduleRepository extends JpaRepository<Submodule, UUID> {
    
    List<Submodule> findAllByModuleIdOrderByPositionAsc(UUID moduleId);
    
    List<Submodule> findAllByModuleIdIn(List<UUID> moduleIds);
    
    int countByModuleId(UUID moduleId);
}
