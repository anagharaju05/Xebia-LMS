package com.xebia.lms.analytics.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class AnalyticsResponse<T> {
    private boolean success;
    private T data;
    private Meta meta;

    @Data
    @Builder
    public static class Meta {
        private Map<String, Object> filters;
        private String generatedAt;
        private String currency;
    }
}
