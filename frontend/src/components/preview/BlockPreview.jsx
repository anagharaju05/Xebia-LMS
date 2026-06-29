import { FileText, Image as ImageIcon, Video } from "lucide-react";

export default function BlockPreview({ block, compact }) {
  if (!block) return null;
  if (block.type === "Heading") {
    return <div className="block-preview heading"><h2>{block.title || block.text || "Your Heading Here"}</h2></div>;
  }
  if (block.type === "Code") {
    return <pre className="block-preview code"><code>{block.text || "// Paste your code here..."}</code></pre>;
  }
  if (block.type === "Notes") {
    return (
      <div className="block-preview notes">
        <strong>{block.title || block.fileName || "Lesson Notes"}</strong>
        <pre>{block.text || "Drop a .txt or .md notes file, or type lesson notes here."}</pre>
      </div>
    );
  }
  if (block.type === "Image") {
    return (
      <div className="block-preview image">
        {block.url ? <img src={block.url} alt={block.caption || block.title || ""} /> : <ImageIcon size={28} />}
        {!compact && <span>{block.caption || "Live image preview"}</span>}
      </div>
    );
  }
  if (block.type === "Video") {
    return block.url ? (
      <div className="block-preview video-viewer">
        <video controls src={block.url} />
        {!compact && <span>{block.caption || block.fileName || "Video file preview"}</span>}
      </div>
    ) : (
      <div className="block-preview media"><Video size={26} /><span>Drag a video file here to preview it.</span></div>
    );
  }
  if (block.type === "PDF") {
    return block.url ? (
      <div className="block-preview document-viewer">
        <iframe title={block.title || block.fileName || "PDF preview"} src={block.url} />
      </div>
    ) : (
      <div className="block-preview media"><FileText size={26} /><span>Drag a PDF file here to view it.</span></div>
    );
  }
  if (block.type === "PPT") {
    return block.url ? (
      <div className="block-preview document-viewer ppt-viewer">
        <iframe title={block.title || block.fileName || "Presentation preview"} src={block.url} />
        <a href={block.url} target="_blank" rel="noreferrer">Open presentation preview</a>
      </div>
    ) : (
      <div className="block-preview media"><FileText size={26} /><span>Drag a PPT or PPTX file here to attach it.</span></div>
    );
  }
  if (block.type === "Table") {
    return <pre className="block-preview table"><code>{block.text || "| Column A | Column B |\n| --- | --- |\n| Value 1 | Value 2 |"}</code></pre>;
  }
  if (block.type === "Callout") {
    return <div className="block-preview callout"><strong>{block.title || "Pro Tip"}</strong><p>{block.text || "Your callout body text will appear here."}</p></div>;
  }
  return <div className="block-preview text"><strong>{block.title || "Text Block"}</strong><p>{block.text || "Enter text content..."}</p></div>;
}