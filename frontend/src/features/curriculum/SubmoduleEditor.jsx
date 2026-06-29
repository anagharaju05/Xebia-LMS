import { Palette, Plus } from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import Field from "../../components/common/Field.jsx";
import TextArea from "../../components/common/TextArea.jsx";
import Toggle from "../../components/common/Toggle.jsx";
import AccentColorControl from "../../components/common/AccentColorControl.jsx";
import { brand } from "../../utils/data.js";
import { createSlug } from "../../utils/slug.utils.js";

export default function SubmoduleEditor({ form, setForm, onSave, disabled }) {
  return (
    <section className="form-section compact-form top-accent-teal">
      <SectionHeader icon={Plus} title={form.id ? "Edit Submodule" : "Add Submodule"} />
      <div className="field-grid">
        <Field label="Title" required value={form.title} onChange={(value) => setForm({ ...form, title: value, slug: form.slug || createSlug(value) })} />
        <Field label="Slug" value={form.slug} onChange={(value) => setForm({ ...form, slug: createSlug(value) })} />
      </div>
      <TextArea label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} rows={3} />
      <SectionHeader icon={Palette} title="Accent Color" />
      <AccentColorControl value={form.accentColor || brand.teal} onChange={(value) => setForm({ ...form, accentColor: value })} />
      <div className="field-grid">
        <Field label="Submodule Order" type="number" value={form.order} onChange={(value) => setForm({ ...form, order: Number(value) })} />
        <Toggle label="Active" checked={form.isActive} onChange={(value) => setForm({ ...form, isActive: value })} />
      </div>
      <details className="seo-details" open>
        <summary>SEO & Metadata <span>Optional</span></summary>
        <div className="field-grid">
          <Field label="Meta Title" value={form.metaTitle || ""} onChange={(value) => setForm({ ...form, metaTitle: value })} />
          <Field label="Canonical URL" value={form.canonicalUrl || ""} onChange={(value) => setForm({ ...form, canonicalUrl: value })} />
          <TextArea label="Meta Description" value={form.metaDescription || ""} onChange={(value) => setForm({ ...form, metaDescription: value })} rows={3} />
          <Field label="OG Title" value={form.ogTitle || ""} onChange={(value) => setForm({ ...form, ogTitle: value })} />
          <Field label="OG Image URL" value={form.ogImage || ""} onChange={(value) => setForm({ ...form, ogImage: value })} />
        </div>
      </details>
      <div className="action-row">
        <button className="primary" disabled={disabled || !form.title} onClick={onSave}><Plus size={18} /> Save Submodule</button>
      </div>
    </section>
  );
}
