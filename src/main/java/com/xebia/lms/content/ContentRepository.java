package com.xebia.lms.content;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContentRepository extends JpaRepository<Content, UUID> {
    
    List<Content> findAllBySubmoduleIdOrderByPositionAsc(UUID submoduleId);
    
    List<Content> findAllBySubmoduleIdIn(List<UUID> submoduleIds);
    
    int countBySubmoduleId(UUID submoduleId);

    @Query("SELECT COALESCE(SUM(c.durationMinutes), 0) FROM Content c " +
           "JOIN Submodule s ON c.submoduleId = s.id " +
           "JOIN Module m ON s.moduleId = m.id " +
           "WHERE m.courseId = :courseId")
    int sumDurationMinutesByCourseId(@Param("courseId") UUID courseId);
}
