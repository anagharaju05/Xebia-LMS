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
  status: "Published"
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
    const totalReg = registrations.length;
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

  const exportToExcel = async () => {
    if (!selectedEvent) return;
    try {
      const XLSX = await import('xlsx');
      const data = [
        ["Student Name", "Email ID", "Enrolled Event"]
      ];
      selectedRegistrations.forEach((reg) => {
        data.push([reg.studentName, reg.studentEmail, selectedEvent.title]);
      });
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendees");
      XLSX.writeFile(workbook, `${selectedEvent.title.replace(/\s+/g, "_")}_attendees.xlsx`);
      showToast("Excel exported successfully", "success");
    } catch (err) {
      showToast("Failed to export to Excel: " + err.message, "danger");
    }
  };

  const exportToCSV = () => {
    if (!selectedEvent) return;
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
    selectedRegistrations.forEach((reg) => {
      rows.push([escape(reg.studentName), escape(reg.studentEmail), escape(selectedEvent.title)]);
    });
    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedEvent.title.replace(/\s+/g, "_")}_attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV exported successfully", "success");
  };

  function handleSave(e, customStatus = null) {
    if (e) e.preventDefault();
    if (!formState.title.trim() || !formState.timeline || !formState.deadline) {
      showToast("Please fill in all required fields", "warning");
      return;
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
    <div className="events-admin-page">
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
                          className={`event-status-badge ${event.status?.toLowerCase() === "draft" ? "draft" : "published"}`}
                          style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
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
                        <th>Cohort</th>
                        <th>Registered On</th>
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
                            <span className="cohort-tag">{reg.cohort || "N/A"}</span>
                          </td>
                          <td>
                            <time>{formatDateTime(reg.registeredAt)}</time>
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

              <label className="field" id="event-location">
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

              <Field 
                label="Meeting Link / URL (Optional)" 
                type="url"
                value={formState.meetingUrl || ""}
                onChange={(val) => setFormState({ ...formState, meetingUrl: val })}
                placeholder="e.g. https://teams.microsoft.com/l/meetup-join/..."
              />

              <div className="image-preset-picker">
                <span className="preset-label">Choose Event Image Banner:</span>
                <div className="preset-grid">
                  {PRESET_IMAGES.map((img) => (
                    <button 
                      key={img.name} 
                      type="button"
                      className={`preset-btn ${formState.image === img.url ? "selected" : ""}`}
                      onClick={() => setFormState({ ...formState, image: img.url })}
                    >
                      <img src={img.url} alt={img.name} />
                      <span>{img.name}</span>
                    </button>
                  ))}
                </div>
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
