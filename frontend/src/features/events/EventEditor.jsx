import { useState } from "react";
import { CalendarDays, MapPin, Clock, Users, Link, FileText, ImageIcon, CheckCircle2, Save, Plus, ExternalLink, ShieldCheck } from "lucide-react";

import PageTitle from "../../components/common/PageTitle.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import Field from "../../components/common/Field.jsx";
import TextArea from "../../components/common/TextArea.jsx";
import Segmented from "../../components/common/Segmented.jsx";
import { api } from "../../services/api.js";
import { useToast } from "../../hooks/useToast.js";

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

export default function EventEditor({ initial, onCancel, onSave }) {
  const { showToast } = useToast();
  const [form, setForm] = useState(initial || EMPTY_EVENT);
  const [previewImage, setPreviewImage] = useState(form.image);
  const isEdit = Boolean(initial?.id);

  const standardOptions = [
    "Xebia Gurgaon HQ (Sector 45)",
    "Xebia Noida Office (Sector 62)",
    "Virtual (Microsoft Teams)",
    "Virtual (Zoom)"
  ];
  
  const initialLocType = form.location && !standardOptions.includes(form.location) ? "Other" : form.location;
  const [locationType, setLocationType] = useState(initialLocType || "Xebia Gurgaon HQ (Sector 45)");
  const [customLocation, setCustomLocation] = useState(initialLocType === "Other" ? form.location : "");

  function patch(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  function handleSave(customStatus = null) {
    if (!form.title.trim() || !form.timeline || !form.deadline) {
      showToast("Please fill in all required fields", "warning");
      return;
    }

    if (form.meetingUrl && form.meetingUrl.trim()) {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(form.meetingUrl.trim())) {
        showToast("Please enter a valid Meeting Link URL", "danger");
        return;
      }
    }

    const nextStatus = customStatus || form.status || "Published";
    onSave({ ...form, status: nextStatus });
  }

  const completed = [form.title, form.timeline, form.deadline, form.location, form.image].filter(Boolean).length;

  return (
    <section className="page split-page">
      <div className="work-column">
        <PageTitle
          icon={CalendarDays}
          title={isEdit ? "Edit Event" : "Create New Event"}
          subtitle="Set up event details, location, and registration settings."
        />
        
        <section className="form-section top-accent-purple">
          <SectionHeader icon={ShieldCheck} title="Event Details" />
          <Field 
            label="Event Title" 
            required 
            value={form.title} 
            onChange={(value) => patch("title", value)} 
            placeholder="e.g. Hackathon 2026" 
          />
          <TextArea 
            label="Description" 
            value={form.description} 
            onChange={(value) => patch("description", value)} 
            placeholder="Details about the event, objectives, prerequisites..." 
            rows={4}
          />
        </section>

        <section className="form-section">
          <SectionHeader icon={Clock} title="Timeline & Capacity" />
          <div className="two-column">
            <Field 
              label="Timeline (Start Date & Time)" 
              required 
              type="datetime-local"
              value={form.timeline}
              onChange={(value) => patch("timeline", value)}
            />
            <Field 
              label="Registration Deadline" 
              required 
              type="datetime-local"
              value={form.deadline}
              onChange={(value) => patch("deadline", value)}
            />
          </div>
          <Field 
            label="Max Seats (0 for unlimited)" 
            type="number"
            value={form.maxCapacity || 0}
            onChange={(value) => patch("maxCapacity", parseInt(value, 10) || 0)}
          />
        </section>

        <section className="form-section">
          <SectionHeader icon={MapPin} title="Location & Meeting" />
          <label className="field" id="event-location">
            <span>Location <em>*</em></span>
            <select
              value={locationType}
              onChange={(e) => {
                const val = e.target.value;
                setLocationType(val);
                if (val !== "Other") {
                  patch("location", val);
                } else {
                  patch("location", customLocation);
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
                patch("location", val);
              }}
              placeholder="Enter custom venue address or details..."
            />
          )}

          <Field 
            label="Meeting Link / URL (Optional)" 
            type="url"
            value={form.meetingUrl || ""}
            onChange={(value) => patch("meetingUrl", value)}
            placeholder="e.g. https://teams.microsoft.com/..."
          />
        </section>

        <section className="form-section">
          <SectionHeader icon={ImageIcon} title="Banner Image" />
          <div className="field" style={{ marginTop: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: "8px", display: "block" }}>
              Upload Custom Event Banner
            </span>
            <label className="upload-control dropzone-area" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", padding: previewImage && previewImage !== PRESET_IMAGES[0].url ? "0" : "48px 16px", border: "2px dashed var(--color-border)", borderRadius: "12px", color: "var(--color-text-secondary)", cursor: "pointer", background: "var(--color-surface-secondary)", width: "100%", transition: "all 0.2s ease", overflow: "hidden", position: "relative" }}>
              {previewImage && previewImage !== PRESET_IMAGES[0].url ? (
                <>
                  <img src={previewImage} alt="Event Banner" style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", color: "white", opacity: 0, transition: "opacity 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                    <ImageIcon size={32} style={{ marginBottom: "8px" }} />
                    <span style={{ fontWeight: 600 }}>Click to change image</span>
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon size={40} style={{ color: "var(--color-primary)", opacity: 0.8 }} />
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: "15px", color: "var(--color-text-primary)", display: "block", marginBottom: "4px" }}>Click to browse for an image</span>
                    <span style={{ fontSize: "13px", opacity: 0.8 }}>Supports JPG, PNG, GIF, WebP</span>
                  </div>
                </>
              )}
              <input 
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  
                  // Convert image to Base64 to save directly in the DB
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64Url = reader.result;
                    setPreviewImage(base64Url);
                    patch("image", base64Url);
                    showToast("Image uploaded successfully!", "success");
                  };
                  reader.onerror = () => {
                    showToast("Failed to process image", "danger");
                  };
                  showToast("Processing image...", "info");
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </div>
        </section>

        <section className="form-section">
          <SectionHeader icon={CheckCircle2} title="Status" />
          <Segmented value={form.status} onChange={(value) => patch("status", value)} options={["Published", "Draft"]} />
          <div className={form.status === "Published" ? "status-callout" : "status-callout inactive"}>
            <span />
            {form.status === "Published" ? "Visible to students and open for registration" : "Hidden from students until ready"}
          </div>
        </section>

        <div className="sticky-actions">
          <span className="autosave"><Save size={16} /> Auto-saved locally</span>
          <button className="secondary" onClick={onCancel}>Cancel</button>
          <button className="outline" onClick={() => handleSave("Draft")}>Save as Draft</button>
          <button className="primary" onClick={() => handleSave()}>
            <Plus size={18} /> {isEdit ? "Update Event" : "Publish Event"}
          </button>
        </div>
      </div>

      <aside className="preview-column">
        <h3>Live Preview</h3>
        <article className="event-admin-card" style={{ cursor: 'default', transform: 'none', boxShadow: 'var(--shadow-md)' }}>
          <div className="event-card-img">
            {previewImage && previewImage !== PRESET_IMAGES[0].url ? (
              <img src={previewImage} alt={form.title} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-surface-secondary)", color: "var(--color-text-secondary)" }}>
                <ImageIcon size={32} />
              </div>
            )}
            <span className="event-status-badge active">
              Open to Register
            </span>
          </div>
          <div className="event-card-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span 
                className={`${form.status?.toLowerCase() === "draft" ? "draft" : "published"}`}
                style={{
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  background: form.status?.toLowerCase() === "draft" ? "var(--color-surface-secondary)" : "rgba(1, 172, 159, 0.12)",
                  color: form.status?.toLowerCase() === "draft" ? "var(--color-text-secondary)" : "var(--color-success)"
                }}
              >
                {form.status || "Published"}
              </span>
            </div>
            <h3>{form.title || "Event Title"}</h3>
            <p className="event-desc">{form.description || "Event description goes here..."}</p>
            
            <div className="event-meta-info">
              <div className="meta-item">
                <Clock size={15} />
                <span><strong>Starts:</strong> {form.timeline || "Not set"}</span>
              </div>
              <div className="meta-item">
                <MapPin size={15} />
                <span><strong>Location:</strong> {form.location || "Not set"}</span>
              </div>
            </div>
            <div className="event-card-footer" style={{ marginTop: '12px' }}>
              <div className="reg-pill">
                <Users size={14} />
                <span>0 registered</span>
              </div>
            </div>
          </div>
        </article>

        <section className="tip-card" style={{ marginTop: "24px" }}>
          <strong>Quick Tips</strong>
          <p>Use a clear descriptive title.</p>
          <p>Provide exact meeting links if virtual.</p>
          <p>Keep Draft until ready to publish.</p>
        </section>
        
        <div className="preview-progress">
          <span style={{ width: `${(completed / 5) * 100}%` }} />
        </div>
      </aside>
    </section>
  );
}
