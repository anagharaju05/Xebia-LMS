import re

with open(r'C:\Project\Xebia\backend\src\main\java\com\xebia\lms\analytics\service\AnalyticsService.java', 'r', encoding='utf-8') as f:
    content = f.read()

helper_method = '''
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
'''

content = content.replace('public Map<String, Object> getFilters() {', helper_method + '\n    public Map<String, Object> getFilters() {')

# Now apply to getExecutiveSummary
content = content.replace(
    'Integer totalEmployees = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students", Integer.class);',
    'Integer totalEmployees = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students s" + buildFilterWhereClause(request, "s", "created_at", "s", false), Integer.class);'
)
content = content.replace(
    'Integer nominatedEmployees = jdbcTemplate.queryForObject("SELECT COUNT(DISTINCT student_id) FROM session_attendances", Integer.class);',
    'Integer nominatedEmployees = jdbcTemplate.queryForObject("SELECT COUNT(DISTINCT sa.student_id) FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false), Integer.class);'
)
content = content.replace(
    'Integer trainedEmployees = jdbcTemplate.queryForObject("SELECT COUNT(DISTINCT student_id) FROM session_attendances WHERE progress_percentage > 0", Integer.class);',
    'Integer trainedEmployees = jdbcTemplate.queryForObject("SELECT COUNT(DISTINCT sa.student_id) FROM session_attendances sa JOIN students s ON sa.student_id = s.id WHERE sa.progress_percentage > 0" + buildFilterWhereClause(request, "s", "created_at", "sa", true), Integer.class);'
)

# ... Do same for other queries in executive summary
content = content.replace(
    'Double learningHours = jdbcTemplate.queryForObject("SELECT SUM(actual_learning_hours) FROM session_attendances", Double.class);',
    'Double learningHours = jdbcTemplate.queryForObject("SELECT SUM(sa.actual_learning_hours) FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false), Double.class);'
)
content = content.replace(
    'Integer totalAttendees = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM session_attendances", Integer.class);',
    'Integer totalAttendees = jdbcTemplate.queryForObject("SELECT COUNT(sa.id) FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false), Integer.class);'
)
content = content.replace(
    'Integer totalCertifications = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM student_certifications", Integer.class);',
    'Integer totalCertifications = jdbcTemplate.queryForObject("SELECT COUNT(sc.id) FROM student_certifications sc JOIN students s ON sc.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sc", false), Integer.class);'
)

# AI section
content = content.replace(
    'Integer aiTrained = jdbcTemplate.queryForObject("SELECT COUNT(DISTINCT student_id) FROM ai_tool_adoptions WHERE adoption_status != \'Not Started\'", Integer.class);',
    'Integer aiTrained = jdbcTemplate.queryForObject("SELECT COUNT(DISTINCT a.student_id) FROM ai_tool_adoptions a JOIN students s ON a.student_id = s.id WHERE a.adoption_status != \'Not Started\'" + buildFilterWhereClause(request, "s", "created_at", "a", true), Integer.class);'
)
content = content.replace(
    'Integer aiCertifications = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM student_certifications WHERE technology ILIKE \'%AI%\' OR certification_name ILIKE \'%AI%\'", Integer.class);',
    'Integer aiCertifications = jdbcTemplate.queryForObject("SELECT COUNT(sc.id) FROM student_certifications sc JOIN students s ON sc.student_id = s.id WHERE (sc.technology ILIKE \'%AI%\' OR sc.certification_name ILIKE \'%AI%\')" + buildFilterWhereClause(request, "s", "created_at", "sc", true), Integer.class);'
)
content = content.replace(
    '"SELECT SUM(sa.actual_learning_hours) FROM session_attendances sa JOIN courses c ON sa.course_id = c.id WHERE c.is_ai_training = true",',
    '"SELECT SUM(sa.actual_learning_hours) FROM session_attendances sa JOIN courses c ON sa.course_id = c.id JOIN students s ON sa.student_id = s.id WHERE c.is_ai_training = true" + buildFilterWhereClause(request, "s", "created_at", "sa", true),'
)

# Write back
with open(r'C:\Project\Xebia\backend\src\main\java\com\xebia\lms\analytics\service\AnalyticsService.java', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AnalyticsService.java with dynamic filtering")
