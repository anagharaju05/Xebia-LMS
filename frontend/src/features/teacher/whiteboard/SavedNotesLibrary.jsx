import React, { useState } from "react";
import { Search, Download, Trash2, Calendar, User, Eye, FileText, Sparkles, BookOpen } from "lucide-react";

export default function SavedNotesLibrary({
  notes = [],
  onLoadNote,
  onDeleteNote,
  onExportPNG,
  onExportPDF,
  user
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="notes-library-container">
      {/* Search Header */}
      <div className="notes-search-bar">
        <div style={{ position: "relative", flex: 1 }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-secondary)"
            }}
          />
          <input
            type="text"
            className="notes-search-input"
            style={{ paddingLeft: "42px" }}
            placeholder="Search saved whiteboard notes by title or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div
          className="teacher-empty"
          style={{
            padding: "60px 20px",
            textAlign: "center",
            background: "var(--color-surface)",
            borderRadius: "var(--radius, 12px)",
            border: "1px solid var(--color-border)"
          }}
        >
          <BookOpen size={48} style={{ color: "var(--color-primary)", marginBottom: "12px" }} />
          <h3>No saved whiteboard notes found</h3>
          <p style={{ color: "var(--color-text-secondary)", maxWidth: "400px", margin: "0 auto" }}>
            Draw diagrams and topic explanations on the Whiteboard and click "Save to Account" to store them here in your profile library.
          </p>
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <article key={note.id} className="note-card">
              {note.thumbnail ? (
                <img
                  src={note.thumbnail}
                  alt={note.title}
                  className="note-preview-img"
                />
              ) : (
                <div
                  className="note-preview-img"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--color-surface-secondary)",
                    color: "var(--color-primary)"
                  }}
                >
                  <Sparkles size={32} />
                </div>
              )}

              <div className="note-card-body">
                <span className="note-subject-pill">{note.subject || "General Topic"}</span>
                <h4 className="note-card-title">{note.title}</h4>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    color: "var(--color-text-secondary)"
                  }}
                >
                  <User size={13} />
                  <span>{note.authorName || user?.name || "Teacher"}</span>
                </div>
              </div>

              <div className="note-card-footer">
                <span className="note-date-text">
                  <Calendar size={12} style={{ display: "inline", verticalAlign: "-1px", marginRight: "4px" }} />
                  {new Date(note.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </span>

                <div className="note-card-actions">
                  <button
                    className="wb-icon-btn"
                    onClick={() => onLoadNote(note)}
                    title="Load note on Whiteboard canvas"
                  >
                    <Eye size={16} />
                  </button>

                  <button
                    className="wb-icon-btn"
                    onClick={() => {
                      const img = new Image();
                      img.src = note.thumbnail;
                      img.onload = () => {
                        const tempCanvas = document.createElement("canvas");
                        tempCanvas.width = img.width || 800;
                        tempCanvas.height = img.height || 500;
                        const ctx = tempCanvas.getContext("2d");
                        ctx.drawImage(img, 0, 0);
                        onExportPNG(tempCanvas, note.title);
                      };
                    }}
                    title="Download PNG"
                  >
                    <Download size={16} />
                  </button>

                  <button
                    className="wb-icon-btn danger"
                    onClick={() => {
                      if (window.confirm(`Delete "${note.title}" from your account saved notes?`)) {
                        onDeleteNote(note.id);
                      }
                    }}
                    title="Delete saved note"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
