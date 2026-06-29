import { useState } from "react";
import {
  CheckCircle2,
  FileText,
  Palette,
  Plus,
  Save,
  ShieldCheck,
  Smile,
  Tags
} from "lucide-react";

import PageTitle from "../../components/common/PageTitle.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import Field from "../../components/common/Field.jsx";
import TextArea from "../../components/common/TextArea.jsx";
import Segmented from "../../components/common/Segmented.jsx";
import UploadControl from "../../components/common/UploadControl.jsx";
import ColorDots from "../../components/common/ColorDots.jsx";
import CategoryThumb from "../../components/common/CategoryThumb.jsx";
import CategoryPreview from "../../components/preview/CategoryPreview.jsx";
import FieldSummary from "../../components/preview/FieldSummary.jsx";
import EmojiPicker from "../../components/common/EmojiPicker.jsx";
import { createEmptyCategory } from "./category.defaults.js";
import { hasDuplicateCategoryName } from "./category.helpers.js";
import { createSlug } from "../../utils/slug.utils.js";

export default function CategoryEditor({ initial, categories, onCancel, onSave }) {
  const [form, setForm] = useState(initial || createEmptyCategory());
  const isEdit = Boolean(initial?.id);
  const duplicate = hasDuplicateCategoryName(categories, form);
  const completed = [
    form.name,
    form.iconType === "emoji" ? form.icon : form.imageUrl,
    form.description,
    form.accentColor,
    form.status
  ].filter(Boolean).length;

  function patch(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "name" && !isEdit ? { slug: createSlug(value) } : {})
    }));
  }

  return (
    <section className="page split-page">
      <div className="work-column">
        <PageTitle
          icon={Tags}
          title={isEdit ? "Edit Category" : "Create New Category"}
          subtitle="Fill the details below to set up a learning category."
          action={<img src="/brand/Logo-Purple.png" className="mini-logo" alt="Xebia" />}
        />
        <section className="form-section top-accent-purple">
          <SectionHeader icon={ShieldCheck} title="Category Identity" />
          <div className="field-grid">
            <Field label="Category Name" required value={form.name} onChange={(value) => patch("name", value)} placeholder="e.g. Web Development" max={100} />
            <Field label="Slug" value={form.slug} onChange={(value) => patch("slug", createSlug(value))} placeholder="web-development" />
          </div>
          <p className={duplicate ? "field-error" : "field-note"}>
            {duplicate ? "This category name already exists." : "Must be unique. Checked in real time."}
          </p>
        </section>
        <section className="form-section top-accent-purple">
          <SectionHeader icon={Smile} title="Icon / Thumbnail" />
          <Segmented
            value={form.iconType}
            onChange={(value) => patch("iconType", value)}
            options={[["emoji", "Emoji"], ["image", "Image URL"]]}
          />
          <div className="inline-media-row">
            <CategoryThumb category={form} large />
            {form.iconType === "emoji" ? (
              <EmojiPicker label="Emoji" value={form.icon} onChange={(value) => patch("icon", value)} required />
            ) : (
              <div className="field-stack">
                <Field label="Image URL" value={form.imageUrl} onChange={(value) => patch("imageUrl", value)} placeholder="https://cdn.example.com/category.png" />
                <UploadControl onFile={(value) => patch("imageUrl", value)} />
              </div>
            )}
          </div>
          <p className="field-note">CDN URLs supported. Emoji or image will appear as the category thumbnail.</p>
        </section>
        <section className="form-section">
          <SectionHeader icon={FileText} title="Description" />
          <TextArea label="Description" value={form.description} onChange={(value) => patch("description", value)} placeholder="Describe what this category covers..." rows={5} />
        </section>
        <div className="two-column">
          <section className="form-section">
            <SectionHeader icon={Palette} title="Accent Color" />
            <div className="color-input-row">
              <input type="color" value={form.accentColor} onChange={(event) => patch("accentColor", event.target.value)} />
              <Field label="Hex" value={form.accentColor.replace("#", "")} onChange={(value) => patch("accentColor", `#${value.replace("#", "").slice(0, 6)}`)} />
            </div>
            <ColorDots value={form.accentColor} onChange={(value) => patch("accentColor", value)} />
          </section>
          <section className="form-section">
            <SectionHeader icon={CheckCircle2} title="Status" />
            <Segmented value={form.status} onChange={(value) => patch("status", value)} options={["Active", "Inactive", "Draft"]} />
            <div className={form.status === "Active" ? "status-callout" : "status-callout inactive"}>
              <span />
              {form.status === "Active" ? "Visible to all learners" : "Hidden until ready"}
            </div>
          </section>
        </div>
        <div className="sticky-actions">
          <span className="autosave"><Save size={16} /> Auto-saved locally</span>
          <button className="secondary" onClick={onCancel}>Cancel</button>
          <button className="outline" onClick={() => onSave({ ...form, status: "Draft" })}>Save as Draft</button>
          <button className="primary" disabled={!form.name || duplicate} onClick={() => onSave(form)}>
            <Plus size={18} /> {isEdit ? "Update Category" : "Create Category"}
          </button>
        </div>
      </div>
      <aside className="preview-column">
        <h3>Live Preview</h3>
        <CategoryPreview category={{ ...form, name: form.name || "Web Development", description: form.description || "Learn the fundamentals of building modern web applications using industry-standard tools and best practices.", courses: form.courses || 0, learners: form.learners || 0 }} />
        <FieldSummary items={[
          ["Name", form.name || "Not filled", Boolean(form.name)],
          ["Icon", form.iconType === "emoji" ? "Emoji" : "Image", Boolean(form.iconType === "emoji" ? form.icon : form.imageUrl)],
          ["Description", form.description ? "Filled" : "Not filled", Boolean(form.description)],
          ["Color", form.accentColor, Boolean(form.accentColor)],
          ["Status", form.status, Boolean(form.status)]
        ]} />
        <section className="tip-card">
          <strong>Quick Tips</strong>
          <p>Use a clear descriptive name.</p>
          <p>Pick a brand-aligned accent color.</p>
          <p>Keep inactive until content is ready.</p>
        </section>
        <div className="preview-progress">
          <span style={{ width: `${(completed / 5) * 100}%` }} />
        </div>
      </aside>
    </section>
  );
}
