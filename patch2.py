import re

with open(r'C:\Project\Xebia\backend\src\main\java\com\xebia\lms\analytics\service\AnalyticsService.java', 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace specific queries manually to ensure correctness

replacements = {
    # getLearningCoverage
    'Integer totalLearners = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students", Integer.class);':
    'Integer totalLearners = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students s" + buildFilterWhereClause(request, "s", "created_at", "s", false), Integer.class);',

    'Integer trained = jdbcTemplate.queryForObject("SELECT COUNT(DISTINCT student_id) FROM session_attendances WHERE progress_percentage > 0", Integer.class);':
    'Integer trained = jdbcTemplate.queryForObject("SELECT COUNT(DISTINCT sa.student_id) FROM session_attendances sa JOIN students s ON sa.student_id = s.id WHERE sa.progress_percentage > 0" + buildFilterWhereClause(request, "s", "created_at", "sa", true), Integer.class);',

    '"SELECT s.region as name, COUNT(DISTINCT sa.student_id) as trained FROM students s LEFT JOIN session_attendances sa ON s.id = sa.student_id GROUP BY s.region ORDER BY trained DESC",':
    '"SELECT s.region as name, COUNT(DISTINCT sa.student_id) as trained FROM students s LEFT JOIN session_attendances sa ON s.id = sa.student_id" + buildFilterWhereClause(request, "s", "created_at", "sa", false) + " GROUP BY s.region ORDER BY trained DESC",',

    '"SELECT to_char(created_at, \'Mon\') as name, COUNT(DISTINCT student_id) as value FROM session_attendances GROUP BY name",':
    '"SELECT to_char(sa.created_at, \'Mon\') as name, COUNT(DISTINCT sa.student_id) as value FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false) + " GROUP BY name",',

    '"SELECT s.business_unit as name, COUNT(DISTINCT sa.student_id) * 100 / NULLIF(COUNT(s.id), 0) as coverage FROM students s LEFT JOIN session_attendances sa ON s.id = sa.student_id WHERE s.business_unit IS NOT NULL GROUP BY s.business_unit ORDER BY coverage DESC",':
    '"SELECT s.business_unit as name, COUNT(DISTINCT sa.student_id) * 100 / NULLIF(COUNT(s.id), 0) as coverage FROM students s LEFT JOIN session_attendances sa ON s.id = sa.student_id WHERE s.business_unit IS NOT NULL" + buildFilterWhereClause(request, "s", "created_at", "sa", true) + " GROUP BY s.business_unit ORDER BY coverage DESC",',

    # getLearningHours
    'Double totalHours = jdbcTemplate.queryForObject("SELECT SUM(actual_learning_hours) FROM session_attendances", Double.class);':
    'Double totalHours = jdbcTemplate.queryForObject("SELECT SUM(sa.actual_learning_hours) FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false), Double.class);',

    'Integer headcount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students", Integer.class);':
    'Integer headcount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students s" + buildFilterWhereClause(request, "s", "created_at", "s", false), Integer.class);',

    'Integer activeLearners = jdbcTemplate.queryForObject("SELECT COUNT(DISTINCT student_id) FROM session_attendances WHERE actual_learning_hours > 0", Integer.class);':
    'Integer activeLearners = jdbcTemplate.queryForObject("SELECT COUNT(DISTINCT sa.student_id) FROM session_attendances sa JOIN students s ON sa.student_id = s.id WHERE sa.actual_learning_hours > 0" + buildFilterWhereClause(request, "s", "created_at", "sa", true), Integer.class);',

    '"SELECT s.region as name, SUM(sa.actual_learning_hours) / NULLIF(COUNT(DISTINCT s.id), 0) as avg_hours FROM students s LEFT JOIN session_attendances sa ON s.id = sa.student_id WHERE s.region IS NOT NULL GROUP BY s.region ORDER BY avg_hours DESC",':
    '"SELECT s.region as name, SUM(sa.actual_learning_hours) / NULLIF(COUNT(DISTINCT s.id), 0) as avg_hours FROM students s LEFT JOIN session_attendances sa ON s.id = sa.student_id WHERE s.region IS NOT NULL" + buildFilterWhereClause(request, "s", "created_at", "sa", true) + " GROUP BY s.region ORDER BY avg_hours DESC",',

    '"SELECT to_char(created_at, \'Mon\') as name, SUM(actual_learning_hours) as hours FROM session_attendances GROUP BY name",':
    '"SELECT to_char(sa.created_at, \'Mon\') as name, SUM(sa.actual_learning_hours) as hours FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false) + " GROUP BY name",',

    '"SELECT s.region as name, SUM(sa.actual_learning_hours) as hours FROM students s JOIN session_attendances sa ON s.id = sa.student_id WHERE s.region IS NOT NULL GROUP BY s.region ORDER BY hours DESC LIMIT 5",':
    '"SELECT s.region as name, SUM(sa.actual_learning_hours) as hours FROM students s JOIN session_attendances sa ON s.id = sa.student_id WHERE s.region IS NOT NULL" + buildFilterWhereClause(request, "s", "created_at", "sa", true) + " GROUP BY s.region ORDER BY hours DESC LIMIT 5",',

    '"SELECT s.name as name, SUM(sa.actual_learning_hours) as hours, s.region as region FROM students s JOIN session_attendances sa ON s.id = sa.student_id GROUP BY s.id, s.name, s.region ORDER BY hours DESC LIMIT 5",':
    '"SELECT s.name as name, SUM(sa.actual_learning_hours) as hours, s.region as region FROM students s JOIN session_attendances sa ON s.id = sa.student_id" + buildFilterWhereClause(request, "s", "created_at", "sa", false) + " GROUP BY s.id, s.name, s.region ORDER BY hours DESC LIMIT 5",',
    
    # getLearningPillars (has one) - wait, it already has Double totalHours which is replaced above?
    # No, getLearningPillars is a different method
    'Double totalHours = jdbcTemplate.queryForObject("SELECT SUM(actual_learning_hours) FROM session_attendances", Double.class);':
    'Double totalHours = jdbcTemplate.queryForObject("SELECT SUM(sa.actual_learning_hours) FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false), Double.class);',

    # getCertifications
    'Integer total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM student_certifications", Integer.class);':
    'Integer total = jdbcTemplate.queryForObject("SELECT COUNT(sc.id) FROM student_certifications sc JOIN students s ON sc.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sc", false), Integer.class);',

    '"SELECT technology as name, COUNT(*) as count FROM student_certifications GROUP BY technology ORDER BY count DESC LIMIT 5",':
    '"SELECT sc.technology as name, COUNT(sc.id) as count FROM student_certifications sc JOIN students s ON sc.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sc", false) + " GROUP BY sc.technology ORDER BY count DESC LIMIT 5",',

    '"SELECT s.name as studentName, c.certification_name as certification, to_char(c.created_at, \'YYYY-MM-DD\') as date FROM student_certifications c JOIN students s ON c.student_id = s.id ORDER BY c.created_at DESC LIMIT 5",':
    '"SELECT s.name as studentName, c.certification_name as certification, to_char(c.created_at, \'YYYY-MM-DD\') as date FROM student_certifications c JOIN students s ON c.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "c", false) + " ORDER BY c.created_at DESC LIMIT 5",',

    # getTrainingEffectiveness
    'Double avgRating = jdbcTemplate.queryForObject("SELECT AVG(session_rating) FROM student_feedback", Double.class);':
    'Double avgRating = jdbcTemplate.queryForObject("SELECT AVG(f.session_rating) FROM student_feedback f JOIN students s ON f.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "f", false), Double.class);',

    '"SELECT course_id as name, AVG(session_rating) as score FROM student_feedback GROUP BY course_id LIMIT 5",':
    '"SELECT f.course_id as name, AVG(f.session_rating) as score FROM student_feedback f JOIN students s ON f.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "f", false) + " GROUP BY f.course_id LIMIT 5",',

    '"SELECT session_rating as rating, COUNT(*) as count FROM student_feedback GROUP BY session_rating ORDER BY session_rating DESC",':
    '"SELECT f.session_rating as rating, COUNT(f.id) as count FROM student_feedback f JOIN students s ON f.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "f", false) + " GROUP BY f.session_rating ORDER BY f.session_rating DESC",',

    # getLearningChampions
    '"SELECT s.name, SUM(sa.actual_learning_hours) as hours FROM session_attendances sa JOIN students s ON sa.student_id = s.id GROUP BY s.name ORDER BY hours DESC LIMIT 5",':
    '"SELECT s.name, SUM(sa.actual_learning_hours) as hours FROM session_attendances sa JOIN students s ON sa.student_id = s.id" + buildFilterWhereClause(request, "s", "created_at", "sa", false) + " GROUP BY s.name ORDER BY hours DESC LIMIT 5",',
    
    # getFresherJourney
    'Integer freshersCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students WHERE employment_type = \'Fresher\'", Integer.class);':
    'Integer freshersCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students s WHERE s.employment_type = \'Fresher\'" + buildFilterWhereClause(request, "s", "created_at", "s", true), Integer.class);',
}

for k, v in replacements.items():
    content = content.replace(k, v)

with open(r'C:\Project\Xebia\backend\src\main\java\com\xebia\lms\analytics\service\AnalyticsService.java', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated other dashboards in AnalyticsService.java with dynamic filtering")
