import { useMemo, useState } from "react";
import {
  BarChart3, Bell, BookOpen, BookOpenCheck, CalendarDays, Check, CheckCircle2, ChevronRight, ClipboardCheck,
  ClipboardList, Clock3, Code2, ExternalLink, FilePenLine, FileSpreadsheet, FileText, GraduationCap,
  HelpCircle, Inbox, LogOut, Menu, MessageCircleQuestion, Moon, MoreVertical,
  Layers3, Paperclip, Pencil, Plus, RotateCcw, Search, Send, Sun, Trash2, Upload, Users,
  X, XCircle, Archive, MapPin, Clock
} from "lucide-react";
import { ASSESSMENT_TYPES, createBlankAssessment } from "../assessments/assessment.data.js";
import { parseQuizSpreadsheet, QUIZ_EXCEL_COLUMNS } from "../../services/excelQuiz.service.js";
import TeacherBatchWorkspace from "./TeacherBatchWorkspace.jsx";
import { useStudentManagement } from "../students/useStudentManagement.js";

const VIEWS = {
  DASHBOARD: "dashboard",
  ASSESSMENTS: "assessments",
  SUBMISSIONS: "submissions",
  QUESTIONS: "questions",
  BATCHES: "batches",
  SUBJECTS: "subjects",
  CALENDAR: "calendar",
  ANALYTICS: "analytics",
  EVENTS: "events"
};

const TYPE_META = {
  file: { label: "File upload", icon: FileText, tone: "purple" },
  quiz: { label: "Excel quiz", icon: FileSpreadsheet, tone: "green" },
  coding: { label: "Coding", icon: Code2, tone: "orange" }
};

function formatDate(value, includeTime = true) {
  if (!value) return "";
  try {
    let date;
    if (Array.isArray(value)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = value;
      date = new Date(year, month - 1, day, hour, minute, second);
    } else {
      date = new Date(value);
    }
    if (isNaN(date.getTime())) return "Unknown date";
    
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric", month: "short", year: "numeric", ...(includeTime ? { hour: "numeric", minute: "2-digit" } : {})
    }).format(date);
  } catch (e) {
    return "Unknown date";
  }
}

function TypeBadge({ type }) {
  const meta = TYPE_META[type] || TYPE_META.file;
  const Icon = meta.icon;
  return <span className={`assessment-type ${meta.tone}`}><Icon />{meta.label}</span>;
}

function StatusPill({ status }) {
  return <span className={`assessment-status ${status.toLowerCase()}`}>{status}</span>;
}

function Modal({ children, title, subtitle, onClose, wide = false }) {
  return (
    <div className="assessment-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`assessment-modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <header>
          <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
          <button className="assessment-icon-btn" onClick={onClose} aria-label="Close"><X /></button>
        </header>
        {children}
      </section>
    </div>
  );
}

function AssessmentEditor({ initial, onClose, onSave, showToast, batchStore, students }) {
  const [form, setForm] = useState(() => ({ ...createBlankAssessment(), ...initial }));
  const [error, setError] = useState("");
  const [importingQuiz, setImportingQuiz] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateTest(id, field, value) {
    update("testCases", form.testCases.map((test) => test.id === id ? { ...test, [field]: value } : test));
  }

  async function importQuiz(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportingQuiz(true);
    setError("");
    try {
      const result = await parseQuizSpreadsheet(file);
      setForm((current) => ({ ...current, quizFileName: file.name, quizQuestions: result.questions, points: result.totalMarks }));
      showToast?.(`${result.questions.length} quiz questions imported`);
    } catch (importError) {
      setError(importError.message || "Could not read this quiz spreadsheet.");
    } finally {
      setImportingQuiz(false);
      event.target.value = "";
    }
  }

  function submit(event, status = form.status) {
    event?.preventDefault();
    if (!form.title.trim() || !form.subject.trim() || !form.instructions.trim() || !form.dueAt) {
      setError("Title, subject, instructions, and deadline are required.");
      return;
    }
    if (form.type === "quiz" && !form.quizQuestions?.length) {
      setError("Import an Excel or CSV file containing at least one valid quiz question.");
      return;
    }
    if (form.type === "coding" && form.testCases.some((test) => !test.input.trim() || !test.expected.trim())) {
      setError("Every coding test needs input and an expected output.");
      return;
    }
    const assignedStudentIds = form.assignmentScope === "entire_course"
      ? students.map((student) => student.id)
      : form.assignmentScope === "selected_batch"
        ? [...new Set(batchStore.state.batches.filter((batch) => form.assignedBatchIds.includes(batch.id)).flatMap((batch) => batch.studentIds))]
        : form.assignedStudentIds;
    onSave({ ...form, assignedStudentIds, status, points: Number(form.points) });
    showToast?.(form.id ? "Assessment updated" : status === "Published" ? "Assessment published" : "Draft saved");
    onClose();
  }

  return (
    <Modal title={form.id ? "Edit assessment" : "Create assessment"} subtitle="Set the work, delivery format, class, and deadline." onClose={onClose} wide>
      <form className="assessment-editor" onSubmit={submit}>
        <div className="assessment-form-grid">
          <label className="assessment-field span-2"><span>Assessment title *</span><input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. REST API Design Brief" /></label>
          <label className="assessment-field"><span>Subject / course *</span><input value={form.subject} onChange={(e) => update("subject", e.target.value)} placeholder="Spring Boot Masterclass" /></label>
          <label className="assessment-field"><span>Class</span><select value={form.className} onChange={(e) => update("className", e.target.value)}>{batchStore.state.batches.map(batch => <option key={batch.id} value={batch.name}>{batch.name}</option>)}</select></label>
        </div>

        <fieldset className="assessment-type-picker">
          <legend>Submission format</legend>
          <div>{ASSESSMENT_TYPES.map((type) => {
            const meta = TYPE_META[type.value];
            const Icon = meta.icon;
            return <button type="button" key={type.value} className={form.type === type.value ? "active" : ""} onClick={() => update("type", type.value)}><Icon /><span><strong>{type.label}</strong><small>{type.description}</small></span>{form.type === type.value && <Check />}</button>;
          })}</div>
        </fieldset>

        <label className="assessment-field"><span>Instructions *</span><textarea rows="5" value={form.instructions} onChange={(e) => update("instructions", e.target.value)} placeholder="Explain what students need to complete and how it will be evaluated." /></label>

        {form.type === "file" && (
          <section className="assessment-format-panel">
            <div><FileText /><span><strong>Accepted file types</strong><small>Students can submit one PDF or DOCX file.</small></span></div>
            <label className="assessment-upload"><Upload /><span>{form.attachmentName || "Attach question paper or reference file"}</span><input type="file" accept=".pdf,.docx" onChange={(e) => update("attachmentName", e.target.files?.[0]?.name || "")} /></label>
          </section>
        )}

        {form.type === "quiz" && (
          <section className="assessment-format-panel quiz-import-panel">
            <div><FileSpreadsheet /><span><strong>Import quiz from Excel</strong><small>Upload an XLSX or CSV file. The first worksheet is used.</small></span></div>
            <div className="quiz-column-guide"><strong>Required spreadsheet columns</strong><div>{QUIZ_EXCEL_COLUMNS.map((column) => <code key={column}>{column}</code>)}</div><small>Correct Answer may contain A, B, C, D, or the exact option text. Marks defaults to 1.</small></div>
            <label className={`assessment-upload ${form.quizQuestions?.length ? "ready" : ""}`}><Upload /><span>{importingQuiz ? "Reading spreadsheet…" : form.quizFileName || "Choose .xlsx or .csv quiz file"}</span><input type="file" accept=".xlsx,.csv" onChange={importQuiz} disabled={importingQuiz} /></label>
            {form.quizQuestions?.length > 0 && <div className="quiz-import-summary"><header><span><CheckCircle2 /><strong>{form.quizQuestions.length} questions ready</strong></span><b>{form.quizQuestions.reduce((sum, question) => sum + question.marks, 0)} total marks</b></header><div>{form.quizQuestions.slice(0, 4).map((question, index) => <article key={question.id}><b>{index + 1}</b><span><strong>{question.prompt}</strong><small>{question.options.length} options • {question.marks} marks • Answer: {question.answer}</small></span></article>)}</div>{form.quizQuestions.length > 4 && <small>+ {form.quizQuestions.length - 4} more questions</small>}</div>}
          </section>
        )}

        {form.type === "coding" && (
          <section className="assessment-format-panel coding">
            <div><Code2 /><span><strong>Coding workspace</strong><small>Configure starter code and visible or hidden tests.</small></span></div>
            <label className="assessment-field"><span>Language</span><select value={form.language} onChange={(e) => update("language", e.target.value)}><option value="javascript">JavaScript</option><option value="python">Python (runner service required)</option><option value="java">Java (runner service required)</option></select></label>
            <label className="assessment-field"><span>Starter code</span><textarea className="code-input" rows="7" value={form.starterCode} onChange={(e) => update("starterCode", e.target.value)} spellCheck="false" /></label>
            <div className="test-case-builder">
              <header><span><strong>Test cases</strong><small>Hidden tests are not shown to students.</small></span><button type="button" onClick={() => update("testCases", [...form.testCases, { id: `test-${Date.now()}`, input: "", expected: "", hidden: false }])}><Plus /> Add test</button></header>
              {form.testCases.map((test, index) => <div className="test-case-row" key={test.id}><b>{index + 1}</b><input value={test.input} onChange={(e) => updateTest(test.id, "input", e.target.value)} placeholder="Input: [1, 2]" /><input value={test.expected} onChange={(e) => updateTest(test.id, "expected", e.target.value)} placeholder="Expected: 3" /><label><input type="checkbox" checked={test.hidden} onChange={(e) => updateTest(test.id, "hidden", e.target.checked)} /> Hidden</label><button type="button" aria-label="Remove test" disabled={form.testCases.length === 1} onClick={() => update("testCases", form.testCases.filter((item) => item.id !== test.id))}><Trash2 /></button></div>)}
            </div>
          </section>
        )}

        <div className="assessment-form-grid">
          <label className="assessment-field"><span>Deadline *</span><input type="datetime-local" value={form.dueAt} onChange={(e) => update("dueAt", e.target.value)} /></label>
          <label className="assessment-field"><span>Maximum marks</span><input type="number" min="1" max="1000" value={form.points} onChange={(e) => update("points", e.target.value)} /></label>
        </div>

        <fieldset className="allocation-picker"><legend>Who should receive this assessment?</legend><div>{[["entire_course", BookOpenCheck, "Entire course", "All enrolled students"], ["selected_batch", Users, "Selected batch", "One or more cohorts"], ["selected_students", GraduationCap, "Selected students", "Individual allocation"]].map(([value, Icon, label, hint]) => <button type="button" className={form.assignmentScope === value ? "active" : ""} key={value} onClick={() => update("assignmentScope", form.assignmentScope === value ? "" : value)}><Icon /><span><strong>{label}</strong><small>{hint}</small></span>{form.assignmentScope === value && <Check />}</button>)}</div></fieldset>
        {form.assignmentScope === "selected_batch" && <fieldset className="student-picker"><legend>Select batches</legend><p>{form.assignedBatchIds.length} selected</p><div>{batchStore.state.batches.filter((batch) => batch.status === "Active").map((batch) => <label key={batch.id}><input type="checkbox" checked={form.assignedBatchIds.includes(batch.id)} onChange={(e) => update("assignedBatchIds", e.target.checked ? [...form.assignedBatchIds, batch.id] : form.assignedBatchIds.filter((id) => id !== batch.id))} /><span>{batch.name}<small>{batch.studentIds.length} students</small></span></label>)}</div></fieldset>}
        {form.assignmentScope === "selected_students" && <fieldset className="student-picker"><legend>Assign to students</legend><p>{form.assignedStudentIds.length} of {students.length} selected</p><div>{students.map((student) => <label key={student.id}><input type="checkbox" checked={form.assignedStudentIds.includes(student.id)} onChange={(e) => update("assignedStudentIds", e.target.checked ? [...form.assignedStudentIds, student.id] : form.assignedStudentIds.filter((id) => id !== student.id))} /><span>{student.name}<small>{student.email}</small></span></label>)}</div></fieldset>}

        {error && <p className="assessment-form-error"><XCircle />{error}</p>}
        <footer className="assessment-modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button type="button" className="secondary" onClick={(event) => submit(event, "Draft")}>Save draft</button><button className="primary" type="button" onClick={(event) => submit(event, "Published")}><Send /> Publish assessment</button></footer>
      </form>
    </Modal>
  );
}

function TeacherDashboard({ state, onNavigate, onCreate }) {
  const published = state.assessments.filter((item) => item.status === "Published");
  const awaiting = state.submissions.filter((item) => item.status === "Submitted");
  const graded = state.submissions.filter((item) => item.status === "Graded");
  const unanswered = state.questions.filter((item) => !item.answer);
  const recent = [...state.submissions].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 4);
  return (
    <section className="teacher-page">
      <div className="teacher-hero"><div><span>Monday, 6 July</span><h1>Good afternoon, Meera.</h1><p>Here’s what needs your attention across your classes.</p><button onClick={onCreate}><Plus /> Create assessment</button></div><GraduationCap /></div>
      <div className="teacher-metrics">
        <button onClick={() => onNavigate(VIEWS.ASSESSMENTS)}><span className="purple"><ClipboardList /></span><div><strong>{published.length}</strong><small>Live assessments</small></div><ChevronRight /></button>
        <button onClick={() => onNavigate(VIEWS.SUBMISSIONS)}><span className="orange"><Inbox /></span><div><strong>{awaiting.length}</strong><small>Awaiting review</small></div><ChevronRight /></button>
        <button onClick={() => onNavigate(VIEWS.SUBMISSIONS)}><span className="green"><CheckCircle2 /></span><div><strong>{graded.length}</strong><small>Graded submissions</small></div><ChevronRight /></button>
        <button onClick={() => onNavigate(VIEWS.QUESTIONS)}><span className="blue"><HelpCircle /></span><div><strong>{unanswered.length}</strong><small>Student questions</small></div><ChevronRight /></button>
      </div>
      <div className="teacher-dashboard-grid">
        <section className="teacher-panel">
          <header><div><span>Needs attention</span><h2>Recent submissions</h2></div><button onClick={() => onNavigate(VIEWS.SUBMISSIONS)}>View all <ChevronRight /></button></header>
          <div className="recent-submissions">{recent.map((submission) => {
            const assessment = state.assessments.find((item) => item.id === submission.assessmentId);
            return <button key={submission.id} onClick={() => onNavigate(VIEWS.SUBMISSIONS)}><span className="student-avatar">{submission.studentName.split(" ").map((word) => word[0]).join("")}</span><span><strong>{submission.studentName}</strong><small>{assessment?.title}</small></span><time>{formatDate(submission.submittedAt)}</time><StatusPill status={submission.status} /></button>;
          })}</div>
        </section>
        <section className="teacher-panel upcoming-panel">
          <header><div><span>Next up</span><h2>Upcoming deadlines</h2></div></header>
          {published.slice().sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt)).slice(0, 4).map((assessment) => <article key={assessment.id}><div className="date-tile"><strong>{new Date(assessment.dueAt).getDate()}</strong><small>{new Date(assessment.dueAt).toLocaleString("en", { month: "short" })}</small></div><div><strong>{assessment.title}</strong><small>{assessment.className}</small></div><span>{assessment.points} marks</span></article>)}
        </section>
      </div>
    </section>
  );
}

function AssessmentsPage({ state, onCreate, onEdit, onDelete, onStatus }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const filtered = state.assessments.filter((assessment) => (filter === "All" || assessment.status === filter) && `${assessment.title} ${assessment.subject} ${assessment.className}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <section className="teacher-page">
      <div className="teacher-page-heading"><div><span>Coursework</span><h1>Assessments</h1><p>Create, publish, and manage work for every class.</p></div><button className="primary" onClick={onCreate}><Plus /> Create assessment</button></div>
      <div className="assessment-toolbar"><label><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search assessments" /></label><div>{["All", "Published", "Draft"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}{item !== "All" && <span>{state.assessments.filter((a) => a.status === item).length}</span>}</button>)}</div></div>
      <div className="assessment-list">
        {filtered.map((assessment) => {
          const submissions = state.submissions.filter((item) => item.assessmentId === assessment.id);
          const graded = submissions.filter((item) => item.status === "Graded").length;
          const total = assessment.assignedStudentIds.length;
          const AssessmentIcon = TYPE_META[assessment.type].icon;
          return <article key={assessment.id}>
            <div className={`assessment-list-icon ${TYPE_META[assessment.type].tone}`}><AssessmentIcon /></div>
            <div className="assessment-list-main"><div><TypeBadge type={assessment.type} /><StatusPill status={assessment.status} /></div><h2>{assessment.title}</h2><p>{assessment.subject} <span>•</span> {assessment.className}</p><div className="assessment-list-meta"><span><Clock3 />Due {formatDate(assessment.dueAt)}</span><span><BarChart3 />{assessment.points} marks</span><span><Users />{total} students</span></div></div>
            <div className="assessment-progress"><strong>{submissions.length}/{total}</strong><span>submitted</span><div><i style={{ width: `${total ? (submissions.length / total) * 100 : 0}%` }} /></div><small>{graded} graded</small></div>
            <div className="assessment-card-actions"><button title="Edit" onClick={() => onEdit(assessment)}><Pencil /></button><button title={assessment.status === "Published" ? "Move to draft" : "Publish"} onClick={() => onStatus(assessment.id, assessment.status === "Published" ? "Draft" : "Published")}>{assessment.status === "Published" ? <RotateCcw /> : <Send />}</button><button className="danger" title="Delete" onClick={() => onDelete(assessment)}><Trash2 /></button></div>
          </article>;
        })}
        {!filtered.length && <div className="teacher-empty"><Search /><h2>No assessments found</h2><p>Try a different search or create a new assessment.</p></div>}
      </div>
    </section>
  );
}

function ReviewModal({ submission, assessment, onClose, onGrade, showToast }) {
  const [score, setScore] = useState(submission.score ?? "");
  const [feedback, setFeedback] = useState(submission.feedback || "");
  function save(event) {
    event.preventDefault();
    if (score === "" || Number(score) < 0 || Number(score) > assessment.points) return;
    onGrade(submission.id, score, feedback);
    showToast?.("Marks and feedback saved");
    onClose();
  }
  return <Modal title={`Review ${submission.studentName}`} subtitle={assessment.title} onClose={onClose} wide>
    <form className="submission-review" onSubmit={save}>
      <section className="submission-preview"><header><TypeBadge type={submission.type} /><span>Submitted {formatDate(submission.submittedAt)}</span></header>
        {submission.type === "file" && <div className="submitted-file"><FileText /><span><strong>{submission.fileName}</strong><small>{submission.fileSize || "Uploaded file"}</small></span><button type="button" onClick={() => {
          if (submission.fileUrl) {
            window.open(submission.fileUrl, "_blank");
          } else {
            const win = window.open("", "_blank");
            if (win) {
              win.document.write(`
                <html>
                  <head>
                    <title>Preview - ${submission.fileName}</title>
                    <style>
                      body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f3f4f6; color: #1f2937; }
                      .card { background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 500px; text-align: center; }
                      h1 { color: #8b5cf6; margin-top: 0; }
                      p { line-height: 1.6; }
                      .meta { background: #f3f4f6; padding: 1rem; border-radius: 8px; font-size: 0.875rem; margin: 1.5rem 0; text-align: left; }
                      button { background: #8b5cf6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
                      button:hover { background: #7c3aed; }
                    </style>
                  </head>
                  <body>
                    <div class="card">
                      <h1>Mock Document Viewer</h1>
                      <p>This submission was uploaded in an earlier session without a physical file attachment. Below are the submission details:</p>
                      <div class="meta">
                        <div><strong>Student:</strong> ${submission.studentName}</div>
                        <div><strong>File Name:</strong> ${submission.fileName}</div>
                        <div><strong>File Size:</strong> ${submission.fileSize || "119 KB"}</div>
                        <div><strong>Note:</strong> ${submission.note || "No notes provided"}</div>
                      </div>
                      <button onclick="window.close()">Close Preview</button>
                    </div>
                  </body>
                </html>
              `);
              win.document.close();
            }
          }
        }}><ExternalLink /> Preview</button></div>}
        {submission.type === "quiz" && <div className="quiz-review"><div><FileSpreadsheet /><span><strong>{submission.quizResults?.correct || 0} of {submission.quizResults?.total || 0} correct</strong><small>Automatically scored {submission.score}/{assessment.points}</small></span></div>{assessment.quizQuestions?.map((question, index) => { const answer = submission.quizAnswers?.[question.id]; const correct = answer === question.answer; return <article className={correct ? "correct" : "incorrect"} key={question.id}><span>{correct ? <CheckCircle2 /> : <XCircle />}</span><div><strong>{index + 1}. {question.prompt}</strong><small>Student: {answer || "No answer"} • Correct: {question.answer}</small></div></article>; })}</div>}
        {submission.type === "coding" && <><pre><code>{submission.code}</code></pre><div className="test-summary"><CheckCircle2 /><strong>{submission.testResults?.passed || 0} of {submission.testResults?.total || 0} automated tests passed</strong></div></>}
        {submission.note && <blockquote>{submission.note}</blockquote>}
      </section>
      <aside className="grading-panel"><h3>Evaluation</h3><label><span>Marks</span><div><input type="number" min="0" max={assessment.points} value={score} onChange={(e) => setScore(e.target.value)} required /><strong>/ {assessment.points}</strong></div></label><label><span>Feedback for student</span><textarea rows="8" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What was done well? What should improve?" /></label><button className="primary"><Check /> Save evaluation</button></aside>
    </form>
  </Modal>;
}

function SubmissionsPage({ state, onGrade, showToast, students, batches = [] }) {
  const [assessmentId, setAssessmentId] = useState(state.assessments.find((item) => item.status === "Published")?.id || "");
  const [batchId, setBatchId] = useState("all");
  const [tab, setTab] = useState("submitted");
  const [reviewing, setReviewing] = useState(null);
  const assessment = state.assessments.find((item) => item.id === assessmentId);
  
  const relevantStudentIds = new Set(assessment?.assignedStudentIds || []);
  if (batchId !== "all") {
    const selectedBatch = batches.find((b) => b.id === batchId);
    if (selectedBatch) {
      const batchStudentIds = new Set(selectedBatch.studentIds);
      for (let id of relevantStudentIds) {
        if (!batchStudentIds.has(id)) {
          relevantStudentIds.delete(id);
        }
      }
    }
  }

  const submissions = state.submissions.filter((item) => item.assessmentId === assessmentId && relevantStudentIds.has(item.studentId));
  const submittedIds = new Set(submissions.map((item) => item.studentId));
  const missing = students.filter((student) => relevantStudentIds.has(student.id) && !submittedIds.has(student.id));

  const exportToCSV = () => {
    if (!assessment) return;
    const rows = [
      ["Student Name", "Email ID", "Marks", "Submitted/Not Submitted"]
    ];

    const assessmentStudents = students.filter((s) => relevantStudentIds.has(s.id));
    
    assessmentStudents.forEach((student) => {
      const submission = submissions.find((s) => s.studentId === student.id);
      const isSubmitted = !!submission;
      const marks = isSubmitted ? (submission.score || 0) : 0;
      const status = isSubmitted ? "Submitted" : "Not submitted";
      
      const escape = (val) => {
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      };

      rows.push([escape(student.name), escape(student.email), marks, status]);
    });

    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${assessment.title}_submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = async () => {
    if (!assessment) return;
    try {
      const XLSX = await import('xlsx');
      const data = [
        ["Student Name", "Email ID", "Marks", "Submitted/Not Submitted"]
      ];
  
      const assessmentStudents = students.filter((s) => relevantStudentIds.has(s.id));
      
      assessmentStudents.forEach((student) => {
        const submission = submissions.find((s) => s.studentId === student.id);
        const isSubmitted = !!submission;
        const marks = isSubmitted ? (submission.score || 0) : 0;
        const status = isSubmitted ? "Submitted" : "Not submitted";
        
        data.push([student.name, student.email, marks, status]);
      });
  
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
      
      XLSX.writeFile(workbook, `${assessment.title}_submissions.xlsx`);
    } catch (err) {
      showToast?.("Failed to export to Excel. " + err.message);
    }
  };

  return <section className="teacher-page">
    <div className="teacher-page-heading"><div><span>Review centre</span><h1>Student submissions</h1><p>Track completion, evaluate work, and return feedback.</p></div></div>
    <div className="submission-assessment-picker">
      <div style={{ display: 'flex', gap: '20px', width: 'min(500px, 100%)' }}>
        <label style={{ display: 'grid', gap: '6px', flex: 1 }}>
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Assessment</span>
          <select value={assessmentId} onChange={(e) => setAssessmentId(e.target.value)} style={{ padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '7px', color: 'var(--ink)', background: 'var(--input-bg)', fontWeight: 700 }}>
            {state.assessments.filter((item) => item.status === "Published").map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}
          </select>
        </label>
        <label style={{ display: 'grid', gap: '6px', flex: 1 }}>
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Batch</span>
          <select value={batchId} onChange={(e) => setBatchId(e.target.value)} style={{ padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '7px', color: 'var(--ink)', background: 'var(--input-bg)', fontWeight: 700 }}>
            <option value="all">All batches</option>
            {batches?.filter((b) => b.status === "Active").map((batch) => <option value={batch.id} key={batch.id}>{batch.name}</option>)}
          </select>
        </label>
      </div>
      {assessment && <div><span><strong>{submissions.length}</strong> Submitted</span><span><strong>{missing.length}</strong> Not submitted</span><span><strong>{submissions.filter((item) => item.status === "Graded").length}</strong> Graded</span></div>}
    </div>
    <div className="submission-tabs" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '22px' }}>
        <button className={tab === "submitted" ? "active" : ""} onClick={() => setTab("submitted")}>Submitted <span>{submissions.length}</span></button>
        <button className={tab === "missing" ? "active" : ""} onClick={() => setTab("missing")}>Not submitted <span>{missing.length}</span></button>
      </div>
      {assessment && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
          <button type="button" onClick={exportToCSV} style={{ borderBottom: 'none', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--line)', color: 'var(--ink)' }}>
            <FileText size={16} /> Export to CSV
          </button>
          <button type="button" onClick={exportToExcel} style={{ borderBottom: 'none', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--line)', color: 'var(--ink)' }}>
            <FileSpreadsheet size={16} /> Export to Excel
          </button>
        </div>
      )}
    </div>
    <section className="submission-table">
      {tab === "submitted" ? <><header><span>Student</span><span>Submission</span><span>Submitted on</span><span>Status / marks</span><span /></header>{submissions.map((submission) => <article key={submission.id}><span className="submission-student"><b>{submission.studentName.split(" ").map((w) => w[0]).join("")}</b><span><strong>{submission.studentName}</strong><small>{students.find((s) => s.id === submission.studentId)?.email}</small></span></span><span><TypeBadge type={submission.type} /><small>{submission.fileName || submission.formReceipt || `${submission.testResults?.passed || 0}/${submission.testResults?.total || 0} tests`}</small></span><time>{formatDate(submission.submittedAt)}</time><span>{submission.status === "Graded" ? <><strong className="score-text">{submission.score}/{assessment?.points}</strong><StatusPill status="Graded" /></> : <StatusPill status="Submitted" />}</span><button className="review-button" onClick={() => setReviewing(submission)}>{submission.status === "Graded" ? "Edit grade" : "Review"}<ChevronRight /></button></article>)}</> : <><header className="missing"><span>Student</span><span>Email</span><span>Deadline</span><span>Action</span></header>{missing.map((student) => <article className="missing" key={student.id}><span className="submission-student"><b>{student.name.split(" ").map((w) => w[0]).join("")}</b><strong>{student.name}</strong></span><span>{student.email}</span><time>{formatDate(assessment?.dueAt)}</time><button className="remind-button" onClick={() => showToast?.(`Reminder queued for ${student.name}`)}><Bell /> Send reminder</button></article>)}</>}
      {((tab === "submitted" && !submissions.length) || (tab === "missing" && !missing.length)) && <div className="teacher-empty"><CheckCircle2 /><h2>{tab === "missing" ? "Everyone has submitted" : "No submissions yet"}</h2></div>}
    </section>
    {reviewing && <ReviewModal submission={reviewing} assessment={assessment} onClose={() => setReviewing(null)} onGrade={onGrade} showToast={showToast} />}
  </section>;
}

function QuestionsPage({ state, onAnswer, showToast }) {
  const [drafts, setDrafts] = useState({});
  const sorted = [...state.questions].sort((a, b) => Number(Boolean(a.answer)) - Number(Boolean(b.answer)) || new Date(b.askedAt) - new Date(a.askedAt));
  return <section className="teacher-page">
    <div className="teacher-page-heading"><div><span>Class conversations</span><h1>Student questions</h1><p>Answer assessment questions in one shared place.</p></div></div>
    <div className="question-list">{sorted.map((question) => {
      const assessment = state.assessments.find((item) => item.id === question.assessmentId);
      return <article key={question.id} className={question.answer ? "answered" : ""}><header><span className="student-avatar">{question.studentName.split(" ").map((w) => w[0]).join("")}</span><div><strong>{question.studentName}</strong><small>{assessment?.title} • {formatDate(question.askedAt)}</small></div>{question.answer ? <span className="answered-badge"><CheckCircle2 /> Answered</span> : <span className="new-badge">Needs reply</span>}</header><blockquote>{question.text}</blockquote>{question.answer ? <div className="teacher-answer"><strong>Your answer</strong><p>{question.answer}</p></div> : <div className="question-reply"><textarea rows="3" value={drafts[question.id] || ""} onChange={(e) => setDrafts({ ...drafts, [question.id]: e.target.value })} placeholder="Write a helpful answer..." /><button className="primary" disabled={!drafts[question.id]?.trim()} onClick={() => { onAnswer(question.id, drafts[question.id]); setDrafts({ ...drafts, [question.id]: "" }); showToast?.("Answer posted"); }}><Send /> Reply</button></div>}</article>;
    })}</div>
  </section>;
}

function TeacherEventsView({ store }) {
  const events = store?.events || [];
  const registrations = store?.registrations || [];
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    return events.filter(e => 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);

  function formatDateTime(str) {
    if (!str) return "";
    const date = new Date(str);
    if (isNaN(date.getTime())) return str;
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(date);
  }

  const isRegistrationClosed = (event) => {
    return new Date(event.deadline) < new Date();
  };

  return (
    <section className="teacher-page">
      <div className="teacher-page-heading">
        <div>
          <span>Campus programs & workshops</span>
          <h1>Events Directory</h1>
          <p>View upcoming summits, hackathons, and learning sessions scheduled for the academy.</p>
        </div>
      </div>

      <div className="events-toolbar-row" style={{ marginBottom: "20px" }}>
        <div className="search-bar-wrapper" style={{ flex: 1, maxWidth: "500px", position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          <input 
            type="text" 
            placeholder="Search events by title or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "10px 12px 10px 38px", border: "1px solid var(--line)", borderRadius: "7px", background: "var(--input-bg)", color: "var(--ink)" }}
          />
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="teacher-empty">
          <CalendarDays size={48} />
          <h2>No events scheduled</h2>
        </div>
      ) : (
        <div className="teacher-events-grid-layout" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {filteredEvents.map(event => {
            const regCount = registrations.filter(r => r.eventId === event.id).length;
            const closed = isRegistrationClosed(event);

            return (
              <article 
                key={event.id} 
                className="event-teacher-card"
                style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "10px", overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                <div className="event-card-img" style={{ position: "relative", height: "160px" }}>
                  <img src={event.image} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <span 
                    className={`event-status-badge ${closed ? "closed" : "active"}`}
                    style={{ position: "absolute", top: "12px", right: "12px", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", background: closed ? "rgba(0,0,0,0.6)" : "var(--color-success)", color: "#fff" }}
                  >
                    {closed ? "Registration Closed" : "Open for Students"}
                  </span>
                </div>
                <div className="event-card-content" style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1, gap: "12px" }}>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>{event.title}</h3>
                  <p style={{ margin: 0, fontSize: "14px", color: "var(--muted)", flex: 1 }}>{event.description}</p>
                  
                  <div className="event-meta-info" style={{ display: "grid", gap: "8px", fontSize: "13px" }}>
                    <div className="meta-item" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Clock size={14} style={{ color: "var(--color-primary)" }} />
                      <span><strong>Starts:</strong> {formatDateTime(event.timeline)}</span>
                    </div>
                    <div className="meta-item" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <CalendarDays size={14} style={{ color: "var(--color-primary)" }} />
                      <span><strong>Deadline:</strong> {formatDateTime(event.deadline)}</span>
                    </div>
                    <div className="meta-item" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <MapPin size={14} style={{ color: "var(--color-primary)" }} />
                      <span><strong>Location:</strong> {event.location}</span>
                    </div>
                  </div>

                  <div className="event-card-footer" style={{ borderTop: "1px solid var(--line)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="reg-pill" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--color-primary)", fontWeight: 600 }}>
                      <Users size={14} />
                      <span>{regCount} registered</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function TeacherPortal({ store, assessmentStore, batchStore, theme, onThemeToggle, user, onLogout, showToast }) {
  const { management: { students } } = useStudentManagement();
  const [view, setView] = useState(VIEWS.DASHBOARD);
  const [editor, setEditor] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const ThemeIcon = theme === "dark" ? Sun : Moon;
  const unanswered = assessmentStore.state.questions.filter((item) => !item.answer).length;
  const awaiting = assessmentStore.state.submissions.filter((item) => item.status === "Submitted").length;
  const nav = [
    [VIEWS.DASHBOARD, BarChart3, "Overview"],
    [VIEWS.BATCHES, Layers3, "Batches"],
    [VIEWS.SUBJECTS, BookOpen, "Subjects"],
    [VIEWS.ASSESSMENTS, ClipboardList, "Assessments"],
    [VIEWS.SUBMISSIONS, ClipboardCheck, "Submissions", awaiting],
    [VIEWS.QUESTIONS, MessageCircleQuestion, "Questions", unanswered],
    [VIEWS.CALENDAR, CalendarDays, "Calendar"],
    [VIEWS.ANALYTICS, BarChart3, "Analytics"],
    [VIEWS.EVENTS, CalendarDays, "Events"]
  ];
  function requestDelete(assessment) {
    if (window.confirm(`Delete “${assessment.title}” and all related submissions?`)) {
      assessmentStore.deleteAssessment(assessment.id);
      showToast?.("Assessment deleted");
    }
  }
  return <div className="teacher-shell">
    <aside className={mobileNav ? "open" : ""}><div className="teacher-brand"><img src="/brand/Logo-Purple.png" alt="Xebia" /><span><strong>Xebia LMS</strong><small>Teacher Portal</small></span><button onClick={() => setMobileNav(false)}><X /></button></div><nav><p>Workspace</p>{nav.map(([id, Icon, label, count]) => <button key={id} className={view === id ? "active" : ""} onClick={() => { setView(id); setMobileNav(false); }}><Icon /><span>{label}</span>{count > 0 && <b>{count}</b>}</button>)}</nav><div className="teacher-profile"><span>{user?.name?.split(" ").map((w) => w[0]).join("") || "MT"}</span><div><strong>{user?.name || "Meera Thomas"}</strong><small>Senior Instructor</small></div><button onClick={onLogout} title="Sign out"><LogOut /></button></div></aside>
    <div className="teacher-main"><header className="teacher-topbar"><button className="teacher-menu" onClick={() => setMobileNav(true)}><Menu /></button><div><strong>{nav.find((item) => item[0] === view)?.[2]}</strong><span>Teacher workspace</span></div><div><button onClick={onThemeToggle} title="Toggle theme"><ThemeIcon /></button><button className="notification-button" onClick={() => setView(VIEWS.QUESTIONS)}><Bell />{unanswered > 0 && <span>{unanswered}</span>}</button><div className="teacher-top-profile"><b>{user?.name?.charAt(0) || "M"}</b><span><strong>{user?.name || "Meera Thomas"}</strong><small>Teacher</small></span></div></div></header>
      <main>
        {view === VIEWS.DASHBOARD && <TeacherDashboard state={assessmentStore.state} onNavigate={setView} onCreate={() => setEditor(createBlankAssessment())} />}
        {view === VIEWS.ASSESSMENTS && <AssessmentsPage state={assessmentStore.state} onCreate={() => setEditor(createBlankAssessment())} onEdit={setEditor} onDelete={requestDelete} onStatus={(id, status) => { assessmentStore.setAssessmentStatus(id, status); showToast?.(status === "Published" ? "Assessment published" : "Moved to drafts"); }} />}
        {view === VIEWS.SUBMISSIONS && <SubmissionsPage state={assessmentStore.state} onGrade={assessmentStore.gradeSubmission} showToast={showToast} students={students} batches={batchStore.state.batches} />}
        {view === VIEWS.QUESTIONS && <QuestionsPage state={assessmentStore.state} onAnswer={assessmentStore.answerQuestion} showToast={showToast} />}
        {view === VIEWS.BATCHES && <TeacherBatchWorkspace mode="batches" batchStore={batchStore} assessmentStore={assessmentStore} user={user} showToast={showToast} />}
        {view === VIEWS.SUBJECTS && <TeacherBatchWorkspace mode="subjects" batchStore={batchStore} assessmentStore={assessmentStore} user={user} showToast={showToast} />}
        {view === VIEWS.CALENDAR && <TeacherBatchWorkspace mode="calendar" batchStore={batchStore} assessmentStore={assessmentStore} user={user} showToast={showToast} />}
        {view === VIEWS.ANALYTICS && <TeacherBatchWorkspace mode="analytics" batchStore={batchStore} assessmentStore={assessmentStore} user={user} showToast={showToast} />}
        {view === VIEWS.EVENTS && <TeacherEventsView store={store} />}
      </main>
    </div>
    {editor && <AssessmentEditor initial={editor} onClose={() => setEditor(null)} onSave={assessmentStore.saveAssessment} showToast={showToast} batchStore={batchStore} students={students} />}
  </div>;
}
