import { Palette, Plus } from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import Field from "../../components/common/Field.jsx";
import TextArea from "../../components/common/TextArea.jsx";
import Toggle from "../../components/common/Toggle.jsx";
import AccentColorControl from "../../components/common/AccentColorControl.jsx";
import { brand } from "../../utils/data.js";
import { createSlug } from "../../utils/slug.utils.js";
import { getLearningIcon } from "../../utils/learningIcon.utils.js";

export default function SubmoduleEditor({ form, setForm, onSave, disabled }) {
  const SubmoduleIcon = getLearningIcon(form.title, form.description, "lesson");
  return (
    <section className="form-section compact-form top-accent-teal">
      <SectionHeader icon={Plus} title={form.id ? "Edit Submodule" : "Add Submodule"} />
      <div className="editor-icon-context">
        <span style={{ "--editor-accent": form.accentColor || brand.teal }}><SubmoduleIcon /></span>
        <p>The submodule icon updates automatically from its learning topic.</p>
      </div>
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
      <div className="action-row"><button className="primary" disabled={disabled || !form.title} onClick={onSave}><Plus size={18} /> Save Submodule</button></div>
    </section>
  );
}
