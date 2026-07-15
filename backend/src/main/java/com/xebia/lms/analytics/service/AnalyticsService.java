package com.xebia.lms.analytics.service;

import com.xebia.lms.analytics.dto.AnalyticsFilterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@Service
public class AnalyticsService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    
    private String buildFilterWhereClause(AnalyticsFilterRequest request, String studentAlias, String dateColumn, String dateAlias, boolean hasExistingWhere) {
        if (request == null) return "";
        StringBuilder where = new StringBuilder(hasExistingWhere ? " AND " : " WHERE ");
        where.append(" 1=1 ");

        if (request.getRegionIds() != null && !request.getRegionIds().isEmpty()) {
            where.append(" AND ").append(studentAlias).append(".region IN (");
            where.append(request.getRegionIds().stream().map(r -> "'" + r.replace("'", "''") + "'").collect(java.util.stream.Collectors.joining(",")));
            where.append(")");
        }
        if (request.getDepartmentIds() != null && !request.getDepartmentIds().isEmpty()) {
            where.append(" AND ").append(studentAlias).append(".department IN (");
            where.append(request.getDepartmentIds().stream().map(r -> "'" + r.replace("'", "''") + "'").collect(java.util.stream.Collectors.joining(",")));
            where.append(")");
        }
        if (request.getBusinessUnitIds() != null && !request.getBusinessUnitIds().isEmpty()) {
            where.append(" AND ").append(studentAlias).append(".business_unit IN (");
            where.append(request.getBusinessUnitIds().stream().map(r -> "'" + r.replace("'", "''") + "'").collect(java.util.stream.Collectors.joining(",")));
            where.append(")");
        }
        if (request.getLocationIds() != null && !request.getLocationIds().isEmpty()) {
            where.append(" AND ").append(studentAlias).append(".location IN (");
            where.append(request.getLocationIds().stream().map(r -> "'" + r.replace("'", "''") + "'").collect(java.util.stream.Collectors.joining(",")));
            where.append(")");
        }
        if (dateColumn != null && dateAlias != null) {
            if (request.getStartDate() != null && !request.getStartDate().isEmpty()) {
                where.append(" AND ").append(dateAlias).append(".").append(dateColumn).append(" >= '").append(request.getStartDate()).append("'");
            }
            if (request.getEndDate() != null && !request.getEndDate().isEmpty()) {
                where.append(" AND ").append(dateAlias).append(".").append(dateColumn).append(" <= '").append(request.getEndDate()).append("'");
            }
        }
        return where.toString();
    }

    @org.springframework.cache.annotation.Cacheable("analytics_filters")
    public Map<String, Object> getFilters() {
        Map<String, Object> filters = new HashMap<>();
        
        List<String> regions = new java.util.ArrayList<>();
        regions.add("Global");
        regions.addAll(jdbcTemplate.queryForList("SELECT DISTINCT region FROM students WHERE region IS NOT NULL ORDER BY region", String.class));
        
        List<String> businessUnits = new java.util.ArrayList<>();
        businessUnits.add("All Units");
        businessUnits.addAll(jdbcTemplate.queryForList("SELECT DISTINCT business_unit FROM students WHERE business_unit IS NOT NULL ORDER BY business_unit", String.class));
        
        filters.put("regions", regions);
        filters.put("businessUnits", businessUnits);
        return filters;
    }

    @org.springframework.cache.annotation.Cacheable("analytics_executive_summary")
    public Map<String, Object> getExecutiveSummary(AnalyticsFilterRequest request) {
        Map<String, Object> data = new HashMap<>();
        
        Integer totalEmployees = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students s" + buildFilterWhereClause(request, "s", "created_at", "s", false), Integer.class);
        Integer nominatedEmployees = jdbcTemplate.queryForObject("SELECT COUNT(DISTINCT sa.student_id) FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false), Integer.class);
        Integer trainedEmployees = jdbcTemplate.queryForObject("SELECT COUNT(DISTINCT sa.student_id) FROM session_attendances sa JOIN students s ON sa.student_id = s.id WHERE sa.progress_percentage > 0" + buildFilterWhereClause(request, "s", "created_at", "sa", true), Integer.class);
        
        int coverage = totalEmployees > 0 ? (int) Math.round((trainedEmployees * 100.0) / totalEmployees) : 0;
        
        Integer totalSessions = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM training_sessions", Integer.class);
        Integer totalAttendees = jdbcTemplate.queryForObject("SELECT COUNT(sa.id) FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false), Integer.class);
        
        Double learningHours = jdbcTemplate.queryForObject("SELECT SUM(sa.actual_learning_hours) FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false), Double.class);
        double totalLearningHours = learningHours != null ? learningHours : 0.0;
        
        double avgHoursPerSession = totalSessions > 0 ? totalLearningHours / totalSessions : 0.0;
        
        Integer totalCertifications = jdbcTemplate.queryForObject("SELECT COUNT(sc.id) FROM student_certifications sc JOIN students s ON sc.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sc", false), Integer.class);
        
        Integer aiTrained = jdbcTemplate.queryForObject("SELECT COUNT(DISTINCT a.student_id) FROM ai_tool_adoptions a JOIN students s ON a.student_id = s.id WHERE a.adoption_status != 'Not Started'" + buildFilterWhereClause(request, "s", "created_at", "a", true), Integer.class);
        Integer aiCertifications = jdbcTemplate.queryForObject("SELECT COUNT(sc.id) FROM student_certifications sc JOIN students s ON sc.student_id = s.id WHERE (sc.technology ILIKE '%AI%' OR sc.certification_name ILIKE '%AI%')" + buildFilterWhereClause(request, "s", "created_at", "sc", true), Integer.class);
        
        Double aiHours = jdbcTemplate.queryForObject(
            "SELECT SUM(sa.actual_learning_hours) FROM session_attendances sa JOIN courses c ON sa.course_id = c.id JOIN students s ON sa.student_id = s.id WHERE c.is_ai_training = true" + buildFilterWhereClause(request, "s", "created_at", "sa", true), 
            Double.class);
        double aiLearningHours = aiHours != null ? aiHours : 0.0;

        Double avgFeedback = jdbcTemplate.queryForObject("SELECT AVG(session_rating) FROM student_feedback", Double.class);
        double avgFeedbackScore = avgFeedback != null ? avgFeedback : 0.0;
        
        Integer lastMonthCerts = jdbcTemplate.queryForObject("SELECT COUNT(sc.id) FROM student_certifications sc JOIN students s ON sc.student_id = s.id WHERE sc.created_at >= CURRENT_DATE - INTERVAL '60 days' AND sc.created_at < CURRENT_DATE - INTERVAL '30 days'", Integer.class);
        Integer thisMonthCerts = jdbcTemplate.queryForObject("SELECT COUNT(sc.id) FROM student_certifications sc JOIN students s ON sc.student_id = s.id WHERE sc.created_at >= CURRENT_DATE - INTERVAL '30 days'", Integer.class);
        double certGrowth = (lastMonthCerts != null && lastMonthCerts > 0) ? ((thisMonthCerts != null ? thisMonthCerts : 0) - lastMonthCerts) * 100.0 / lastMonthCerts : 0.0;

        Integer totalFeedbacks = jdbcTemplate.queryForObject("SELECT COUNT(id) FROM student_feedback", Integer.class);
        Integer promoters = jdbcTemplate.queryForObject("SELECT COUNT(id) FROM student_feedback WHERE session_rating >= 4", Integer.class);
        int recPct = totalFeedbacks != null && totalFeedbacks > 0 ? (int) Math.round((promoters != null ? promoters : 0) * 100.0 / totalFeedbacks) : 0;

        data.put("totalEmployees", totalEmployees != null ? totalEmployees : 0);
        data.put("nominatedEmployees", nominatedEmployees != null ? nominatedEmployees : 0);
        data.put("trainedEmployees", trainedEmployees != null ? trainedEmployees : 0);
        data.put("coveragePercentage", coverage);
        data.put("totalSessions", totalSessions != null ? totalSessions : 0);
        data.put("totalAttendees", totalAttendees != null ? totalAttendees : 0);
        data.put("totalLearningHours", totalLearningHours);
        data.put("avgHoursPerSession", Math.round(avgHoursPerSession * 10.0) / 10.0);
        data.put("totalCertifications", totalCertifications != null ? totalCertifications : 0);
        data.put("certificationGrowth", Math.round(certGrowth * 10.0) / 10.0);
        data.put("aiTrained", aiTrained != null ? aiTrained : 0);
        data.put("aiCertifications", aiCertifications != null ? aiCertifications : 0);
        data.put("aiLearningHours", aiLearningHours);
        data.put("avgFeedbackScore", Math.round(avgFeedbackScore * 10.0) / 10.0);
        data.put("satisfactionScore", (int) Math.round((avgFeedbackScore / 5.0) * 100.0));
        data.put("recommendationPercentage", recPct);
        return data;
    }

    public Map<String, Object> getLearningCoverage(AnalyticsFilterRequest request) {
        Map<String, Object> data = new HashMap<>();
        Integer totalLearners = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students s" + buildFilterWhereClause(request, "s", "created_at", "s", false), Integer.class);
        Integer trained = jdbcTemplate.queryForObject("SELECT COUNT(DISTINCT sa.student_id) FROM session_attendances sa JOIN students s ON sa.student_id = s.id WHERE sa.progress_percentage > 0" + buildFilterWhereClause(request, "s", "created_at", "sa", true), Integer.class);
        int coverage = totalLearners > 0 ? (int) Math.round((trained * 100.0) / totalLearners) : 0;
        
        data.put("totalLearners", totalLearners != null ? totalLearners : 0);
        data.put("avgCoverage", coverage);

        List<Map<String, Object>> topRegions = jdbcTemplate.query(
            "SELECT s.region as name, COUNT(DISTINCT sa.student_id) as trained FROM students s LEFT JOIN session_attendances sa ON s.id = sa.student_id" + buildFilterWhereClause(request, "s", "created_at", "sa", false) + " GROUP BY s.region ORDER BY trained DESC",
            (rs, rowNum) -> Map.of("name", rs.getString("name") != null ? rs.getString("name") : "Unknown", "trained", rs.getInt("trained"))
        );
        
        if (!topRegions.isEmpty()) {
            data.put("topRegionValue", topRegions.get(0).get("trained"));
            data.put("topRegionName", topRegions.get(0).get("name"));
            data.put("lowestRegionValue", topRegions.get(topRegions.size() - 1).get("trained"));
            data.put("lowestRegionName", topRegions.get(topRegions.size() - 1).get("name"));
        } else {
            data.put("topRegionValue", 0);
            data.put("topRegionName", "No Data");
            data.put("lowestRegionValue", 0);
            data.put("lowestRegionName", "No Data");
        }
        
        List<Map<String, Object>> trendData = jdbcTemplate.query(
            "SELECT to_char(sa.created_at, 'Mon') as name, COUNT(DISTINCT sa.student_id) as value FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false) + " GROUP BY to_char(sa.created_at, 'Mon')",
            (rs, rowNum) -> Map.of("name", rs.getString("name"), "value", rs.getInt("value"))
        );
        data.put("trendData", trendData.isEmpty() ? List.of(Map.of("name", "Jan", "value", 0)) : trendData);

        List<Map<String, Object>> buData = jdbcTemplate.query(
            "SELECT s.business_unit as name, COUNT(DISTINCT sa.student_id) * 100 / NULLIF(COUNT(s.id), 0) as coverage FROM students s LEFT JOIN session_attendances sa ON s.id = sa.student_id WHERE s.business_unit IS NOT NULL" + buildFilterWhereClause(request, "s", "created_at", "sa", true) + " GROUP BY s.business_unit ORDER BY coverage DESC",
            (rs, rowNum) -> Map.of("name", rs.getString("name"), "coverage", rs.getInt("coverage"))
        );
        
        data.put("topBUs", buData.size() > 3 ? buData.subList(0, 3) : buData);
        data.put("bottomBUs", buData.size() > 3 ? buData.subList(Math.max(0, buData.size() - 3), buData.size()) : buData);
        
        return data;
    }

    public Map<String, Object> getLearningHours(AnalyticsFilterRequest request) {
        Map<String, Object> data = new HashMap<>();
        
        Double totalHours = jdbcTemplate.queryForObject("SELECT SUM(sa.actual_learning_hours) FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false), Double.class);
        double hours = totalHours != null ? totalHours : 0.0;
        
        Integer headcount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students s" + buildFilterWhereClause(request, "s", "created_at", "s", false), Integer.class);
        double avgEmployee = headcount != null && headcount > 0 ? hours / headcount : 0.0;
        
        Integer activeLearners = jdbcTemplate.queryForObject("SELECT COUNT(DISTINCT sa.student_id) FROM session_attendances sa JOIN students s ON sa.student_id = s.id WHERE sa.actual_learning_hours > 0" + buildFilterWhereClause(request, "s", "created_at", "sa", true), Integer.class);
        double avgLearner = activeLearners != null && activeLearners > 0 ? hours / activeLearners : 0.0;

        data.put("totalLearningHours", hours);
        data.put("avgHoursPerEmployee", Math.round(avgEmployee * 10.0) / 10.0);
        data.put("avgHoursPerLearner", Math.round(avgLearner * 10.0) / 10.0);

        List<Map<String, Object>> topRegions = jdbcTemplate.query(
            "SELECT s.region as name, SUM(sa.actual_learning_hours) / NULLIF(COUNT(DISTINCT s.id), 0) as avg_hours FROM students s LEFT JOIN session_attendances sa ON s.id = sa.student_id WHERE s.region IS NOT NULL" + buildFilterWhereClause(request, "s", "created_at", "sa", true) + " GROUP BY s.region ORDER BY avg_hours DESC",
            (rs, rowNum) -> Map.of("name", rs.getString("name"), "avg_hours", rs.getDouble("avg_hours"))
        );
        
        if (!topRegions.isEmpty()) {
            data.put("highestAvgRegionValue", Math.round((Double) topRegions.get(0).get("avg_hours") * 10.0) / 10.0);
            data.put("highestAvgRegionName", topRegions.get(0).get("name"));
        } else {
            data.put("highestAvgRegionValue", 0);
            data.put("highestAvgRegionName", "No Data");
        }
        
        List<Map<String, Object>> hoursTrendData = jdbcTemplate.query(
            "SELECT to_char(sa.created_at, 'Mon') as name, SUM(sa.actual_learning_hours) as hours FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false) + " GROUP BY to_char(sa.created_at, 'Mon')",
            (rs, rowNum) -> Map.of("name", rs.getString("name"), "hours", rs.getDouble("hours"))
        );
        data.put("hoursTrendData", hoursTrendData.isEmpty() ? List.of(Map.of("name", "Q1", "hours", 0)) : hoursTrendData);
        
        List<Map<String, Object>> topRegionsList = jdbcTemplate.query(
            "SELECT s.region as name, SUM(sa.actual_learning_hours) as hours FROM students s JOIN session_attendances sa ON s.id = sa.student_id WHERE s.region IS NOT NULL" + buildFilterWhereClause(request, "s", "created_at", "sa", true) + " GROUP BY s.region ORDER BY hours DESC LIMIT 5",
            (rs, rowNum) -> Map.of("name", rs.getString("name"), "hours", rs.getDouble("hours"))
        );
        data.put("topRegions", topRegionsList);
        
        List<Map<String, Object>> topLearners = jdbcTemplate.query(
            "SELECT s.name as name, SUM(sa.actual_learning_hours) as hours, s.region as region FROM students s JOIN session_attendances sa ON s.id = sa.student_id" + buildFilterWhereClause(request, "s", "created_at", "sa", false) + " GROUP BY s.id, s.name, s.region ORDER BY hours DESC LIMIT 5",
            (rs, rowNum) -> Map.of("name", rs.getString("name"), "hours", rs.getDouble("hours"), "region", rs.getString("region") != null ? rs.getString("region") : "Unknown")
        );
        data.put("topLearners", topLearners);
        
        return data;
    }

    public Map<String, Object> getLearningPillars(AnalyticsFilterRequest request) {
        Map<String, Object> data = new HashMap<>();
        List<Map<String, Object>> pillarDataList = jdbcTemplate.query(
            "SELECT c.learning_pillar as name, SUM(sa.actual_learning_hours) as value FROM session_attendances sa JOIN courses c ON sa.course_id = c.id JOIN students s ON sa.student_id = s.id WHERE c.learning_pillar IS NOT NULL" + buildFilterWhereClause(request, "s", "created_at", "sa", true) + " GROUP BY c.learning_pillar ORDER BY value DESC",
            (rs, rowNum) -> Map.of("name", rs.getString("name"), "value", rs.getDouble("value"))
        );
        data.put("pillarData", pillarDataList);
        if (!pillarDataList.isEmpty()) {
            data.put("topPillarName", pillarDataList.get(0).get("name"));
            data.put("topPillarHours", pillarDataList.get(0).get("value"));
        } else {
            data.put("topPillarName", "No Data");
            data.put("topPillarHours", 0.0);
        }
        return data;
    }

    public Map<String, Object> getAiTransformation(AnalyticsFilterRequest request) {
        Map<String, Object> data = new HashMap<>();
        Integer trained = jdbcTemplate.queryForObject("SELECT COUNT(DISTINCT a.student_id) FROM ai_tool_adoptions a JOIN students s ON a.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "a", false), Integer.class);
        Integer certifications = jdbcTemplate.queryForObject("SELECT COUNT(sc.id) FROM student_certifications sc JOIN students s ON sc.student_id = s.id WHERE sc.technology ILIKE '%AI%'" + buildFilterWhereClause(request, "s", "created_at", "sc", true), Integer.class);
        
        Double aiHours = jdbcTemplate.queryForObject(
            "SELECT SUM(sa.actual_learning_hours) FROM session_attendances sa JOIN courses c ON sa.course_id = c.id JOIN students s ON sa.student_id = s.id WHERE c.is_ai_training = true" + buildFilterWhereClause(request, "s", "created_at", "sa", true), 
            Double.class);
            
        data.put("aiTrained", trained != null ? trained : 0);
        data.put("aiCertifications", certifications != null ? certifications : 0);
        data.put("aiLearningHours", aiHours != null ? aiHours : 0.0);
        return data;
    }

    public Map<String, Object> getCertifications(AnalyticsFilterRequest request) {
        Map<String, Object> data = new HashMap<>();
        Integer total = jdbcTemplate.queryForObject("SELECT COUNT(sc.id) FROM student_certifications sc JOIN students s ON sc.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sc", false), Integer.class);
        data.put("totalCertifications", total != null ? total : 0);
        data.put("activeLearners", total != null ? total : 0);
        
        Integer lastMonthTotal = jdbcTemplate.queryForObject("SELECT COUNT(sc.id) FROM student_certifications sc JOIN students s ON sc.student_id = s.id WHERE sc.created_at >= CURRENT_DATE - INTERVAL '60 days' AND sc.created_at < CURRENT_DATE - INTERVAL '30 days'", Integer.class);
        Integer thisMonthTotal = jdbcTemplate.queryForObject("SELECT COUNT(sc.id) FROM student_certifications sc JOIN students s ON sc.student_id = s.id WHERE sc.created_at >= CURRENT_DATE - INTERVAL '30 days'", Integer.class);
        double growth = (lastMonthTotal != null && lastMonthTotal > 0) ? ((thisMonthTotal != null ? thisMonthTotal : 0) - lastMonthTotal) * 100.0 / lastMonthTotal : 0.0;
        data.put("certificationGrowth", Math.round(growth * 10.0) / 10.0);
        
        List<Map<String, Object>> certList = jdbcTemplate.query(
            "SELECT sc.technology as name, COUNT(sc.id) as count FROM student_certifications sc JOIN students s ON sc.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sc", false) + " GROUP BY sc.technology ORDER BY count DESC LIMIT 5",
            (rs, rowNum) -> Map.of("name", rs.getString("name"), "count", rs.getInt("count"))
        );
        data.put("topTechnologies", certList);
        
        List<Map<String, Object>> recentCerts = jdbcTemplate.query(
            "SELECT s.name as studentName, c.certification_name as certification, to_char(c.created_at, 'YYYY-MM-DD') as date FROM student_certifications c JOIN students s ON c.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "c", false) + " ORDER BY c.created_at DESC LIMIT 5",
            (rs, rowNum) -> Map.of("studentName", rs.getString("studentName"), "certification", rs.getString("certification"), "date", rs.getString("date") != null ? rs.getString("date") : "Unknown Date")
        );
        data.put("recentCertifications", recentCerts);
        return data;
    }

    public Map<String, Object> getFlagshipPrograms(AnalyticsFilterRequest request) {
        Map<String, Object> data = new HashMap<>();
        Integer programsCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM flagship_programs", Integer.class);
        data.put("activePrograms", programsCount != null ? programsCount : 0);
        
        List<Map<String, Object>> programs = jdbcTemplate.query(
            "SELECT program_name as name, completion_target as progress, certification_target as target FROM flagship_programs LIMIT 3",
            (rs, rowNum) -> Map.of("name", rs.getString("name"), "progress", rs.getInt("progress"), "target", rs.getInt("target"))
        );
        data.put("programsData", programs);
        return data;
    }

    public Map<String, Object> getLearningTrends(AnalyticsFilterRequest request) {
        Map<String, Object> data = new HashMap<>();
        List<Map<String, Object>> trendData = jdbcTemplate.query(
            "SELECT to_char(sa.created_at, 'Mon') as month, SUM(sa.actual_learning_hours) as hours FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false) + " GROUP BY to_char(sa.created_at, 'Mon'), date_trunc('month', sa.created_at) ORDER BY date_trunc('month', sa.created_at) ASC LIMIT 6",
            (rs, rowNum) -> Map.of("month", rs.getString("month"), "hours", rs.getDouble("hours"))
        );
        data.put("trendData", trendData.isEmpty() ? List.of(Map.of("month", "No Data", "hours", 0.0)) : trendData);
        return data;
    }

    public Map<String, Object> getTrainingEffectiveness(AnalyticsFilterRequest request) {
        Map<String, Object> data = new HashMap<>();
        Double avgRating = jdbcTemplate.queryForObject("SELECT AVG(f.session_rating) FROM student_feedback f JOIN students s ON f.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "f", false), Double.class);
        double avgRatingVal = avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0;
        data.put("avgRating", avgRatingVal);
        
        Integer promoters = jdbcTemplate.queryForObject("SELECT COUNT(f.id) FROM student_feedback f JOIN students s ON f.student_id = s.id WHERE f.session_rating = 5" + buildFilterWhereClause(request, "s", "created_at", "f", true), Integer.class);
        Integer totalResponses = jdbcTemplate.queryForObject("SELECT COUNT(f.id) FROM student_feedback f JOIN students s ON f.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "f", false), Integer.class);
        Integer detractors = jdbcTemplate.queryForObject("SELECT COUNT(f.id) FROM student_feedback f JOIN students s ON f.student_id = s.id WHERE f.session_rating <= 3" + buildFilterWhereClause(request, "s", "created_at", "f", true), Integer.class);
        
        int nps = 0;
        if (totalResponses != null && totalResponses > 0) {
            nps = (int) Math.round(((promoters != null ? promoters : 0) * 100.0 / totalResponses) - ((detractors != null ? detractors : 0) * 100.0 / totalResponses));
        }
        data.put("npsScore", nps);
        
        int retention = (int) Math.round((avgRatingVal / 5.0) * 100.0);
        data.put("knowledgeRetention", retention);
        
        List<Map<String, Object>> metrics = jdbcTemplate.query(
            "SELECT c.title as name, AVG(f.session_rating) as score FROM student_feedback f JOIN courses c ON f.course_id = c.id JOIN students s ON f.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "f", false) + " GROUP BY c.title LIMIT 5",
            (rs, rowNum) -> Map.of("name", rs.getString("name") != null ? rs.getString("name") : "Unknown", "score", rs.getDouble("score"))
        );
        data.put("effectivenessMetrics", metrics);
        
        List<Map<String, Object>> feedbackDist = jdbcTemplate.query(
            "SELECT f.session_rating as rating, COUNT(f.id) as count FROM student_feedback f JOIN students s ON f.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "f", false) + " GROUP BY f.session_rating ORDER BY f.session_rating DESC",
            (rs, rowNum) -> Map.of("rating", rs.getInt("rating") + " Stars", "count", rs.getInt("count"))
        );
        data.put("feedbackDistribution", feedbackDist);
        return data;
    }

    public Map<String, Object> getLearningChampions(AnalyticsFilterRequest request) {
        Map<String, Object> data = new HashMap<>();
        
        Integer activeLearners = jdbcTemplate.queryForObject("SELECT COUNT(DISTINCT sa.student_id) FROM session_attendances sa JOIN students s ON sa.student_id = s.id WHERE sa.actual_learning_hours > 0" + buildFilterWhereClause(request, "s", "created_at", "sa", true), Integer.class);
        data.put("activeLearners", activeLearners != null ? activeLearners : 0);
        
        Integer totalBadges = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM student_certifications sc JOIN students s ON sc.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sc", false), Integer.class);
        data.put("totalBadges", totalBadges != null ? totalBadges : 0);
        
        List<Map<String, Object>> champions = jdbcTemplate.query(
            "SELECT s.name, SUM(sa.actual_learning_hours) as hours FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false) + " GROUP BY s.name ORDER BY hours DESC LIMIT 5",
            (rs, rowNum) -> Map.of("name", rs.getString("name"), "hours", rs.getInt("hours"))
        );
        data.put("championsList", champions);
        return data;
    }

    public Map<String, Object> getProjectInvestment(AnalyticsFilterRequest request) {
        Map<String, Object> data = new HashMap<>();
        
        Double learningHours = jdbcTemplate.queryForObject("SELECT SUM(sa.actual_learning_hours) FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false), Double.class);
        double totalLearningHours = learningHours != null ? learningHours : 0.0;
        
        Integer totalCertifications = jdbcTemplate.queryForObject("SELECT COUNT(sc.id) FROM student_certifications sc JOIN students s ON sc.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sc", false), Integer.class);
        
        long investment = (long) (totalLearningHours * 50);
        data.put("totalInvestment", investment);
        
        int roi = 0;
        if (investment > 0) {
            roi = (int) Math.round((((totalCertifications != null ? totalCertifications : 0) * 1000.0) / investment) * 100);
        }
        data.put("roiPercentage", roi);
        
        List<Map<String, Object>> projects = jdbcTemplate.query(
            "SELECT project as name, COUNT(*) as sessions FROM training_sessions WHERE project IS NOT NULL GROUP BY project LIMIT 5",
            (rs, rowNum) -> Map.of("name", rs.getString("name"), "sessions", rs.getInt("sessions"))
        );
        data.put("investmentData", projects);
        return data;
    }

    public Map<String, Object> getFresherJourney(AnalyticsFilterRequest request) {
        Map<String, Object> data = new HashMap<>();
        Integer freshersCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students s WHERE s.employment_type = 'Fresher'" + buildFilterWhereClause(request, "s", "created_at", "s", true), Integer.class);
        int freshers = freshersCount != null ? freshersCount : 0;
        data.put("totalFreshers", freshers);
        
        Double avgTimeToDeploy = jdbcTemplate.queryForObject("SELECT AVG(EXTRACT(DAY FROM (billable_deployment_date - joining_date))) FROM students s WHERE s.employment_type = 'Fresher'" + buildFilterWhereClause(request, "s", "created_at", "s", true), Double.class);
        data.put("avgTimeToDeploy", avgTimeToDeploy != null ? Math.round(avgTimeToDeploy) : 0);
        
        Integer deployedFreshers = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students s WHERE s.employment_type = 'Fresher' AND billable_deployment_date IS NOT NULL" + buildFilterWhereClause(request, "s", "created_at", "s", true), Integer.class);
        Integer allocatedFreshers = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students s WHERE s.employment_type = 'Fresher' AND project_allocation_date IS NOT NULL" + buildFilterWhereClause(request, "s", "created_at", "s", true), Integer.class);
        
        int deploymentRate = freshers > 0 ? (int) Math.round(((deployedFreshers != null ? deployedFreshers : 0) * 100.0) / freshers) : 0;
        data.put("deploymentRate", deploymentRate);
        
        int allocatedRate = freshers > 0 ? (int) Math.round(((allocatedFreshers != null ? allocatedFreshers : 0) * 100.0) / freshers) : 0;
        
        data.put("journeyMilestones", List.of(
            Map.of("milestone", "Bootcamp", "completion", freshers > 0 ? 100 : 0),
            Map.of("milestone", "Shadowing", "completion", allocatedRate),
            Map.of("milestone", "Deployed", "completion", deploymentRate)
        ));
        return data;
    }
}
