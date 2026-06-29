import { useEffect, useState } from "react";
import { Boxes, FileText, Plus } from "lucide-react";
import PageTitle from "../../components/common/PageTitle.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import Field from "../../components/common/Field.jsx";
import TextArea from "../../components/common/TextArea.jsx";
import Toggle from "../../components/common/Toggle.jsx";
import Segmented from "../../components/common/Segmented.jsx";
import UploadControl from "../../components/common/UploadControl.jsx";
import FileDropZone from "../../components/common/FileDropZone.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ContentCard from "../../components/cards/ContentCard.jsx";
import BlockPreview from "../../components/preview/BlockPreview.jsx";
import { blockTypes } from "../../utils/data.js";
import { formatBytes } from "../../utils/format.utils.js";
import {
  createEmptyContentBlock,
  getContentPlaceholder
} from "./content.helpers.js";

export default function ContentBlockEditor({ store, selectedSubmoduleId, upsert, removeContentBlock, toggleEntity }) {
  const selectedSubmodule = store.submodules.find((item) => item.id === selectedSubmoduleId);
  const blocks = store.contentBlocks.filter((item) => item.submoduleId === selectedSubmoduleId).sort((a, b) => a.order - b.order);
  const [form, setForm] = useState(() => createEmptyContentBlock(selectedSubmoduleId, blocks.length + 1));
  const dropEnabledTypes = ["Video", "PDF", "PPT", "Notes"];

  useEffect(() => {
    setForm(createEmptyContentBlock(selectedSubmoduleId, blocks.length + 1));
  }, [selectedSubmoduleId]);

  function patch(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function attachFile(filePayload) {
    setForm((current) => ({
      ...current,
      url: filePayload.url || current.url,
      text: filePayload.text || current.text,
      fileName: filePayload.fileName,
      fileType: filePayload.fileType,
      fileSize: filePayload.fileSize,
      title: current.title || filePayload.fileName?.replace(/\.[^.]+$/, "") || current.title
    }));
  }

  function save() {
    upsert("contentBlocks", { ...form, submoduleId: selectedSubmoduleId, order: Number(form.order || 1) }, form.id ? "Content block updated" : "Content block created");
    setForm(createEmptyContentBlock(selectedSubmoduleId, blocks.length + 2));
  }

  return (
    <section className="content-editor">
      <PageTitle
        icon={Boxes}
        title={selectedSubmodule ? selectedSubmodule.title : "Content Blocks"}
        subtitle={selectedSubmodule ? `Build ordered content for /${selectedSubmodule.slug}` : "Select a submodule to manage content."}
      />
      <div className="content-layout">
        <div className="block-list">
          {blocks.map((block) => (
            <ContentCard
              key={block.id}
              block={block}
              onEdit={() => setForm(block)}
              onDelete={() => removeContentBlock(block.id)}
              onToggle={() => toggleEntity("contentBlocks", block.id, "isActive")}
            />
          ))}
          {blocks.length === 0 && <EmptyState title="No blocks yet" text="Add a heading, text, video, table or media block to start this lesson." />}
        </div>
        <section className="form-section block-form">
          <SectionHeader icon={Plus} title={form.id ? "Edit Content Block" : "Add Content Block"} />
          <Segmented value={form.type} onChange={(value) => patch("type", value)} options={blockTypes} wrap />
          <Field label="Title" value={form.title} onChange={(value) => patch("title", value)} placeholder="Enter heading text..." />
          {!["Video", "PDF", "PPT"].includes(form.type) && (
            <TextArea label={["Code", "Table", "Notes"].includes(form.type) ? form.type : "Text"} value={form.text} onChange={(value) => patch("text", value)} rows={form.type === "Code" ? 6 : 4} dark={form.type === "Code"} placeholder={getContentPlaceholder(form.type)} />
          )}
          <div className="field-grid">
            <Field label="URL / Storage Ref" value={form.url} onChange={(value) => patch("url", value)} placeholder="https://cdn.example.com/file.pdf" />
            <Field label="Caption" value={form.caption} onChange={(value) => patch("caption", value)} placeholder="Optional caption..." />
            <Field label="Language" value={form.language} onChange={(value) => patch("language", value)} placeholder="Java, JS, SQL..." />
            <Field label="Content Order" type="number" value={form.order} onChange={(value) => patch("order", value)} />
          </div>
          {dropEnabledTypes.includes(form.type) && (
            <FileDropZone type={form.type} onFile={attachFile} />
          )}
          {form.type === "Image" && <UploadControl onFile={(value) => patch("url", value)} />}
          {form.fileName && (
            <div className="file-meta-card">
              <FileText size={17} />
              <span>{form.fileName}</span>
              <b>{formatBytes(form.fileSize)}</b>
            </div>
          )}
          <Toggle label="isActive" description="Block is visible in the learner lesson" checked={form.isActive} onChange={(value) => patch("isActive", value)} />
          <div className="block-preview-wrap">
            <strong>Live Preview</strong>
            <BlockPreview block={form} />
          </div>
          <div className="action-row">
            <button className="secondary" onClick={() => setForm(createEmptyContentBlock(selectedSubmoduleId, blocks.length + 1))}>Cancel</button>
            <button className="primary" disabled={!selectedSubmoduleId || !form.type} onClick={save}><Plus size={18} /> {form.id ? "Save Block" : "Add Block"}</button>
          </div>
        </section>
      </div>
    </section>
  );
}
