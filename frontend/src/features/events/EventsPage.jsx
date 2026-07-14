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
  CalendarDays
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
  location: ""
};

export default function EventsPage({ store, upsertEvent, deleteEvent, showToast }) {
  const events = store.events || [];
  const registrations = store.registrations || [];

  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formState, setFormState] = useState(EMPTY_EVENT);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    return events.filter(e => 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);

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
    setEditingEvent(null);
    setShowForm(true);
  }

  function openEdit(event) {
    setFormState(event);
    setEditingEvent(event);
    setShowForm(true);
  }

  function handleSave(e) {
    e.preventDefault();
    if (!formState.title.trim() || !formState.timeline || !formState.deadline) {
      showToast("Please fill in all required fields", "warning");
      return;
    }

    const payload = {
      ...formState,
      id: editingEvent ? editingEvent.id : undefined
    };

    upsertEvent("events", payload, editingEvent ? "Event updated" : "Event created");
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
              <button className="close-btn" onClick={() => setSelectedEventId(null)}>
                <X size={18} />
              </button>
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
                label="Event Title *" 
                id="event-title"
              >
                <input 
                  type="text" 
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="e.g. Hackathon 2026, React 19 Session"
                  required
                />
              </Field>

              <TextArea 
                label="Description" 
                id="event-desc"
                value={formState.description}
                onChange={(val) => setFormState({ ...formState, description: val })}
                placeholder="Details about the event, objectives, prerequisites..."
              />

              <div className="form-row-2">
                <Field label="Timeline (Start Date & Time) *" id="event-timeline">
                  <input 
                    type="datetime-local" 
                    value={formState.timeline}
                    onChange={(e) => setFormState({ ...formState, timeline: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Registration Deadline *" id="event-deadline">
                  <input 
                    type="datetime-local" 
                    value={formState.deadline}
                    onChange={(e) => setFormState({ ...formState, deadline: e.target.value })}
                    required
                  />
                </Field>
              </div>

              <Field label="Location / Meeting URL *" id="event-location">
                <input 
                  type="text" 
                  value={formState.location}
                  onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                  placeholder="e.g. Xebia HQ, Sector 45 Gurugram or Microsoft Teams Link"
                  required
                />
              </Field>

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
                <button type="submit" className="primary">
                  {editingEvent ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
