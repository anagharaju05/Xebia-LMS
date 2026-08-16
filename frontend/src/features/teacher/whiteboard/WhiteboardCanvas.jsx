import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  PenTool, Paintbrush, Highlighter, Eraser, Square, Circle, Minus,
  ArrowRight, Type, RotateCcw, RotateCw, Trash2, Download, Share2,
  Monitor, Save, FileText, Check, X, Grid, CircleDot, Eye
} from "lucide-react";

const COLOR_SWATCHES = [
  { label: "Velvet Purple", value: "#6C1D5F" },
  { label: "Xebia Orange", value: "#FF6200" },
  { label: "Teal Success", value: "#01AC9F" },
  { label: "Classic Slate", value: "#1E1E28" },
  { label: "Ocean Blue", value: "#2563EB" },
  { label: "Crimson Red", value: "#DC2626" },
  { label: "Emerald Green", value: "#16A34A" },
  { label: "Snow White", value: "#FFFFFF" }
];

export default function WhiteboardCanvas({
  user,
  onSaveNote,
  onExportPNG,
  onExportPDF,
  showToast,
  loadedNote = null
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  // Tools & Styling state
  const [currentTool, setCurrentTool] = useState("pen"); // pen, brush, highlighter, eraser, rectangle, circle, line, arrow, text
  const [strokeColor, setStrokeColor] = useState("#6C1D5F");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [canvasBg, setCanvasBg] = useState("grid"); // blank, grid, dots
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [snapshot, setSnapshot] = useState(null);

  // Screen share & save modal
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saveSubject, setSaveSubject] = useState("");

  // Resize canvas to fill container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Save current canvas state before resize
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (canvas.width > 0 && canvas.height > 0) {
      tempCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Redraw previous content
    if (tempCanvas.width > 0 && tempCanvas.height > 0) {
      ctx.drawImage(tempCanvas, 0, 0);
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  // Load note if selected from library
  useEffect(() => {
    if (loadedNote && loadedNote.thumbnail && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveStateToHistory();
      };
      img.src = loadedNote.thumbnail;
      if (loadedNote.title) setSaveTitle(loadedNote.title);
      if (loadedNote.subject) setSaveSubject(loadedNote.subject);
    }
  }, [loadedNote]);

  const saveStateToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev, imageData]);
    setRedoStack([]);
  }, []);

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const newHistory = [...history];
    const current = newHistory.pop();
    setRedoStack((prev) => [...prev, current]);
    setHistory(newHistory);

    const previous = newHistory[newHistory.length - 1];
    if (previous) {
      ctx.putImageData(previous, 0, 0);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const newRedo = [...redoStack];
    const next = newRedo.pop();
    setRedoStack(newRedo);
    setHistory((prev) => [...prev, next]);
    ctx.putImageData(next, 0, 0);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveStateToHistory();
    showToast?.("Canvas cleared");
  };

  // Screen Sharing WebRTC implementation
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      setIsScreenSharing(false);
      setMediaStream(null);
      showToast?.("Screen sharing stopped");
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
        setMediaStream(stream);
        setIsScreenSharing(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setMediaStream(null);
        };
        showToast?.("Live screen sharing active");
      } catch (err) {
        console.error("Screen sharing error:", err);
        showToast?.("Could not start screen sharing");
      }
    }
  };

  useEffect(() => {
    if (isScreenSharing && mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [isScreenSharing, mediaStream]);

  // Mouse & Touch events
  const getPointerPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    const pos = getPointerPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (currentTool === "text") {
      setTextPos(pos);
      return;
    }

    setIsDrawing(true);
    setStartPos(pos);
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);

    // Set brush parameters
    if (currentTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = strokeWidth * 3;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = strokeColor;
      ctx.fillStyle = strokeColor;
      ctx.lineWidth = currentTool === "brush" ? strokeWidth * 2.5 : strokeWidth;
      ctx.globalAlpha = currentTool === "highlighter" ? 0.35 : 1.0;
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const pos = getPointerPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (["pen", "brush", "highlighter", "eraser"].includes(currentTool)) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (snapshot) {
      // For shapes, restore snapshot then draw vector shape preview
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = "source-over";

      if (currentTool === "rectangle") {
        ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
      } else if (currentTool === "circle") {
        const radius = Math.sqrt(
          Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2)
        );
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (currentTool === "line") {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (currentTool === "arrow") {
        drawArrow(ctx, startPos.x, startPos.y, pos.x, pos.y);
      }
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = "source-over";
      saveStateToHistory();
    }
  };

  const drawArrow = (ctx, fromX, fromY, toX, toY) => {
    const headLength = 14;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.lineTo(toX, toY);
    ctx.fillStyle = strokeColor;
    ctx.fill();
  };

  const placeText = (e) => {
    e.preventDefault();
    if (!textInput.trim() || !textPos || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.font = `bold ${strokeWidth * 4 + 14}px Inter, sans-serif`;
    ctx.fillStyle = strokeColor;
    ctx.globalAlpha = 1.0;
    ctx.fillText(textInput, textPos.x, textPos.y);
    setTextInput("");
    setTextPos(null);
    saveStateToHistory();
  };

  const handleTriggerSaveModal = () => {
    if (!saveTitle) {
      setSaveTitle(`Lecture Notes - ${new Date().toLocaleDateString("en-IN")}`);
    }
    if (!saveSubject) {
      setSaveSubject("General Topic");
    }
    setShowSaveModal(true);
  };

  const handleConfirmSave = (e) => {
    e?.preventDefault();
    if (!saveTitle.trim()) return;
    const canvas = canvasRef.current;
    const thumbnail = canvas ? canvas.toDataURL("image/png") : "";

    onSaveNote?.({
      title: saveTitle,
      subject: saveSubject,
      thumbnail,
      canvasBackground: canvasBg
    });

    setShowSaveModal(false);
    showToast?.("Whiteboard note saved to your account library!");
  };

  return (
    <div className="whiteboard-workspace" ref={containerRef}>
      {/* Top Action Toolbar */}
      <header className="whiteboard-top-toolbar">
        <div className="whiteboard-title-group">
          <h2>
            <PenTool size={20} style={{ color: "var(--color-primary)" }} />
            Teacher Interactive Whiteboard
          </h2>
          <span className="whiteboard-badge">
            <Eye size={12} /> {user?.name || "Madam"} Account
          </span>
        </div>

        <div className="whiteboard-action-buttons">
          <button
            className={`wb-btn ${isScreenSharing ? "active" : ""}`}
            onClick={toggleScreenShare}
            title="Share screen live during topic explanation"
          >
            <Monitor size={16} />
            <span>{isScreenSharing ? "Stop Screen Share" : "Screen Share"}</span>
          </button>

          <button
            className="wb-btn"
            onClick={handleUndo}
            disabled={history.length <= 1}
            title="Undo stroke"
          >
            <RotateCcw size={16} />
          </button>

          <button
            className="wb-btn"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            title="Redo stroke"
          >
            <RotateCw size={16} />
          </button>

          <button
            className="wb-btn"
            onClick={handleClearCanvas}
            title="Clear canvas"
          >
            <Trash2 size={16} />
          </button>

          <div style={{ width: "1px", height: "24px", background: "var(--color-border)" }} />

          <button
            className="wb-btn"
            onClick={() => onExportPNG?.(canvasRef.current, saveTitle || "whiteboard")}
            title="Download PNG image"
          >
            <Download size={16} />
            <span>Export PNG</span>
          </button>

          <button
            className="wb-btn"
            onClick={() => onExportPDF?.(canvasRef.current, saveTitle || "whiteboard")}
            title="Download PDF document"
          >
            <FileText size={16} />
            <span>Export PDF</span>
          </button>

          <button
            className="wb-btn primary"
            onClick={handleTriggerSaveModal}
            title="Save notes into account library"
          >
            <Save size={16} />
            <span>Save to Account</span>
          </button>
        </div>
      </header>

      {/* Main Canvas & Left Tools Layout */}
      <div className="whiteboard-main-container">
        {/* Left Floating Tools */}
        <aside className="whiteboard-tools-panel">
          <button
            className={`tool-icon-btn ${currentTool === "pen" ? "active" : ""}`}
            onClick={() => setCurrentTool("pen")}
            title="Marker / Pen"
          >
            <PenTool size={18} />
            <span>Pen</span>
          </button>

          <button
            className={`tool-icon-btn ${currentTool === "brush" ? "active" : ""}`}
            onClick={() => setCurrentTool("brush")}
            title="Thick Brush"
          >
            <Paintbrush size={18} />
            <span>Brush</span>
          </button>

          <button
            className={`tool-icon-btn ${currentTool === "highlighter" ? "active" : ""}`}
            onClick={() => setCurrentTool("highlighter")}
            title="Highlighter"
          >
            <Highlighter size={18} />
            <span>Highlight</span>
          </button>

          <button
            className={`tool-icon-btn ${currentTool === "eraser" ? "active" : ""}`}
            onClick={() => setCurrentTool("eraser")}
            title="Eraser"
          >
            <Eraser size={18} />
            <span>Eraser</span>
          </button>

          <div className="tool-group-divider" />

          <button
            className={`tool-icon-btn ${currentTool === "rectangle" ? "active" : ""}`}
            onClick={() => setCurrentTool("rectangle")}
            title="Rectangle"
          >
            <Square size={18} />
            <span>Rect</span>
          </button>

          <button
            className={`tool-icon-btn ${currentTool === "circle" ? "active" : ""}`}
            onClick={() => setCurrentTool("circle")}
            title="Circle"
          >
            <Circle size={18} />
            <span>Circle</span>
          </button>

          <button
            className={`tool-icon-btn ${currentTool === "line" ? "active" : ""}`}
            onClick={() => setCurrentTool("line")}
            title="Straight Line"
          >
            <Minus size={18} />
            <span>Line</span>
          </button>

          <button
            className={`tool-icon-btn ${currentTool === "arrow" ? "active" : ""}`}
            onClick={() => setCurrentTool("arrow")}
            title="Arrow"
          >
            <ArrowRight size={18} />
            <span>Arrow</span>
          </button>

          <button
            className={`tool-icon-btn ${currentTool === "text" ? "active" : ""}`}
            onClick={() => setCurrentTool("text")}
            title="Text Overlay"
          >
            <Type size={18} />
            <span>Text</span>
          </button>

          <div className="tool-group-divider" />

          <button
            className={`tool-icon-btn ${canvasBg === "grid" ? "active" : ""}`}
            onClick={() => setCanvasBg(canvasBg === "grid" ? "blank" : "grid")}
            title="Toggle Grid Background"
          >
            <Grid size={18} />
            <span>Grid</span>
          </button>

          <button
            className={`tool-icon-btn ${canvasBg === "dots" ? "active" : ""}`}
            onClick={() => setCanvasBg(canvasBg === "dots" ? "blank" : "dots")}
            title="Toggle Dots Background"
          >
            <CircleDot size={18} />
            <span>Dots</span>
          </button>
        </aside>

        {/* Center Canvas */}
        <main className={`canvas-wrapper bg-${canvasBg}`}>
          <canvas
            ref={canvasRef}
            className="main-whiteboard-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {/* Text Input Popup Overlay */}
          {textPos && (
            <form
              onSubmit={placeText}
              style={{
                position: "absolute",
                left: textPos.x,
                top: textPos.y,
                zIndex: 30,
                display: "flex",
                gap: "6px"
              }}
            >
              <input
                type="text"
                autoFocus
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type explanation text..."
                style={{
                  padding: "6px 12px",
                  border: "2px solid var(--color-primary)",
                  borderRadius: "6px",
                  background: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  fontSize: "14px",
                  boxShadow: "var(--shadow-md)"
                }}
              />
              <button
                type="submit"
                className="wb-btn primary"
                style={{ padding: "6px 12px" }}
              >
                Place
              </button>
            </form>
          )}

          {/* Screen Share Overlay Window */}
          {isScreenSharing && (
            <div className="screen-share-overlay">
              <header className="screen-share-header">
                <span>🎥 Screen Share Active</span>
                <button
                  onClick={toggleScreenShare}
                  style={{ background: "transparent", color: "#fff", border: 0, cursor: "pointer" }}
                >
                  <X size={14} />
                </button>
              </header>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="screen-share-video"
              />
            </div>
          )}

          {/* Floating Bottom Color & Stroke Size Bar */}
          <div className="whiteboard-floating-bar">
            {/* Color Swatches */}
            <div className="color-swatches-row">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.value}
                  className={`color-dot ${strokeColor === swatch.value ? "active" : ""}`}
                  style={{ background: swatch.value }}
                  onClick={() => setStrokeColor(swatch.value)}
                  title={swatch.label}
                />
              ))}
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="custom-color-picker-input"
                title="Custom color picker"
              />
            </div>

            <div style={{ width: "1px", height: "20px", background: "var(--color-border)" }} />

            {/* Stroke Width Slider */}
            <div className="stroke-slider-group">
              <span>Size:</span>
              <input
                type="range"
                min="1"
                max="30"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
              />
              <b style={{ minWidth: "20px" }}>{strokeWidth}px</b>
            </div>
          </div>
        </main>
      </div>

      {/* Save Note Modal */}
      {showSaveModal && (
        <div className="assessment-modal-backdrop" onClick={() => setShowSaveModal(false)}>
          <section
            className="assessment-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "480px" }}
          >
            <header>
              <div>
                <h2>Save Note to Particular Account</h2>
                <p>Save topic diagrams & notes under {user?.name || "your"} profile library.</p>
              </div>
              <button
                className="assessment-icon-btn"
                onClick={() => setShowSaveModal(false)}
              >
                <X />
              </button>
            </header>

            <form onSubmit={handleConfirmSave} style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px 0" }}>
              <label className="assessment-field">
                <span>Whiteboard Note Title *</span>
                <input
                  type="text"
                  required
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="e.g. Spring Boot Microservices Architecture"
                />
              </label>

              <label className="assessment-field"><span>Subject / Batch Tag</span><input type="text" value={saveSubject} onChange={(e) => setSaveSubject(e.target.value)} placeholder="e.g. Java Full Stack - Batch A" /></label>

              <footer className="assessment-modal-actions" style={{ marginTop: "10px" }}><button type="button" className="secondary" onClick={() => setShowSaveModal(false)}>Cancel</button><button type="submit" className="primary"><Save /> Save Whiteboard Note</button></footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
