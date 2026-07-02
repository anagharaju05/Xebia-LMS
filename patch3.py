import re

with open(r'C:\Project\Xebia\backend\src\main\java\com\xebia\lms\analytics\service\AnalyticsService.java', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    '"SELECT to_char(sa.created_at, \'Mon\') as name, COUNT(DISTINCT sa.student_id) as value FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false) + " GROUP BY name",':
    '"SELECT to_char(sa.created_at, \'Mon\') as name, COUNT(DISTINCT sa.student_id) as value FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false) + " GROUP BY to_char(sa.created_at, \'Mon\')",',

    '"SELECT to_char(sa.created_at, \'Mon\') as name, SUM(sa.actual_learning_hours) as hours FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false) + " GROUP BY name",':
    '"SELECT to_char(sa.created_at, \'Mon\') as name, SUM(sa.actual_learning_hours) as hours FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false) + " GROUP BY to_char(sa.created_at, \'Mon\')",',
}

for k, v in replacements.items():
    content = content.replace(k, v)

with open(r'C:\Project\Xebia\backend\src\main\java\com\xebia\lms\analytics\service\AnalyticsService.java', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed ambiguous GROUP BY in AnalyticsService.java")
