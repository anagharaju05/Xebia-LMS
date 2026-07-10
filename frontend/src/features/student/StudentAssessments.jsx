import { useMemo, useState } from "react";
import {
  ArrowLeft, CalendarClock, CheckCircle2, Clock3, Code2, Download, ExternalLink,
  FileSpreadsheet, FileText, HelpCircle, LoaderCircle, MessageCircleQuestion, Paperclip, Play,
  Search, Send, Trophy, Upload, XCircle
} from "lucide-react";
import CertificateGenerator from "./CertificateGenerator.jsx";

const TYPE_META = {
  file: { label: "File upload", icon: FileText, className: "purple" },
  quiz: { label: "Quiz", icon: FileSpreadsheet, className: "green" },
  coding: { label: "Coding", icon: Code2, className: "orange" }
};

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function TypeLabel({ type }) {
  const meta = TYPE_META[type];
  const Icon = meta.icon;
  return <span className={`student-assessment-type ${meta.className}`}><Icon />{meta.label}</span>;
}

function runJavascriptTests(code, tests) {
  return new Promise((resolve) => {
    const workerSource = `self.onmessage = (event) => {
      const { code, tests } = event.data;
      try {
        const solve = new Function(code + '; return typeof solve === "function" ? solve : null;')();
        if (!solve) throw new Error('Define a function named solve.');
        const results = tests.map(test => {
          try {
            const input = JSON.parse(test.input);
            const actual = solve(input);
            const normalized = typeof actual === 'string' ? actual : JSON.stringify(actual);
            return { id: test.id, passed: normalized === test.expected, actual: normalized };
          } catch (error) { return { id: test.id, passed: false, actual: error.message }; }
        });
        self.postMessage({ ok: true, results });
      } catch (error) { self.postMessage({ ok: false, error: error.message }); }
    };`;
    const worker = new Worker(URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" })));
    const timeout = setTimeout(() => { worker.terminate(); resolve({ ok: false, error: "Execution timed out after 2 seconds." }); }, 2000);
    worker.onmessage = (event) => { clearTimeout(timeout); worker.terminate(); resolve(event.data); };
    worker.onerror = () => { clearTimeout(timeout); worker.terminate(); resolve({ ok: false, error: "The browser runner could not execute this code." }); };
    worker.postMessage({ code, tests });
  });
}

function StudentQuestionBox({ assessment, questions, user, onAsk, showToast }) {
  const [text, setText] = useState("");
  return <section className="student-question-box"><header><MessageCircleQuestion /><div><h3>Ask your teacher</h3><p>Questions and answers are visible only in this assessment workspace.</p></div></header>
    <div className="student-question-compose"><textarea rows="3" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about instructions, scope, or submission requirements..." /><button className="primary" disabled={!text.trim()} onClick={() => { onAsk({ assessmentId: assessment.id, studentId: user.studentId || user.id, studentName: user.name, text }); setText(""); showToast?.("Question sent to your teacher"); }}><Send /> Ask question</button></div>
    {questions.map((question) => <article key={question.id}><div><strong>You asked</strong><time>{formatDate(question.askedAt)}</time></div><p>{question.text}</p>{question.answer ? <blockquote><strong>Teacher replied</strong><p>{question.answer}</p></blockquote> : <span><Clock3 /> Waiting for a reply</span>}</article>)}
  </section>;
}

function FileSubmission({ assessment, onSubmit, showToast }) {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  function choose(event) {
    const next = event.target.files?.[0];
    if (!next) return;
    const extension = next.name.split(".").pop().toLowerCase();
    const allowed = assessment.allowedFileTypes || ["pdf", "docx"];
    if (!allowed.includes(extension)) { setError(`Please select a ${allowed.join(" or ").toUpperCase()} file.`); return; }
    setFile(next); setError("");
  }
  function submit() {
    if (!file) return;
    onSubmit({ type: "file", file: file, fileName: file.name, fileSize: file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(file.size / 1024)} KB`, note });
    showToast?.("Assessment submitted successfully");
  }
  return <section className="student-submit-panel"><header><Upload /><div><h3>Upload your work</h3><p>One ${(assessment.allowedFileTypes || ["pdf", "docx"]).map((type) => type.toUpperCase()).join(" or ")} file, up to 25 MB.</p></div></header>
    <label className={`student-file-drop ${file ? "selected" : ""}`}><input type="file" accept={(assessment.allowedFileTypes || ["pdf", "docx"]).map((type) => `.${type}`).join(",")} onChange={choose} />{file ? <><CheckCircle2 /><strong>{file.name}</strong><span>{(file.size / 1024).toFixed(0)} KB • Click to replace</span></> : <><Upload /><strong>Choose a file</strong><span>or drag and drop it here</span></>}</label>
    {error && <p className="student-submit-error"><XCircle />{error}</p>}
    <label><span>Private note to teacher <small>(optional)</small></span><textarea rows="3" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add context about your submission..." /></label>
    <button className="primary student-submit-button" disabled={!file} onClick={submit}><Send /> Turn in assessment</button>
  </section>;
}

function QuizSubmission({ assessment, onSubmit, showToast }) {
  const [answers, setAnswers] = useState({});
  const questions = assessment.quizQuestions || [];
  const answered = questions.filter((question) => answers[question.id]).length;
  function submitQuiz() {
    const earned = questions.reduce((sum, question) => sum + (answers[question.id] === question.answer ? question.marks : 0), 0);
    const totalMarks = questions.reduce((sum, question) => sum + question.marks, 0) || assessment.points;
    const score = totalMarks === assessment.points ? earned : Math.round((earned / totalMarks) * assessment.points);
    const correct = questions.filter((question) => answers[question.id] === question.answer).length;
    onSubmit({ type: "quiz", quizAnswers: answers, quizResults: { correct, total: questions.length, earned, max: totalMarks }, score });
    showToast?.(`Quiz submitted: ${score}/${assessment.points}`);
  }
  return <section className="student-quiz-workspace"><header><FileSpreadsheet /><div><h3>Quiz questions</h3><p>Answer every question before submitting. {answered}/{questions.length} completed.</p></div><span>{assessment.quizFileName}</span></header><div className="student-quiz-progress"><i style={{ width: `${questions.length ? (answered / questions.length) * 100 : 0}%` }} /></div><div className="student-quiz-questions">{questions.map((question, index) => <fieldset key={question.id}><legend><span>{index + 1}</span><strong>{question.prompt}</strong><b>{question.marks} marks</b></legend><div>{question.options.map((option, optionIndex) => <label className={answers[question.id] === option ? "selected" : ""} key={option}><input type="radio" name={question.id} checked={answers[question.id] === option} onChange={() => setAnswers({ ...answers, [question.id]: option })} /><span>{String.fromCharCode(65 + optionIndex)}</span><strong>{option}</strong></label>)}</div></fieldset>)}</div><button className="primary student-submit-button" disabled={!questions.length || answered !== questions.length} onClick={submitQuiz}><Send /> Submit quiz</button></section>;
}

function CodingSubmission({ assessment, onSubmit, showToast }) {
  const [code, setCode] = useState(assessment.starterCode || "");
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const visibleTests = assessment.testCases.filter((test) => !test.hidden);
  async function run() {
    setRunning(true);
    if (assessment.language !== "javascript") {
      setResults({ ok: false, error: `${assessment.language} needs the secure runner API. JavaScript is available in this frontend demo.` });
    } else {
      setResults(await runJavascriptTests(code, visibleTests));
    }
    setRunning(false);
  }
  const passed = results?.results?.filter((item) => item.passed).length || 0;
  return <section className="student-code-workspace"><div className="code-workspace-header"><span><Code2 /><strong>{assessment.language}</strong></span><small>Browser preview runner • production grading requires a sandbox API</small><button onClick={run} disabled={running}>{running ? <LoaderCircle className="spin" /> : <Play />} Run tests</button></div><textarea className="student-code-editor" value={code} onChange={(e) => { setCode(e.target.value); setResults(null); }} spellCheck="false" />
    <section className="student-test-panel"><header><strong>Sample tests</strong>{results?.ok && <span>{passed}/{visibleTests.length} passed</span>}</header>{visibleTests.map((test, index) => { const result = results?.results?.find((item) => item.id === test.id); return <article key={test.id}><span>{result ? (result.passed ? <CheckCircle2 /> : <XCircle />) : <Code2 />}</span><div><strong>Test {index + 1}</strong><small>Input: {test.input} → Expected: {test.expected}</small>{result && !result.passed && <em>Received: {result.actual}</em>}</div></article>; })}{results && !results.ok && <p className="student-submit-error"><XCircle />{results.error}</p>}</section>
    <button className="primary student-submit-button" onClick={() => { onSubmit({ type: "coding", code, language: assessment.language, testResults: { passed, total: assessment.testCases.length } }); showToast?.("Code submitted for evaluation"); }} disabled={!code.trim()}><Send /> Submit code</button>
  </section>;
}

function SubmissionResult({ submission, assessment, user, onReattempt }) {
  const isPassed = submission.score >= (assessment.points * 0.75);
  const attemptCount = submission.attemptCount || 1;
  const canReattempt = (submission.type === "quiz" || (submission.type === "file" && submission.status === "Graded")) && attemptCount < 2;

  return <section className={`student-result-panel ${submission.status.toLowerCase()}`}><header>{submission.status === "Graded" ? <Trophy /> : <CheckCircle2 />}<div><span>{submission.status === "Graded" ? "Evaluation complete" : "Successfully submitted"}</span><h3>{submission.status === "Graded" ? `${submission.score} / ${assessment.points} marks` : "Waiting for teacher review"}</h3></div></header><div className="student-result-meta"><span>Submitted {formatDate(submission.submittedAt)}</span>{submission.fileName && <span><Paperclip />{submission.fileName}</span>}{submission.type === "coding" && <span><Code2 />{submission.testResults?.passed}/{submission.testResults?.total} tests passed</span>}{submission.type === "quiz" && <span><FileSpreadsheet />{submission.quizResults?.correct}/{submission.quizResults?.total} correct</span>}</div>{submission.type === "quiz" && <div className="student-quiz-review">{assessment.quizQuestions?.map((question, index) => { const selected = submission.quizAnswers?.[question.id]; const correct = selected === question.answer; return <article className={correct ? "correct" : "incorrect"} key={question.id}><span>{correct ? <CheckCircle2 /> : <XCircle />}</span><div><strong>{index + 1}. {question.prompt}</strong><small>Your answer: {selected || "No answer"} • Correct answer: {question.answer}</small>{question.explanation && <p>{question.explanation}</p>}</div></article>; })}</div>}{submission.feedback && <blockquote><strong>Teacher feedback</strong><p>{submission.feedback}</p></blockquote>}{submission.status === "Graded" && isPassed && <CertificateGenerator studentName={user?.name || "Student"} assessmentTitle={assessment.title} date={formatDate(submission.submittedAt)} score={submission.score} maxScore={assessment.points} />}{submission.status === "Graded" && !isPassed && !canReattempt && <div style={{marginTop: "20px", padding: "15px", background: "#fee2e2", color: "#991b1b", borderRadius: "8px"}}><strong>Keep learning!</strong> You scored below 75% and have used all your attempts. You did not qualify for a certificate this time.</div>}{canReattempt && <div style={{marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #eee"}}><button className="primary" onClick={onReattempt}><Play /> Reattempt {submission.type === "quiz" ? "Quiz" : "Assignment"} (1 attempt remaining)</button></div>}</section>;
}

function AssessmentDetail({ assessment, submission, questions, user, store, onBack, showToast }) {
  const [isReattempting, setIsReattempting] = useState(false);
  const isLate = new Date(assessment.dueAt) < new Date();
  function submit(payload) { store.submitWork({ ...payload, assessmentId: assessment.id, studentId: user.studentId || user.id, studentName: user.name }); setIsReattempting(false); }
  return <section className="student-assessment-detail"><button className="student-back" onClick={onBack}><ArrowLeft /> Back to assessments</button><header className="student-assessment-hero"><div><TypeLabel type={assessment.type} /><h1>{assessment.title}</h1><p>{assessment.subject} • {assessment.className}</p></div><div><span><CalendarClock />Due</span><strong>{formatDate(assessment.dueAt)}</strong><small>{isLate ? "Deadline passed" : "Submit before the deadline"}</small></div></header>
    <div className="student-assessment-layout"><main><section className="student-instructions"><header><BookOpenIcon /><div><span>Instructions</span><h2>What you need to do</h2></div></header><p>{assessment.instructions}</p>{assessment.attachmentName && <button><FileText /><span><strong>{assessment.attachmentName}</strong><small>Reference material</small></span><Download /></button>}</section>
      {submission && !isReattempting ? <SubmissionResult submission={submission} assessment={assessment} user={user} onReattempt={() => setIsReattempting(true)} /> : <>{assessment.type === "file" && <FileSubmission assessment={assessment} onSubmit={submit} showToast={showToast} />}{assessment.type === "quiz" && <QuizSubmission assessment={assessment} onSubmit={submit} showToast={showToast} />}{assessment.type === "coding" && <CodingSubmission assessment={assessment} onSubmit={submit} showToast={showToast} />}</>}
    </main><aside><section className="student-score-card"><span>Maximum marks</span><strong>{assessment.points}</strong><small>points</small></section><StudentQuestionBox assessment={assessment} questions={questions} user={user} onAsk={store.askQuestion} showToast={showToast} /></aside></div>
  </section>;
}

function BookOpenIcon() { return <FileText />; }

export default function StudentAssessments({ assessmentStore, batchStore, user, showToast }) {
  const [selectedId, setSelectedId] = useState("");
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("deadline");
  const studentId = user.studentId || user.id;
  const studentBatchIds = batchStore.state.batches.filter((batch) => batch.studentIds.includes(studentId)).map((batch) => batch.id);
  const assessments = useMemo(() => assessmentStore.state.assessments.filter((item) => {
    if (item.status !== "Published") return false;
    const scope = item.assignmentScope || "selected_students";
    if (scope === "entire_course") return true;
    return (item.assignedStudentIds || []).includes(studentId) || (item.assignedBatchIds || []).some((id) => studentBatchIds.includes(id));
  }), [assessmentStore.state.assessments, studentId, studentBatchIds.join("|")]);
  const selected = assessments.find((item) => item.id === selectedId);
  const mySubmissions = assessmentStore.state.submissions.filter((item) => item.studentId === studentId);
  const visible = assessments.filter((assessment) => { const submission = mySubmissions.find((item) => item.assessmentId === assessment.id); const due = new Date(assessment.dueAt); const now = new Date(); if (!`${assessment.title} ${assessment.subject}`.toLowerCase().includes(query.toLowerCase())) return false; if (filter === "To do") return !submission && due >= now; if (filter === "Submitted") return submission?.status === "Submitted"; if (filter === "Graded") return submission?.status === "Graded"; if (filter === "Upcoming") return !submission && due >= now && due.getTime() - now.getTime() <= 7 * 86400000; if (filter === "Overdue") return !submission && due < now; return true; }).sort((a, b) => sort === "title" ? a.title.localeCompare(b.title) : sort === "marks" ? b.points - a.points : new Date(a.dueAt) - new Date(b.dueAt));
  if (selected) return <AssessmentDetail assessment={selected} submission={mySubmissions.find((item) => item.assessmentId === selected.id)} questions={assessmentStore.state.questions.filter((item) => item.assessmentId === selected.id && item.studentId === studentId)} user={user} store={assessmentStore} onBack={() => setSelectedId("")} showToast={showToast} />;
  return <section className="student-assessments-page"><div className="student-page-title"><div><span>Assigned coursework</span><h1>My Assessments</h1><p>View deadlines, submit your work, and check teacher feedback.</p></div></div><div className="student-assessment-summary"><div><span className="purple"><FileText /></span><strong>{assessments.length}</strong><small>Assigned</small></div><div><span className="orange"><Clock3 /></span><strong>{assessments.filter((item) => !mySubmissions.some((sub) => sub.assessmentId === item.id)).length}</strong><small>To do</small></div><div><span className="green"><CheckCircle2 /></span><strong>{mySubmissions.filter((item) => item.status === "Graded").length}</strong><small>Graded</small></div></div><div className="student-assessment-toolbar"><label><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search assessments" /></label><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="deadline">Sort: Deadline</option><option value="title">Sort: Title</option><option value="marks">Sort: Marks</option></select></div><div className="student-assessment-filters">{["All", "To do", "Submitted", "Graded", "Upcoming", "Overdue"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="student-modern-assessment-grid">{visible.map((assessment) => { const meta = TYPE_META[assessment.type]; const Icon = meta.icon; const submission = mySubmissions.find((item) => item.assessmentId === assessment.id); const late = !submission && new Date(assessment.dueAt) < new Date(); return <article key={assessment.id}><header><span className={meta.className}><Icon /></span><TypeLabel type={assessment.type} />{submission ? <span className={`student-card-status ${submission.status.toLowerCase()}`}>{submission.status === "Graded" ? `${submission.score}/${assessment.points}` : submission.status}</span> : late ? <span className="student-card-status late">Overdue</span> : <span className="student-card-status todo">To do</span>}</header><div><span>{assessment.subject}</span><h2>{assessment.title}</h2><p>{assessment.instructions}</p></div><footer><span><CalendarClock />Due {formatDate(assessment.dueAt)}</span><span>{assessment.points} marks</span></footer><button onClick={() => setSelectedId(assessment.id)}>{submission ? submission.status === "Graded" ? "View marks & feedback" : "View submission" : "Open assessment"}<ExternalLink /></button></article>; })}{!visible.length && <div className="student-empty"><CheckCircle2 /><h2>Nothing here right now</h2><p>There are no assessments in this filter.</p></div>}</div></section>;
}
