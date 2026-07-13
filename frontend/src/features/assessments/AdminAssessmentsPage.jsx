import { useState, useMemo } from "react";
import { FileText, FileSpreadsheet, CheckCircle2, ChevronRight, Download } from "lucide-react";
import { useAssessmentStore } from "./useAssessmentStore.js";
import { useBatchStore } from "../batches/useBatchStore.js";
import { useStudentManagement } from "../students/useStudentManagement.js";
import { AUTH_USERS } from "../auth/auth.data.js";

// Reusable UI components for AdminAssessmentsPage
const TYPE_META = {
  file: { label: "File upload", tone: "purple" },
  quiz: { label: "Excel quiz", tone: "green" },
  coding: { label: "Coding", tone: "orange" }
};

function TypeBadge({ type }) {
  const meta = TYPE_META[type] || TYPE_META.file;
  return <span className={`assessment-type ${meta.tone}`}>{meta.label}</span>;
}

function StatusPill({ status }) {
  return <span className={`assessment-status ${status.toLowerCase()}`}>{status}</span>;
}

function formatDate(value) {
  if (!value) return "No deadline";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit"
  }).format(date);
}

export default function AdminAssessmentsPage({ showToast }) {
  const { state: assessmentState } = useAssessmentStore();
  const { state: batchState } = useBatchStore();
  const { management: { students } } = useStudentManagement();

  const teachers = AUTH_USERS.filter((u) => u.role === "teacher");

  const [teacherId, setTeacherId] = useState("all");
  const [batchId, setBatchId] = useState("all");
  const [assessmentId, setAssessmentId] = useState("");

  // Filter available assessments based on selected teacher and batch
  const filteredAssessments = useMemo(() => {
    return assessmentState.assessments.filter((a) => {
      const matchTeacher = teacherId === "all" || a.teacherId === teacherId;
      const matchBatch = batchId === "all" || (a.assignmentScope === "entire_course" || (a.assignedBatchIds || []).includes(batchId));
      return matchTeacher && matchBatch && a.status === "Published";
    });
  }, [assessmentState.assessments, teacherId, batchId]);

  // If the currently selected assessment is no longer in the filtered list, reset it.
  const activeAssessment = filteredAssessments.find(a => a.id === assessmentId) || filteredAssessments[0];
  const activeAssessmentId = activeAssessment?.id || "";

  // Calculate relevant students using AND logic
  const relevantStudentIds = useMemo(() => {
    const ids = new Set(activeAssessment?.assignedStudentIds || []);
    if (batchId !== "all") {
      const selectedBatch = batchState.batches.find((b) => b.id === batchId);
      if (selectedBatch) {
        const batchStudentIds = new Set(selectedBatch.studentIds);
        for (let id of ids) {
          if (!batchStudentIds.has(id)) {
            ids.delete(id);
          }
        }
      }
    }
    return ids;
  }, [activeAssessment, batchId, batchState.batches]);

  const submissions = assessmentState.submissions.filter((item) => item.assessmentId === activeAssessmentId && relevantStudentIds.has(item.studentId));
  const submittedIds = new Set(submissions.map((item) => item.studentId));
  const missing = students.filter((student) => relevantStudentIds.has(student.id) && !submittedIds.has(student.id));

  const [tab, setTab] = useState("submitted");

  const exportToCSV = () => {
    if (!activeAssessment) return;
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
    link.setAttribute("download", `Admin_${activeAssessment.title}_submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = async () => {
    if (!activeAssessment) return;
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
      
      XLSX.writeFile(workbook, `Admin_${activeAssessment.title}_submissions.xlsx`);
    } catch (err) {
      showToast?.("Failed to export to Excel. " + err.message);
    }
  };

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px' }}>Assessments Overview</h1>
        <p style={{ color: 'var(--muted)', margin: 0 }}>View and manage student submissions across all teachers and batches.</p>
      </header>

      <div className="submission-assessment-picker" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', border: '1px solid var(--line)', borderRadius: '10px', background: 'var(--panel)', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '20px' }}>
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Teacher</span>
            <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} style={{ padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '7px', color: 'var(--ink)', background: 'var(--input-bg)', fontWeight: 700, textOverflow: 'ellipsis' }}>
              <option value="all">All Teachers</option>
              {teachers.map((t) => <option value={t.id} key={t.id}>{t.name}</option>)}
            </select>
          </label>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Batch</span>
            <select value={batchId} onChange={(e) => setBatchId(e.target.value)} style={{ padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '7px', color: 'var(--ink)', background: 'var(--input-bg)', fontWeight: 700, textOverflow: 'ellipsis' }}>
              <option value="all">All Batches</option>
              {batchState.batches.map((b) => <option value={b.id} key={b.id}>{b.name}</option>)}
            </select>
          </label>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Assessment</span>
            <select value={activeAssessmentId} onChange={(e) => setAssessmentId(e.target.value)} disabled={!filteredAssessments.length} style={{ padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '7px', color: 'var(--ink)', background: 'var(--input-bg)', fontWeight: 700, textOverflow: 'ellipsis' }}>
              {filteredAssessments.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}
              {!filteredAssessments.length && <option value="">No assessments match criteria</option>}
            </select>
          </label>
        </div>

        {activeAssessment && (
          <div style={{ display: 'flex', gap: '16px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
            <div style={{ flex: 1, padding: '16px', background: 'var(--panel-soft)', borderRadius: '8px', textAlign: 'center' }}>
              <strong style={{ display: 'block', fontSize: '24px', color: 'var(--ink)' }}>{submissions.length}</strong>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Submitted</span>
            </div>
            <div style={{ flex: 1, padding: '16px', background: 'var(--panel-soft)', borderRadius: '8px', textAlign: 'center' }}>
              <strong style={{ display: 'block', fontSize: '24px', color: 'var(--ink)' }}>{missing.length}</strong>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Not submitted</span>
            </div>
            <div style={{ flex: 1, padding: '16px', background: 'var(--panel-soft)', borderRadius: '8px', textAlign: 'center' }}>
              <strong style={{ display: 'block', fontSize: '24px', color: 'var(--ink)' }}>{submissions.filter((item) => item.status === "Graded").length}</strong>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Graded</span>
            </div>
          </div>
        )}
      </div>

      <div className="submission-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '22px' }}>
          <button style={{ display: 'flex', gap: '7px', padding: '11px 3px', borderBottom: '2px solid transparent', color: tab === 'submitted' ? 'var(--bright-velvet)' : 'var(--muted)', fontWeight: 800, background: 'transparent', borderColor: tab === 'submitted' ? 'var(--bright-velvet)' : 'transparent' }} onClick={() => setTab("submitted")}>
            Submitted <span style={{ padding: '1px 6px', borderRadius: '999px', background: 'var(--panel-soft)', fontSize: '10px', color: tab === 'submitted' ? 'var(--bright-velvet)' : 'inherit' }}>{submissions.length}</span>
          </button>
          <button style={{ display: 'flex', gap: '7px', padding: '11px 3px', borderBottom: '2px solid transparent', color: tab === 'missing' ? 'var(--bright-velvet)' : 'var(--muted)', fontWeight: 800, background: 'transparent', borderColor: tab === 'missing' ? 'var(--bright-velvet)' : 'transparent' }} onClick={() => setTab("missing")}>
            Not submitted <span style={{ padding: '1px 6px', borderRadius: '999px', background: 'var(--panel-soft)', fontSize: '10px', color: tab === 'missing' ? 'var(--bright-velvet)' : 'inherit' }}>{missing.length}</span>
          </button>
        </div>
        
        {activeAssessment && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingBottom: '8px' }}>
            <button type="button" onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--line)', color: 'var(--ink)', background: 'var(--panel)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s' }}>
              <FileText size={16} /> CSV
            </button>
            <button type="button" onClick={exportToExcel} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--line)', color: 'var(--ink)', background: 'var(--panel)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s' }}>
              <FileSpreadsheet size={16} /> Excel
            </button>
          </div>
        )}
      </div>

      <section className="submission-table">
        {tab === "submitted" ? (
          <>
            <header style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 2fr) minmax(150px, 1.5fr) 150px 180px', gap: '20px', padding: '12px 20px', borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', background: 'var(--panel-soft)', borderRadius: '8px 8px 0 0' }}>
              <span>Student</span>
              <span>Submission</span>
              <span>Submitted on</span>
              <span style={{ textAlign: 'right' }}>Status / marks</span>
            </header>
            {submissions.map((submission) => (
              <article key={submission.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 2fr) minmax(150px, 1.5fr) 150px 180px', gap: '20px', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
                <span className="submission-student" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <b style={{ display: 'grid', placeItems: 'center', width: '36px', height: '36px', borderRadius: '50%', background: '#84117c', color: '#fff', fontSize: '12px' }}>
                    {submission.studentName.split(" ").map((w) => w[0]).join("")}
                  </b>
                  <span style={{ display: 'grid' }}>
                    <strong style={{ color: 'var(--ink)', fontSize: '14px' }}>{submission.studentName}</strong>
                    <small style={{ color: 'var(--muted)', fontSize: '12px' }}>{students.find((s) => s.id === submission.studentId)?.email}</small>
                  </span>
                </span>
                <span style={{ display: 'grid', gap: '4px' }}>
                  <TypeBadge type={submission.type} />
                  <small style={{ color: 'var(--muted)' }}>{submission.fileName || submission.formReceipt || `${submission.testResults?.passed || 0}/${submission.testResults?.total || 0} tests`}</small>
                </span>
                <time style={{ fontSize: '13px', color: 'var(--muted)' }}>{formatDate(submission.submittedAt)}</time>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                  {submission.status === "Graded" ? (
                    <>
                      <strong className="score-text" style={{ fontSize: '18px', color: 'var(--ink)' }}>{submission.score}/{activeAssessment?.points}</strong>
                      <StatusPill status="Graded" />
                    </>
                  ) : (
                    <StatusPill status="Submitted" />
                  )}
                </span>
              </article>
            ))}
          </>
        ) : (
          <>
            <header className="missing" style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 2fr) minmax(150px, 1.5fr) 150px', gap: '20px', padding: '12px 20px', borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', background: 'var(--panel-soft)', borderRadius: '8px 8px 0 0' }}>
              <span>Student</span>
              <span>Email</span>
              <span>Deadline</span>
            </header>
            {missing.map((student) => (
              <article className="missing" key={student.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 2fr) minmax(150px, 1.5fr) 150px', gap: '20px', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
                <span className="submission-student" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <b style={{ display: 'grid', placeItems: 'center', width: '36px', height: '36px', borderRadius: '50%', background: '#84117c', color: '#fff', fontSize: '12px' }}>
                    {student.name.split(" ").map((w) => w[0]).join("")}
                  </b>
                  <strong style={{ color: 'var(--ink)', fontSize: '14px' }}>{student.name}</strong>
                </span>
                <span style={{ color: 'var(--muted)' }}>{student.email}</span>
                <time style={{ color: 'var(--muted)' }}>{formatDate(activeAssessment?.dueAt)}</time>
              </article>
            ))}
          </>
        )}
        
        {((tab === "submitted" && !submissions.length) || (tab === "missing" && !missing.length)) && (
          <div className="teacher-empty" style={{ display: 'grid', placeItems: 'center', minHeight: '200px', textAlign: 'center', color: 'var(--muted)' }}>
            <CheckCircle2 size={42} style={{ color: 'var(--bright-velvet)', marginBottom: '10px' }} />
            <h2 style={{ margin: '0 0 4px', color: 'var(--ink)' }}>{tab === "missing" ? "Everyone has submitted" : "No submissions found"}</h2>
          </div>
        )}
      </section>
    </div>
  );
}
