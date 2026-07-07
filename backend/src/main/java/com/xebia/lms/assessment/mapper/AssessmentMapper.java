package com.xebia.lms.assessment.mapper;

import com.xebia.lms.assessment.Assessment;
import com.xebia.lms.assessment.AssessmentQuestion;
import com.xebia.lms.assessment.TestCase;
import com.xebia.lms.assessment.dto.AssessmentQuestionDto;
import com.xebia.lms.assessment.dto.AssessmentRequest;
import com.xebia.lms.assessment.dto.AssessmentResponse;
import com.xebia.lms.assessment.dto.TestCaseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AssessmentMapper {

    @Mapping(source = "questions", target = "quizQuestions")
    AssessmentResponse toResponse(Assessment assessment);

    List<AssessmentResponse> toResponseList(List<Assessment> assessments);

    @Mapping(source = "quizQuestions", target = "questions")
    Assessment toEntity(AssessmentRequest request);

    @Mapping(target = "assessment", ignore = true)
    AssessmentQuestion toQuestionEntity(AssessmentQuestionDto dto);

    @Mapping(target = "assessment", ignore = true)
    TestCase toTestCaseEntity(TestCaseDto dto);

    AssessmentQuestionDto toQuestionDto(AssessmentQuestion entity);

    TestCaseDto toTestCaseDto(TestCase entity);
}
