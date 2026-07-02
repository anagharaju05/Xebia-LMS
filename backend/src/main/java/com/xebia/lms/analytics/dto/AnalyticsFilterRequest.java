package com.xebia.lms.analytics.dto;

import lombok.Data;
import java.util.List;

@Data
public class AnalyticsFilterRequest {
    private Integer year;
    private Integer quarter;
    private Integer halfYear;
    private Integer month;
    private String startDate;
    private String endDate;
    
    private List<String> regionIds;
    private List<String> locationIds;
    private List<String> businessUnitIds;
    private List<String> departmentIds;
    private List<String> projectIds;
    private List<String> practiceIds;
    private List<String> employeeGrades;
    private List<String> employeeIds;
}
