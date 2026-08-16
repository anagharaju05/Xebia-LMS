import { useState, useEffect, useCallback } from "react";
import jsPDF from "jspdf";

const STORAGE_KEY_PREFIX = "xebia_lms_whiteboard_notes_";

export function useWhiteboardStore(user) {
  const userId = user?.email || user?.id || "default_teacher";
  const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;

  const [savedNotes, setSavedNotes] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : getSampleWhiteboards(user?.name || "Teacher");
    } catch (e) {
      console.error("Failed to parse saved whiteboard notes:", e);
      return getSampleWhiteboards(user?.name || "Teacher");
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(savedNotes));
    } catch (e) {
      console.error("Failed to save whiteboard notes to localStorage:", e);
    }
  }, [savedNotes, storageKey]);

  const saveNote = useCallback((noteData) => {
    const newNote = {
      id: `wb-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: noteData.title || "Untitled Whiteboard Note",
      subject: noteData.subject || "General Topic",
      authorName: user?.name || "Teacher",
      authorEmail: user?.email || "",
      thumbnail: noteData.thumbnail || "",
      elements: noteData.elements || [],
      canvasBackground: noteData.canvasBackground || "blank",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSavedNotes((prev) => [newNote, ...prev]);
    return newNote;
  }, [user]);

  const updateNote = useCallback((id, updatedFields) => {
    setSavedNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, ...updatedFields, updatedAt: new Date().toISOString() }
          : note
      )
    );
  }, []);

  const deleteNote = useCallback((id) => {
    setSavedNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  const exportAsPNG = useCallback((canvasElement, title = "whiteboard-notes") => {
    if (!canvasElement) return;
    const link = document.createElement("a");
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}.png`;
    link.href = canvasElement.toDataURL("image/png");
    link.click();
  }, []);

  const exportAsPDF = useCallback((canvasElement, title = "Whiteboard Notes") => {
    if (!canvasElement) return;
    try {
      const imgData = canvasElement.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvasElement.width > canvasElement.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvasElement.width, canvasElement.height]
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvasElement.width, canvasElement.height);
      pdf.save(`${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
    }
  }, []);

  return {
    savedNotes,
    saveNote,
    updateNote,
    deleteNote,
    exportAsPNG,
    exportAsPDF
  };
}

function getSampleWhiteboards(teacherName) {
  return [
    {
      id: "wb-sample-1",
      title: "Spring Boot Microservices Architecture",
      subject: "Backend Development",
      authorName: teacherName,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      elements: [],
      canvasBackground: "grid",
      thumbnail: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'><rect width='100%' height='100%' fill='%23F7F8FC'/><text x='50%' y='40%' font-family='sans-serif' font-size='16' font-weight='bold' fill='%236C1D5F' text-anchor='middle'>Spring Boot Architecture</text><rect x='80' y='120' width='90' height='50' rx='6' fill='%236C1D5F' opacity='0.15' stroke='%236C1D5F' stroke-width='2'/><text x='125' y='150' font-family='sans-serif' font-size='12' fill='%236C1D5F' text-anchor='middle'>API Gateway</text><line x1='170' y1='145' x2='220' y2='145' stroke='%23FF6200' stroke-width='3'/><rect x='220' y='120' width='100' height='50' rx='6' fill='%2301AC9F' opacity='0.15' stroke='%2301AC9F' stroke-width='2'/><text x='270' y='150' font-family='sans-serif' font-size='12' fill='%2301AC9F' text-anchor='middle'>Auth Service</text></svg>"
    },
    {
      id: "wb-sample-2",
      title: "React State Management & Context API Flow",
      subject: "Frontend Engineering",
      authorName: teacherName,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      elements: [],
      canvasBackground: "dots",
      thumbnail: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'><rect width='100%' height='100%' fill='%231E1E28'/><text x='50%' y='40%' font-family='sans-serif' font-size='16' font-weight='bold' fill='%2320d0c4' text-anchor='middle'>React Context Flow</text><circle cx='200' cy='140' r='45' fill='none' stroke='%23ff8b45' stroke-width='3'/><text x='200' y='145' font-family='sans-serif' font-size='12' fill='%23ffffff' text-anchor='middle'>Provider</text></svg>"
    }
  ];
}
