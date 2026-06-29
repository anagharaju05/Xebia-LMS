import { useState } from "react";
import { Upload } from "lucide-react";
import { readDroppedFile } from "../../utils/file.utils.js";

const ACCEPT_BY_TYPE = {
  Video: "video/*",
  PDF: "application/pdf,.pdf",
  PPT: ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
  Notes: ".txt,.md,.markdown,text/plain,text/markdown"
};

const COPY_BY_TYPE = {
  Video: "Drop an MP4/WebM video or browse to upload.",
  PDF: "Drop a PDF file to render it in the preview pane.",
  PPT: "Drop a PPT/PPTX deck to attach it with an inline preview frame.",
  Notes: "Drop a TXT or Markdown notes file to convert it into editable notes."
};

export default function FileDropZone({ type, onFile }) {
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(fileList) {
    const file = fileList?.[0];
    if (!file) return;
    readDroppedFile(file, onFile, type === "Notes");
  }

  return (
    <label
      className={`drop-zone ${isDragging ? "dragging" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
    >
      <Upload size={22} />
      <strong>{type} drag & drop upload</strong>
      <span>{COPY_BY_TYPE[type]}</span>
      <input type="file" accept={ACCEPT_BY_TYPE[type]} onChange={(event) => handleFiles(event.target.files)} />
    </label>
  );
}