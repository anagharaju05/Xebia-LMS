import { useMemo, useState } from "react";
import {
  Activity,
  Bell,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  CalendarClock,
  ClipboardList,
  GraduationCap,
  Flame,
  Home,
  LogOut,
  Layers3,
  MessageCircle,
  Moon,
  PlayCircle,
  Send,
  Star,
  Sparkles,
  Sun,
  Trophy
} from "lucide-react";
import StudentContentRenderer from "./StudentContentRenderer.jsx";
import { useStudentPortal } from "./useStudentPortal.js";
import { ASSESSMENTS } from "./student.data.js";
import StudentAssessments from "./StudentAssessments.jsx";
import { getLearningIcon } from "../../utils/learningIcon.utils.js";
import { useStudentManagement } from "../students/useStudentManagement.js";
import StudentBatchWorkspace from "./StudentBatchWorkspace.jsx";

const STUDENT_VIEWS = {
  HOME: "home",
  LEARNING: "learning",
  COURSE: "course",
  TASKS: "tasks",
  ASSESSMENTS: "assessments",
  BATCHES: "batches",
  CALENDAR: "calendar",
  ANALYTICS: "analytics",
  NOTIFICATIONS: "notifications",
  FEEDBACK: "feedback"
};

function getAssignedCourses(store, assignedCourseSlugs) {
  return store.courses.filter(
    (course) =>
      assignedCourseSlugs.includes(course.slug) &&
      course.isActive &&
      course.isPublished
  );
}

function getCourseLessons(store, courseId) {
  const modules = store.modules
    .filter((module) => module.courseId === courseId && module.isActive)
    .sort((a, b) => a.order - b.order);

  return modules.flatMap((module) =>
    store.submodules
      .filter((lesson) => lesson.moduleId === module.id && lesson.isActive)
      .sort((a, b) => a.order - b.order)
      .map((lesson) => ({ ...lesson, module }))
  );
}

function getCourseProgress(store, courseId, completedLessonIds) {
  const lessons = getCourseLessons(store, courseId);
  if (!lessons.length) return 0;
  const completed = lessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length;
  return Math.round((completed / lessons.length) * 100);
}

function StudentCourseCard({ course, progress, onOpen }) {
  const LearningIcon = getLearningIcon(course.title, course.description);
  return (
    <article className="student-course-card" style={{ "--student-accent": course.accentColor || "#6C1D5F" }}>
      <div className="student-course-art">
        {course.thumbnail ? <img src={course.thumbnail} alt="" loading="lazy" decoding="async" /> : <LearningIcon aria-hidden="true" />}
      </div>
      <div className="student-course-card-body">
        <div className="student-course-label"><LearningIcon className="student-course-symbol" aria-hidden="true" /><span>{course.level || "Course"}</span></div>
        <h3>{course.title}</h3>
        <p>{course.shortDescription}</p>
        <div className="student-progress">
          <span><i style={{ width: `${progress}%` }} /></span>
          <strong>{progress}% complete</strong>
        </div>
        <button className="primary" onClick={onOpen}>
          <PlayCircle size={17} /> {progress ? "Continue learning" : "Start course"}
        </button>
      </div>
    </article>
  );
}

function StudentHome({ store, courses, studentState, tasks, user, onOpenCourse, onNavigate, batchStore, assessmentStore }) {
  const completed = studentState.completedLessonIds.length;
  const unread = studentState.notifications.filter((item) => !item.read).length;
  const openTasks = tasks.filter((task) => task.status === "Assigned").length;
  const nextCourse = courses[0];
  const studentId = user?.studentId || user?.id;
  const myBatchIds = batchStore.state.batches.filter((batch) => batch.studentIds.includes(studentId)).map((batch) => batch.id);
  const deadlines = assessmentStore.state.assessments.filter((item) => item.status === "Published" && ((item.assignmentScope === "entire_course") || (item.assignedStudentIds || []).includes(studentId) || (item.assignedBatchIds || []).some((id) => myBatchIds.includes(id)))).sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt)).slice(0, 3);
  const recentAnnouncements = batchStore.state.announcements.filter((item) => myBatchIds.includes(item.batchId)).slice(0, 2);

  return (
    <>
      <section className="student-welcome">
        <div>
          <span>Welcome back, {user?.name?.split(" ")[0] || "Student"}</span>
          <h1>Keep building your learning momentum.</h1>
          <p>Your assigned learning, upcoming sessions, and results are together in one place.</p>
          {nextCourse && (
            <button className="primary" onClick={() => onOpenCourse(nextCourse.id)}>
              <PlayCircle size={18} /> Continue {nextCourse.title}
            </button>
          )}
        </div>
        <GraduationCap aria-hidden="true" />
      </section>

      <section className="student-metrics">
        <button onClick={() => onNavigate(STUDENT_VIEWS.LEARNING)}>
          <BookOpen /><strong>{courses.length}</strong><span>Assigned courses</span>
        </button>
        <button onClick={() => onNavigate(STUDENT_VIEWS.LEARNING)}>
          <CheckCircle2 /><strong>{completed}</strong><span>Lessons completed</span>
        </button>
        <button onClick={() => onNavigate(STUDENT_VIEWS.NOTIFICATIONS)}>
          <Bell /><strong>{unread}</strong><span>Unread notifications</span>
        </button>
        <button onClick={() => onNavigate(STUDENT_VIEWS.TASKS)}>
          <ClipboardList /><strong>{openTasks}</strong><span>Open tasks</span>
        </button>
      </section>

      <div className="student-home-grid">
        <section className="student-panel">
          <header><div><span>My learning</span><h2>Continue where you left off</h2></div></header>
          <div className="student-compact-courses">
            {courses.slice(0, 2).map((course) => {
              const progress = getCourseProgress(store, course.id, studentState.completedLessonIds);
              const LearningIcon = getLearningIcon(course.title, course.description);
              return (
                <button key={course.id} onClick={() => onOpenCourse(course.id)}>
                  <LearningIcon />
                  <span><strong>{course.title}</strong><small>{progress}% complete</small></span>
                  <PlayCircle />
                </button>
              );
            })}
          </div>
        </section>
        <section className="student-panel student-session">
          <header><div><span>Next live session</span><h2>Introduction to Spring Boot</h2></div></header>
          <div className="student-session-time"><Clock3 /><span><strong>Tomorrow, 10:00 AM</strong><small>60 minutes with Meera S.</small></span></div>
          <button className="secondary">View session details</button>
        </section>
      </div>

      <div className="student-dashboard-lower">
        <section className="student-panel student-activity-panel">
          <header><div><span>Timeline</span><h2>Recent activity</h2></div><Activity /></header>
          <div>{recentAnnouncements.map((item) => <article key={item.id}><i><MegaphoneIcon /></i><span><strong>{item.title}</strong><small>{item.message}</small></span><time>Recent</time></article>)}<article><i><CheckCircle2 /></i><span><strong>Assessment feedback received</strong><small>Your REST API Design Brief has been graded.</small></span><time>Today</time></article></div>
        </section>
        <section className="student-panel student-deadline-panel">
          <header><div><span>Plan ahead</span><h2>Upcoming deadlines</h2></div><CalendarClock /></header>
          <div>{deadlines.map((item) => <article key={item.id}><time><strong>{new Date(item.dueAt).getDate()}</strong><small>{new Date(item.dueAt).toLocaleString("en", { month: "short" })}</small></time><span><strong>{item.title}</strong><small>{item.subject} • {item.points} marks</small></span></article>)}</div>
        </section>
        <section className="student-panel student-streak-panel">
          <header><div><span>Consistency</span><h2>Learning streak</h2></div><Flame /></header>
          <div className="streak-count"><Flame /><span><strong>6 days</strong><small>Your best streak is 11 days</small></span></div><div className="streak-days">{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <span className={index < 6 ? "active" : ""} key={`${day}-${index}`}>{index < 6 && <CheckCircle2 />}<small>{day}</small></span>)}</div>
        </section>
      </div>

      <section className="student-recommended">
        <header><div><span>Future-ready learning</span><h2>Recommended for you</h2><p>Personalized recommendations will appear as your learning profile grows.</p></div><Sparkles /></header>
        <div>{["Cloud Native Foundations", "Practical AI for Engineers", "Communication for Tech Leads"].map((title, index) => <article key={title}><span><Sparkles /></span><div><small>{["Cloud", "Artificial Intelligence", "Leadership"][index]}</small><h3>{title}</h3><p>Recommendation preview based on your active learning path.</p></div><button disabled>Coming soon</button></article>)}</div>
      </section>
    </>
  );
}

function MegaphoneIcon() { return <Bell />; }

function LearningView({ store, courses, studentState, onOpenCourse }) {
  return (
    <section>
      <div className="student-page-title">
        <div><span>Assigned learning</span><h1>My Learning</h1><p>Open a course and continue from your latest lesson.</p></div>
      </div>
      <div className="student-course-grid">
        {courses.map((course) => (
          <StudentCourseCard
            key={course.id}
            course={course}
            progress={getCourseProgress(store, course.id, studentState.completedLessonIds)}
            onOpen={() => onOpenCourse(course.id)}
          />
        ))}
      </div>
    </section>
  );
}

function Discussion({ lesson, comments, onComment, onReply }) {
  const [message, setMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState("");
  const [reply, setReply] = useState("");
  const lessonComments = comments.filter((comment) => comment.lessonSlug === lesson.slug);

  function submitComment() {
    onComment(lesson.slug, message);
    setMessage("");
  }

  function submitReply(commentId) {
    onReply(commentId, reply);
    setReply("");
    setReplyingTo("");
  }

  return (
    <section className="student-discussion">
      <header><MessageCircle /><div><h2>Lesson discussion</h2><p>Ask questions and learn with your cohort.</p></div></header>
      <div className="student-comment-compose">
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Add a comment or question..." />
        <button className="primary" onClick={submitComment} disabled={!message.trim()}><Send size={16} /> Post</button>
      </div>
      <div className="student-comment-list">
        {lessonComments.map((comment) => (
          <article key={comment.id}>
            <div className="student-comment-avatar">{comment.author.charAt(0)}</div>
            <div>
              <header><strong>{comment.author}</strong><span>{comment.role} | {comment.createdAt}</span></header>
              <p>{comment.text}</p>
              <button className="student-link" onClick={() => setReplyingTo(comment.id)}>Reply</button>
              {(comment.replies || []).map((item) => (
                <div className="student-reply" key={item.id}>
                  <strong>{item.author}</strong><span>{item.createdAt}</span><p>{item.text}</p>
                </div>
              ))}
              {replyingTo === comment.id && (
                <div className="student-reply-compose">
                  <input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a reply..." />
                  <button className="secondary" onClick={() => submitReply(comment.id)}>Send</button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CourseView({ store, course, studentState, onBack, onComplete, onComment, onReply }) {
  const lessons = getCourseLessons(store, course.id);
  const [lessonId, setLessonId] = useState(lessons[0]?.id || "");
  const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
  const blocks = lesson
    ? store.contentBlocks.filter((block) => block.submoduleId === lesson.id && block.isActive).sort((a, b) => a.order - b.order)
    : [];
  const completed = lesson && studentState.completedLessonIds.includes(lesson.id);
  const progress = getCourseProgress(store, course.id, studentState.completedLessonIds);

  return (
    <section className="student-course-view">
      <button className="student-back" onClick={onBack}><ChevronLeft size={17} /> Back to My Learning</button>
      <header className="student-course-header">
        <div><span>{progress}% complete</span><h1>{course.title}</h1><p>{course.shortDescription}</p></div>
        <div className="student-progress large"><span><i style={{ width: `${progress}%` }} /></span><strong>{progress}%</strong></div>
      </header>
      <div className="student-player-layout">
        <aside className="student-syllabus">
          <h2>Course lessons</h2>
          {store.modules.filter((module) => module.courseId === course.id && module.isActive).sort((a, b) => a.order - b.order).map((module) => {
            const moduleLessons = lessons.filter((item) => item.moduleId === module.id);
            return (
              <section key={module.id}>
                <strong>{module.title}</strong>
                {moduleLessons.map((item, index) => (
                  <button className={item.id === lesson?.id ? "active" : ""} key={item.id} onClick={() => setLessonId(item.id)}>
                    {studentState.completedLessonIds.includes(item.id) ? <CheckCircle2 /> : <span>{index + 1}</span>}
                    <small>{item.title}</small>
                  </button>
                ))}
              </section>
            );
          })}
        </aside>
        <main className="student-lesson">
          {lesson ? (
            <>
              <header><div><span>{lesson.module.title}</span><h1>{lesson.title}</h1><p>{lesson.description}</p></div></header>
              <div className="student-lesson-content">
                {blocks.length ? blocks.map((block) => (
                  <StudentContentRenderer key={block.id} block={block} onVideoEnded={() => onComplete(lesson.id)} />
                )) : (
                  <article className="lesson-copy"><h3>{lesson.title}</h3><p>{lesson.description}</p></article>
                )}
              </div>
              <div className="student-lesson-actions">
                <button className={completed ? "secondary completed" : "primary"} onClick={() => onComplete(lesson.id)}>
                  <CheckCircle2 size={17} /> {completed ? "Lesson completed" : "Mark lesson complete"}
                </button>
              </div>
              <Discussion lesson={lesson} comments={studentState.comments} onComment={onComment} onReply={onReply} />
            </>
          ) : (
            <div className="student-empty"><BookOpen /><h2>Lessons are being prepared</h2><p>Your trainer will publish course content here.</p></div>
          )}
        </main>
      </div>
    </section>
  );
}

function AssessmentsView({ courses, results, onSubmit }) {
  const [selectedId, setSelectedId] = useState("");
  const [answers, setAnswers] = useState({});
  const selected = ASSESSMENTS.find((item) => item.id === selectedId);

  function submit() {
    const result = onSubmit(selected.id, answers);
    if (result) {
      setSelectedId("");
      setAnswers({});
    }
  }

  if (selected) {
    return (
      <section className="student-assessment-form">
        <button className="student-back" onClick={() => setSelectedId("")}><ChevronLeft size={17} /> Back to assessments</button>
        <div className="student-page-title"><div><span>{selected.duration}</span><h1>{selected.title}</h1><p>{selected.description}</p></div></div>
        {selected.practical ? (
          <label className="student-answer"><strong>Your submission</strong><textarea rows="10" value={answers.practical || ""} onChange={(event) => setAnswers({ practical: event.target.value })} placeholder="Describe your approach, implementation, and key decisions..." /></label>
        ) : selected.questions.map((question, index) => (
          <fieldset key={question.id}>
            <legend>{index + 1}. {question.prompt}</legend>
            {question.options.map((option) => (
              <label key={option}><input type="radio" name={question.id} checked={answers[question.id] === option} onChange={() => setAnswers({ ...answers, [question.id]: option })} /><span>{option}</span></label>
            ))}
          </fieldset>
        ))}
        <button className="primary" onClick={submit} disabled={selected.practical ? !answers.practical?.trim() : Object.keys(answers).length < selected.questions.length}><Send size={17} /> Submit assessment</button>
      </section>
    );
  }

  return (
    <section>
      <div className="student-page-title"><div><span>Knowledge and practical checks</span><h1>Assessments</h1><p>Complete assigned work and review results online.</p></div></div>
      <div className="student-assessment-grid">
        {ASSESSMENTS.map((assessment) => {
          const course = courses.find((item) => item.slug === assessment.courseSlug);
          const result = results[assessment.id];
          return (
            <article key={assessment.id}>
              <Trophy />
              <h2>{assessment.title}</h2>
              <p>{assessment.description}</p>
              <div><span>{course?.title || "Assigned course"}</span><span>{assessment.duration}</span></div>
              {result ? (
                <strong className="student-result">{result.score !== undefined ? `${result.score}% score` : result.status}</strong>
              ) : (
                <button className="primary" onClick={() => setSelectedId(assessment.id)}>Start assessment</button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TasksView({ tasks, courses, onSubmit }) {
  const [drafts, setDrafts] = useState({});

  function submitTask(taskId) {
    const submission = drafts[taskId] || "";
    if (onSubmit(taskId, submission)) {
      setDrafts((current) => ({ ...current, [taskId]: "" }));
    }
  }

  return (
    <section>
      <div className="student-page-title">
        <div><span>Assigned work</span><h1>My Tasks</h1><p>Complete tasks from your learning manager and review trainer feedback.</p></div>
      </div>
      <div className="student-task-grid">
        {tasks.length === 0 && <div className="student-empty"><ClipboardList /><h2>No tasks assigned</h2><p>New work from your learning manager will appear here.</p></div>}
        {tasks.map((task) => {
          const course = courses.find((item) => item.slug === task.courseSlug);
          return (
            <article className={`student-task-card ${task.status.toLowerCase()}`} key={task.id}>
              <header>
                <ClipboardList />
                <div><span>{course?.title || "Assigned course"}</span><h2>{task.title}</h2></div>
                <strong>{task.status}</strong>
              </header>
              <p>{task.instructions}</p>
              <div className="student-task-meta"><span>Due {task.dueDate}</span>{task.submittedAt && <span>Submitted {task.submittedAt}</span>}</div>
              {task.status === "Assigned" && (
                <div className="student-task-submit">
                  <textarea rows="5" value={drafts[task.id] || ""} onChange={(event) => setDrafts({ ...drafts, [task.id]: event.target.value })} placeholder="Add your work, solution, or submission notes..." />
                  <button className="primary" disabled={!drafts[task.id]?.trim()} onClick={() => submitTask(task.id)}><Send size={17} /> Submit Task</button>
                </div>
              )}
              {task.status === "Submitted" && <div className="student-task-response"><strong>Submission received</strong><p>{task.submission}</p><span>Waiting for trainer review.</span></div>}
              {task.status === "Reviewed" && <div className="student-task-response reviewed"><strong>{task.score}% score</strong><p>{task.reviewNotes}</p><span>Your submission: {task.submission}</span></div>}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function NotificationsView({ notifications, onRead }) {
  return (
    <section>
      <div className="student-page-title"><div><span>Learning updates</span><h1>Notifications</h1><p>Course, assessment, and session alerts across your preferred channels.</p></div></div>
      <div className="student-notification-list">
        {notifications.map((item) => (
          <button className={item.read ? "" : "unread"} key={item.id} onClick={() => onRead(item.id)}>
            <span className="student-notification-icon"><Bell /></span>
            <span><strong>{item.title}</strong><small>{item.message}</small></span>
            <span><small>{item.channel}</small><time>{item.time}</time></span>
          </button>
        ))}
      </div>
    </section>
  );
}

function FeedbackView({ courses, submitted, onSubmit }) {
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");

  function submit() {
    if (onSubmit(courseId, rating, message)) setMessage("");
  }

  return (
    <section>
      <div className="student-page-title"><div><span>Trainer feedback</span><h1>Share feedback</h1><p>Your feedback is routed to the trainer and learning manager.</p></div></div>
      <div className="student-feedback-layout">
        <section className="student-panel student-feedback-form">
          <label><strong>Course</strong><select value={courseId} onChange={(event) => setCourseId(event.target.value)}>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
          <div><strong>Rating</strong><div className="student-rating">{[1, 2, 3, 4, 5].map((value) => <button className={value <= rating ? "active" : ""} key={value} onClick={() => setRating(value)} title={`${value} stars`}><Star /></button>)}</div></div>
          <label><strong>Comments</strong><textarea rows="7" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell your trainer what worked and what could improve..." /></label>
          <button className="primary" onClick={submit} disabled={!message.trim()}><Send size={17} /> Submit feedback</button>
        </section>
        <section className="student-panel">
          <header><div><span>Submission history</span><h2>Your feedback</h2></div></header>
          {submitted.length ? submitted.map((item) => {
            const course = courses.find((entry) => entry.id === item.courseId);
            return <article className="student-feedback-item" key={item.id}><strong>{course?.title}</strong><span>{item.rating}/5 | {item.submittedAt}</span><p>{item.message}</p></article>;
          }) : <div className="student-empty compact"><MessageCircle /><p>No feedback submitted yet.</p></div>}
        </section>
      </div>
    </section>
  );
}

export default function StudentPortal({ store, theme, onThemeToggle, user, onLogout, showToast, assessmentStore, batchStore }) {
  const [view, setView] = useState(STUDENT_VIEWS.HOME);
  const studentManagement = useStudentManagement();
  const studentRecord = studentManagement.management.students.find(
    (student) => student.id === user?.studentId || student.email === user?.email
  );
  const assignedCourseSlugs = studentRecord?.courseSlugs || [];
  const courses = useMemo(
    () => getAssignedCourses(store, assignedCourseSlugs),
    [store, studentRecord]
  );
  const tasks = studentManagement.management.assignments.filter(
    (assignment) => assignment.studentId === studentRecord?.id
  );
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const portal = useStudentPortal(user);
  const course = courses.find((item) => item.id === courseId) || courses[0];
  const unread = portal.studentState.notifications.filter((item) => !item.read).length;
  const ThemeIcon = theme === "dark" ? Sun : Moon;

  function navigate(nextView) {
    setView(nextView);
  }

  function openCourse(nextCourseId) {
    setCourseId(nextCourseId);
    setView(STUDENT_VIEWS.COURSE);
  }

  function completeLesson(lessonId) {
    portal.markLessonComplete(lessonId);
    showToast?.("Lesson progress saved");
  }

  function submitAssessment(assessmentId, answers) {
    const result = portal.submitAssessment(assessmentId, answers);
    if (result) showToast?.(result.score !== undefined ? `Assessment complete: ${result.score}%` : result.status);
    return result;
  }

  function submitFeedback(nextCourseId, rating, message) {
    const saved = portal.submitFeedback(nextCourseId, rating, message);
    if (saved) showToast?.("Feedback submitted");
    return saved;
  }

  const navItems = [
    [STUDENT_VIEWS.HOME, Home, "Home"],
    [STUDENT_VIEWS.LEARNING, BookOpen, "My Learning"],
    [STUDENT_VIEWS.BATCHES, Layers3, "My Batches"],
    [STUDENT_VIEWS.TASKS, ClipboardList, "Tasks"],
    [STUDENT_VIEWS.ASSESSMENTS, Trophy, "Assessments"],
    [STUDENT_VIEWS.CALENDAR, CalendarDays, "Calendar"],
    [STUDENT_VIEWS.ANALYTICS, BarChart3, "Analytics"],
    [STUDENT_VIEWS.NOTIFICATIONS, Bell, "Notifications"],
    [STUDENT_VIEWS.FEEDBACK, MessageCircle, "Feedback"]
  ];

  return (
    <div className="student-shell">
      <aside className="student-sidebar">
        <div className="student-brand"><img src="/brand/Logo-Purple.png" alt="Xebia" /><span><strong>Xebia Learning</strong><small>Student Portal</small></span></div>
        <nav>
          {navItems.map(([id, Icon, label]) => (
            <button className={(view === id || (id === STUDENT_VIEWS.LEARNING && view === STUDENT_VIEWS.COURSE)) ? "active" : ""} key={id} onClick={() => navigate(id)}>
              <Icon /><span>{label}</span>{id === STUDENT_VIEWS.NOTIFICATIONS && unread > 0 && <b>{unread}</b>}
            </button>
          ))}
        </nav>
        <button className="student-admin-exit" onClick={onLogout}><LogOut /><span>Sign out</span></button>
      </aside>
      <div className="student-main">
        <header className="student-topbar">
          <div><strong>Learning workspace</strong><span>Assigned courses and progress</span></div>
          <div>
            <button title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} onClick={onThemeToggle}><ThemeIcon /></button>
            <button className="student-bell" title="Notifications" onClick={() => navigate(STUDENT_VIEWS.NOTIFICATIONS)}><Bell />{unread > 0 && <span>{unread}</span>}</button>
            <button title="Sign out" onClick={onLogout}><LogOut /></button>
            <div className="student-profile"><div>{user?.name?.charAt(0) || "S"}</div><span><strong>{user?.name || "Student"}</strong><small>Student</small></span></div>
          </div>
        </header>
        <main className="student-content">
          {view === STUDENT_VIEWS.HOME && <StudentHome store={store} courses={courses} studentState={portal.studentState} tasks={tasks} user={user} onOpenCourse={openCourse} onNavigate={navigate} batchStore={batchStore} assessmentStore={assessmentStore} />}
          {view === STUDENT_VIEWS.LEARNING && <LearningView store={store} courses={courses} studentState={portal.studentState} onOpenCourse={openCourse} />}
          {view === STUDENT_VIEWS.TASKS && <TasksView tasks={tasks} courses={courses} onSubmit={(taskId, submission) => {
            const saved = studentManagement.submitAssignment(taskId, submission);
            if (saved) showToast?.("Task submitted");
            return saved;
          }} />}
          {view === STUDENT_VIEWS.COURSE && course && <CourseView store={store} course={course} studentState={portal.studentState} onBack={() => navigate(STUDENT_VIEWS.LEARNING)} onComplete={completeLesson} onComment={portal.addComment} onReply={portal.addReply} />}
          {view === STUDENT_VIEWS.ASSESSMENTS && <StudentAssessments assessmentStore={assessmentStore} batchStore={batchStore} user={user} showToast={showToast} />}
          {view === STUDENT_VIEWS.BATCHES && <StudentBatchWorkspace mode="batches" batchStore={batchStore} assessmentStore={assessmentStore} user={user} showToast={showToast} />}
          {view === STUDENT_VIEWS.CALENDAR && <StudentBatchWorkspace mode="calendar" batchStore={batchStore} assessmentStore={assessmentStore} user={user} showToast={showToast} />}
          {view === STUDENT_VIEWS.ANALYTICS && <StudentBatchWorkspace mode="analytics" batchStore={batchStore} assessmentStore={assessmentStore} user={user} showToast={showToast} />}
          {view === STUDENT_VIEWS.NOTIFICATIONS && <NotificationsView notifications={portal.studentState.notifications} onRead={portal.markNotificationRead} />}
          {view === STUDENT_VIEWS.FEEDBACK && <FeedbackView courses={courses} submitted={portal.studentState.feedback} onSubmit={submitFeedback} />}
        </main>
      </div>
    </div>
  );
}
