import { Download, ExternalLink, FileText, Image as ImageIcon, PlayCircle } from "lucide-react";

const SAMPLE_VIDEO_URL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

function getVideoUrl(url) {
  if (!url || url.includes("youtube.com")) return SAMPLE_VIDEO_URL;
  return url;
}

function renderTable(text) {
  const rows = String(text || "")
    .split("\n")
    .map((row) => row.trim())
    .filter((row) => row.includes("|"))
    .map((row) => row.split("|").map((cell) => cell.trim()).filter(Boolean))
    .filter((row) => row.length);

  if (!rows.length) return <p>{text || "No table content has been added."}</p>;

  return (
    <div className="student-table-wrap">
      <table>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {row.map((cell, cellIndex) => {
                const Cell = rowIndex === 0 ? "th" : "td";
                return <Cell key={`cell-${cellIndex}`}>{cell}</Cell>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StudentContentRenderer({ block, onVideoEnded }) {
  const type = String(block.type || "Text").toLowerCase();
  const text = block.text || block.description || "";
  const title = block.title || "";

  if (type === "heading") return <h2 className="lesson-heading">{text || title}</h2>;

  if (type === "text") {
    return (
      <article className="lesson-copy">
        {title && <h3>{title}</h3>}
        <p>{text}</p>
      </article>
    );
  }

  if (type === "code") {
    return (
      <pre className="lesson-code"><code>{text || "// Lesson code will appear here"}</code></pre>
    );
  }

  if (type === "callout") {
    return (
      <aside className="lesson-callout">
        <strong>{title || "Remember"}</strong>
        <p>{text}</p>
      </aside>
    );
  }

  if (type === "image") {
    return block.url ? (
      <figure className="lesson-image">
        <img src={block.url} alt={block.caption || title || "Lesson visual"} />
        {(block.caption || title) && <figcaption>{block.caption || title}</figcaption>}
      </figure>
    ) : (
      <div className="student-content-placeholder"><ImageIcon /><span>{title || "Lesson visual"}</span></div>
    );
  }

  if (type === "video") {
    return (
      <section className="student-video">
        <video controls preload="metadata" src={getVideoUrl(block.url)} onEnded={onVideoEnded} />
        <div>
          <PlayCircle size={20} />
          <strong>{title || "Video lesson"}</strong>
          {block.caption && <span>{block.caption}</span>}
        </div>
      </section>
    );
  }

  if (type === "table") return renderTable(text);

  if (type === "pdf" || type === "ppt") {
    return (
      <section className="student-document">
        <header>
          <FileText size={24} />
          <div>
            <strong>{title || "Lesson resource"}</strong>
            {text && <p>{text}</p>}
          </div>
          {block.url && (
            <a href={block.url} target="_blank" rel="noreferrer" title="Open resource">
              <ExternalLink size={18} />
            </a>
          )}
        </header>
        {block.url ? (
          <iframe src={block.url} title={title || "Lesson resource"} />
        ) : (
          <div className="student-document-body">
            <p>{text || "The lesson resource will be available here."}</p>
            <button className="secondary" disabled><Download size={16} /> Resource unavailable</button>
          </div>
        )}
      </section>
    );
  }

  return (
    <article className="lesson-notes">
      {title && <h3>{title}</h3>}
      <p>{text || "Lesson notes will appear here."}</p>
    </article>
  );
}
