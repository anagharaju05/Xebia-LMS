import { useState, useMemo } from "react";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  UserCheck, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Users,
  Search,
  Sparkles,
  CalendarDays,
  ExternalLink,
  Link,
  Download,
  FileSpreadsheet
} from "lucide-react";
import PageTitle from "../../components/common/PageTitle.jsx";
import Metric from "../../components/common/Metric.jsx";
import Field from "../../components/common/Field.jsx";
import TextArea from "../../components/common/TextArea.jsx";
import { api } from "../../services/api.js";

const PRESET_IMAGES = [
  { name: "Tech Summit", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80" },
  { name: "Workshop", url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80" },
  { name: "AI & Data Science", url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80" },
  { name: "UI/UX & Design", url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80" }
];

const EMPTY_EVENT = {
  title: "",
  description: "",
  image: PRESET_IMAGES[0].url,
  timeline: "",
  deadline: "",
  location: "Xebia Gurgaon HQ (Sector 45)",
  meetingUrl: "",
  status: "Published",
  maxCapacity: 0
};

export default function EventsPage({ store, upsertEvent, deleteEvent, showToast }) {
  const events = store.events || [];
  const registrations = store.registrations || [];

  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formState, setFormState] = useState(EMPTY_EVENT);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [locationType, setLocationType] = useState("Xebia Gurgaon HQ (Sector 45)");
  const [customLocation, setCustomLocation] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredEvents = useMemo(() => {
    let result = events;
    if (statusFilter !== "All") {
      result = result.filter(e => (e.status || "Published") === statusFilter);
    }
    if (!searchQuery.trim()) return result;
    return result.filter(e => 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = events.length;
    const now = new Date();
    const active = events.filter(e => new Date(e.deadline) > now).length;
    
    const validEventIds = new Set(events.map(e => e.id));
    const totalReg = registrations.filter(r => validEventIds.has(r.eventId)).length;
    
    return { total, active, totalReg };
  }, [events, registrations]);

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const selectedRegistrations = registrations.filter(r => r.eventId === selectedEventId);

  function openCreate() {
    setFormState(EMPTY_EVENT);
    setLocationType("Xebia Gurgaon HQ (Sector 45)");
    setCustomLocation("");
    setEditingEvent(null);
    setShowForm(true);
  }

  function openEdit(event) {
    setFormState(event);
    const standardOptions = [
      "Xebia Gurgaon HQ (Sector 45)",
      "Xebia Noida Office (Sector 62)",
      "Virtual (Microsoft Teams)",
      "Virtual (Zoom)"
    ];
    if (standardOptions.includes(event.location)) {
      setLocationType(event.location);
      setCustomLocation("");
    } else {
      setLocationType("Other");
      setCustomLocation(event.location);
    }
    setEditingEvent(event);
    setShowForm(true);
  }

  const exportToExcelForEvent = async (event) => {
    if (!event) return;
    try {
      const XLSX = await import('xlsx');
      const data = [
        ["Student Name", "Email ID", "Enrolled Event"]
      ];
      const eventRegs = registrations.filter(r => r.eventId === event.id);
      eventRegs.forEach((reg) => {
        data.push([reg.studentName, reg.studentEmail, event.title]);
      });
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendees");
      XLSX.writeFile(workbook, `${event.title.replace(/\s+/g, "_")}_attendees.xlsx`);
      showToast("Excel exported successfully", "success");
    } catch (err) {
      showToast("Failed to export to Excel: " + err.message, "danger");
    }
  };

  const exportToCSVForEvent = (event) => {
    if (!event) return;
    const rows = [
      ["Student Name", "Email ID", "Enrolled Event"]
    ];
    const escape = (val) => {
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };
    const eventRegs = registrations.filter(r => r.eventId === event.id);
    eventRegs.forEach((reg) => {
      rows.push([escape(reg.studentName), escape(reg.studentEmail), escape(event.title)]);
    });
    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${event.title.replace(/\s+/g, "_")}_attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV exported successfully", "success");
  };

  const exportToExcel = () => exportToExcelForEvent(selectedEvent);
  const exportToCSV = () => exportToCSVForEvent(selectedEvent);

  function handleSave(e, customStatus = null) {
    if (e) e.preventDefault();
    if (!formState.title.trim() || !formState.timeline || !formState.deadline) {
      showToast("Please fill in all required fields", "warning");
      return;
    }

    if (formState.meetingUrl && formState.meetingUrl.trim()) {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formState.meetingUrl.trim())) {
        showToast("Please enter a valid Meeting Link URL", "danger");
        return;
      }
    }

    const nextStatus = customStatus || formState.status || "Published";

    const payload = {
      ...formState,
      status: nextStatus,
      id: editingEvent ? editingEvent.id : undefined
    };

    upsertEvent("events", payload, editingEvent ? "Event updated" : `Event created as ${nextStatus}`);
    setShowForm(false);
    setFormState(EMPTY_EVENT);
    setEditingEvent(null);
  }

  function handleDelete(id) {
    deleteEvent(id);
    if (selectedEventId === id) {
      setSelectedEventId(null);
    }
  }

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
    <div className="events-admin-page" style={{ zoom: 0.9 }}>
      <header className="events-admin-header">
        <PageTitle 
          icon={CalendarDays}
          title="Events Manager" 
          subtitle="Publish training workshops, hackathons, and tech sessions for students and instructors."
        />
        <button className="primary" onClick={openCreate}>
          <Plus size={18} />
          <span>Create Event</span>
        </button>
      </header>

      <section className="events-stats-row">
        <Metric icon={Calendar} label="Total Events" value={stats.total} />
        <Metric icon={Sparkles} label="Open for Registration" value={stats.active} tone="success" />
        <Metric icon={Users} label="Total Registrations" value={stats.totalReg} tone="purple" />
      </section>

      <section className="events-toolbar-row">
        <div className="search-bar-wrapper">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search events by title or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="status-filter-group" style={{ display: "flex", gap: "6px" }}>
          {["All", "Published", "Draft"].map((item) => (
            <button 
              key={item}
              className={`filter-btn ${statusFilter === item ? "active" : ""}`}
              onClick={() => setStatusFilter(item)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                border: "1px solid var(--color-border)",
                background: statusFilter === item ? "var(--color-primary)" : "var(--color-surface)",
                color: statusFilter === item ? "#fff" : "var(--color-text-secondary)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <div className="events-admin-grid-layout">
        <div className="events-list-section">
          
          {/* Registration Analytics */}
          {events.length > 0 && (
            <div style={{ marginBottom: "24px", background: "var(--color-surface)", padding: "16px", borderRadius: "12px", border: "1px solid var(--color-border)" }}>
              <h3 style={{ fontSize: "14px", margin: "0 0 16px 0", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={16} /> Registration Analytics
              </h3>
              <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
                {events.map(event => {
                  const regCount = registrations.filter(r => r.eventId === event.id).length;
                  const capacity = event.maxCapacity || 50;
                  const percent = Math.min(100, Math.round((regCount / capacity) * 100));
                  return (
                    <div key={event.id} style={{ minWidth: "120px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <span style={{ fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={event.title}>
                        {event.title}
                      </span>
                      <div style={{ width: "100%", height: "8px", background: "var(--color-background)", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${percent}%`, background: percent >= 100 ? "#f43f5e" : "var(--color-primary)", borderRadius: "4px" }} />
                      </div>
                      <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                        {regCount} / {capacity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredEvents.length === 0 ? (
            <div className="events-empty-state">
              <CalendarDays size={48} />
              <h3>No events found</h3>
              <p>Get started by creating your first program event.</p>
              <button className="primary outline" onClick={openCreate}>Create Event</button>
            </div>
          ) : (
            <div className="events-cards-grid">
              {filteredEvents.map(event => {
                const regCount = registrations.filter(r => r.eventId === event.id).length;
                const closed = isRegistrationClosed(event);
                const isSelected = selectedEventId === event.id;

                return (
                  <article 
                    key={event.id} 
                    className={`event-admin-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    <div className="event-card-img">
                      <img src={event.image || PRESET_IMAGES[0].url} alt={event.title} />
                      <span className={`event-status-badge ${closed ? "closed" : "active"}`}>
                        {closed ? "Registration Closed" : "Open to Register"}
                      </span>
                    </div>
                    <div className="event-card-content">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span 
                          className={`${event.status?.toLowerCase() === "draft" ? "draft" : "published"}`}
                          style={{
                            position: "static",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            background: event.status?.toLowerCase() === "draft" ? "var(--color-surface-secondary)" : "rgba(1, 172, 159, 0.12)",
                            color: event.status?.toLowerCase() === "draft" ? "var(--color-text-secondary)" : "var(--color-success)"
                          }}
                        >
                          {event.status || "Published"}
                        </span>
                      </div>
                      <h3>{event.title}</h3>
                      <p className="event-desc">{event.description}</p>
                      
                      <div className="event-meta-info">
                        <div className="meta-item">
                          <Clock size={15} />
                          <span><strong>Starts:</strong> {formatDateTime(event.timeline)}</span>
                        </div>
                        <div className="meta-item">
                          <UserCheck size={15} />
                          <span><strong>Deadline:</strong> {formatDateTime(event.deadline)}</span>
                        </div>
                        <div className="meta-item">
                          <MapPin size={15} />
                          <span><strong>Location:</strong> {event.location}</span>
                        </div>
                        {event.meetingUrl && (
                          <div className="meta-item">
                            <Link size={14} />
                            <span>
                              <strong>Link: </strong>
                              <a 
                                href={event.meetingUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="event-meeting-url-link"
                                style={{ color: "var(--color-primary)", textDecoration: "underline", fontWeight: 600 }}
                              >
                                Join Meeting <ExternalLink size={11} style={{ display: "inline", verticalAlign: "middle", marginLeft: "2px" }} />
                              </a>
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="event-card-footer" onClick={(e) => e.stopPropagation()}>
                        <div className="reg-pill">
                          <Users size={14} />
                          <span>{regCount} registered</span>
                        </div>
                        <div className="action-btns">
                          {regCount > 0 && (
                            <>
                              <button 
                                className="icon-action-btn edit" 
                                title="Export registrations to Excel"
                                onClick={() => exportToExcelForEvent(event)}
                              >
                                <FileSpreadsheet size={15} style={{ color: "var(--color-success)" }} />
                              </button>
                              <button 
                                className="icon-action-btn delete" 
                                title="Export registrations to CSV"
                                onClick={() => exportToCSVForEvent(event)}
                              >
                                <Download size={15} style={{ color: "var(--color-primary)" }} />
                              </button>
                            </>
                          )}
                          <button 
                            className="icon-action-btn edit" 
                            title="Edit Event"
                            onClick={() => openEdit(event)}
                          >
                            <Pencil size={15} />
                          </button>
                          <button 
                            className="icon-action-btn delete" 
                            title="Delete Event"
                            onClick={() => handleDelete(event.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Event Registrations Drawer/Panel */}
        {selectedEventId && (
          <aside className="event-registrations-panel">
            <header className="panel-header">
              <div>
                <span>Student Submissions</span>
                <h3>Registrations ({selectedRegistrations.length})</h3>
                <small className="event-panel-title">{selectedEvent?.title}</small>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {selectedRegistrations.length > 0 && (
                  <>
                    <button 
                      onClick={exportToExcel} 
                      title="Export to Excel" 
                      style={{ 
                        padding: "6px 10px", 
                        fontSize: "12px", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "4px",
                        border: "1px solid var(--color-border)",
                        borderRadius: "6px",
                        background: "var(--color-surface)",
                        color: "var(--color-text-primary)",
                        cursor: "pointer",
                        fontWeight: 600
                      }}
                    >
                      <FileSpreadsheet size={14} style={{ color: "var(--color-success)" }} />
                      <span>Excel</span>
                    </button>
                    <button 
                      onClick={exportToCSV} 
                      title="Export to CSV" 
                      style={{ 
                        padding: "6px 10px", 
                        fontSize: "12px", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "4px",
                        border: "1px solid var(--color-border)",
                        borderRadius: "6px",
                        background: "var(--color-surface)",
                        color: "var(--color-text-primary)",
                        cursor: "pointer",
                        fontWeight: 600
                      }}
                    >
                      <Download size={14} style={{ color: "var(--color-primary)" }} />
                      <span>CSV</span>
                    </button>
                  </>
                )}
                <button className="close-btn" onClick={() => setSelectedEventId(null)}>
                  <X size={18} />
                </button>
              </div>
            </header>

            <div className="panel-body">
              {selectedRegistrations.length === 0 ? (
                <div className="panel-empty-state">
                  <Users size={36} />
                  <p>No students have registered for this event yet.</p>
                </div>
              ) : (
                <div className="registrations-table-wrapper">
                  <table className="registrations-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Status</th>
                        <th>Registered On</th>
                        <th>Check-In</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRegistrations.map(reg => (
                        <tr key={reg.id}>
                          <td>
                            <div className="reg-student-info">
                              <span className="student-badge">
                                {reg.studentName.split(" ").map(w => w[0]).join("")}
                              </span>
                              <div>
                                <strong>{reg.studentName}</strong>
                                <small>{reg.studentEmail}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="cohort-tag" style={{ background: reg.status === "WAITLISTED" ? "#fef08a" : "var(--color-surface)", color: reg.status === "WAITLISTED" ? "#a16207" : "var(--color-text-primary)" }}>
                              {reg.status || "REGISTERED"}
                            </span>
                          </td>
                          <td>
                            <time>{formatDateTime(reg.registeredAt)}</time>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", cursor: "pointer" }}>
                                <input type="checkbox" checked={reg.attendanceStatus === "ATTENDED"} onChange={(e) => {
                                  // Optimsitic UI update (in real app, call API)
                                  reg.attendanceStatus = e.target.checked ? "ATTENDED" : "PENDING";
                                  showToast(`Marked ${reg.studentName} as ${e.target.checked ? "Attended" : "Pending"}`, "success");
                                }} /> Present
                              </label>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Create / Edit Modal Form */}
      {showForm && (
        <div className="events-modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="events-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>{editingEvent ? "Edit Event" : "Create New Event"}</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </header>
            
            <form onSubmit={handleSave} className="events-form">
              <Field 
                label="Event Title" 
                required 
                value={formState.title}
                onChange={(val) => setFormState({ ...formState, title: val })}
                placeholder="e.g. Hackathon 2026, React 19 Session"
              />

              <TextArea 
                label="Description" 
                id="event-desc"
                value={formState.description}
                onChange={(val) => setFormState({ ...formState, description: val })}
                placeholder="Details about the event, objectives, prerequisites..."
              />

              <div className="form-row-2">
                <Field 
                  label="Timeline (Start Date & Time)" 
                  required 
                  type="datetime-local"
                  value={formState.timeline}
                  onChange={(val) => setFormState({ ...formState, timeline: val })}
                />
                <Field 
                  label="Registration Deadline" 
                  required 
                  type="datetime-local"
                  value={formState.deadline}
                  onChange={(val) => setFormState({ ...formState, deadline: val })}
                />
              </div>

              <div className="image-preset-picker" style={{ marginTop: "16px" }}>
                <span className="preset-label">Choose Event Image Banner:</span>
                <div className="preset-grid">
                  {PRESET_IMAGES.map((img) => (
                    <button 
                      key={img.name} 
                      type="button"
                      className={`preset-btn ${formState.image?.split('?')[0] === img.url.split('?')[0] ? "selected" : ""}`}
                      onClick={() => setFormState({ ...formState, image: img.url })}
                    >
                      <img src={img.url} alt={img.name} />
                      <span>{img.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: "8px", display: "block" }}>
                  Or Upload Custom Image from Desktop
                </span>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    try {
                      showToast("Uploading image...", "info");
                      const formData = new FormData();
                      formData.append("file", file);
                      const res = await api.upload("/api/portal/files/upload", formData);
                      if (res && res.fileUrl) {
                        setFormState({ ...formState, image: res.fileUrl });
                        showToast("Image uploaded successfully!", "success");
                      }
                    } catch (err) {
                      console.error(err);
                      showToast("Failed to upload image", "danger");
                    }
                  }}
                  style={{
                    width: "100%", padding: "8px", border: "1px dashed var(--color-border)", borderRadius: "8px", background: "var(--color-surface)", color: "var(--color-text-primary)"
                  }}
                />
              </div>

              <label className="field" id="event-location" style={{ marginTop: "16px" }}>
                <span>Location <em>*</em></span>
                <select
                  value={locationType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocationType(val);
                    if (val !== "Other") {
                      setFormState({ ...formState, location: val });
                    } else {
                      setFormState({ ...formState, location: customLocation });
                    }
                  }}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--color-border)", borderRadius: "8px", background: "var(--color-surface)", color: "var(--color-text-primary)", fontWeight: 500 }}
                >
                  <option value="Xebia Gurgaon HQ (Sector 45)">Xebia Gurgaon HQ (Sector 45)</option>
                  <option value="Xebia Noida Office (Sector 62)">Xebia Noida Office (Sector 62)</option>
                  <option value="Virtual (Microsoft Teams)">Virtual (Microsoft Teams)</option>
                  <option value="Virtual (Zoom)">Virtual (Zoom)</option>
                  <option value="Other">Other (Custom Location)</option>
                </select>
              </label>

              {locationType === "Other" && (
                <Field 
                  label="Specify Custom Location" 
                  required 
                  value={customLocation}
                  onChange={(val) => {
                    setCustomLocation(val);
                    setFormState({ ...formState, location: val });
                  }}
                  placeholder="Enter custom venue address or details..."
                />
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                <Field 
                  label="Meeting Link / URL (Optional)" 
                  type="url"
                  value={formState.meetingUrl || ""}
                  onChange={(val) => setFormState({ ...formState, meetingUrl: val })}
                  placeholder="e.g. https://teams.microsoft.com/..."
                />
                <Field 
                  label="Max Seats (0 for unlimited)" 
                  type="number"
                  placeholder="e.g. 50"
                  value={formState.maxCapacity || 0}
                  onChange={(val) => setFormState({ ...formState, maxCapacity: parseInt(val, 10) || 0 })}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                {editingEvent ? (
                  <>
                    {formState.status === "Draft" && (
                      <button type="button" className="outline" onClick={() => handleSave(null, "Published")} style={{ color: "var(--color-success)", borderColor: "var(--color-success)" }}>
                        Publish Now
                      </button>
                    )}
                    <button type="submit" className="primary">
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="outline" onClick={() => handleSave(null, "Draft")} style={{ color: "var(--color-primary)", borderColor: "var(--color-primary)" }}>
                      Save as Draft
                    </button>
                    <button type="button" className="primary" onClick={() => handleSave(null, "Published")}>
                      Publish Event
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
