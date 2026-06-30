package com.xebia.lms.student;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LessonCommentRepository extends JpaRepository<LessonComment, String> {
    List<LessonComment> findAllByLessonSlug(String lessonSlug);
}
