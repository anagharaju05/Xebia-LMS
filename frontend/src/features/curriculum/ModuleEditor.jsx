import { Palette, Pencil, Save } from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import Field from "../../components/common/Field.jsx";
import TextArea from "../../components/common/TextArea.jsx";
import Toggle from "../../components/common/Toggle.jsx";
import AccentColorControl from "../../components/common/AccentColorControl.jsx";
import { brand } from "../../utils/data.js";
import { createSlug } from "../../utils/slug.utils.js";

export default function ModuleEditor({ form, setForm, onSave }) {
  return (
    <section className="form-section compact-form top-accent-teal">
      <SectionHeader icon={Pencil} title={form.id ? "Edit Module" : "Create Module"} />
      <Field label="Title" required value={form.title} onChange={(value) => setForm({ ...form, title: value, slug: form.slug || createSlug(value) })} />
      <TextArea label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} rows={3} />
      <SectionHeader icon={Palette} title="Accent Color" />
      <AccentColorControl value={form.accentColor || brand.velvet} onChange={(value) => setForm({ ...form, accentColor: value })} />
      <div className="field-grid">
        <Field label="Module Order" type="number" value={form.order} onChange={(value) => setForm({ ...form, order: Number(value) })} />
        <Toggle label="Active" checked={form.isActive} onChange={(value) => setForm({ ...form, isActive: value })} />
      </div>
      <div className="action-row">
        <button className="primary" disabled={!form.title} onClick={onSave}><Save size={18} /> Save Module</button>
      </div>
    </section>
  );
}
