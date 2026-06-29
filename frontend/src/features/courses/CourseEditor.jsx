import { useState } from "react";
import { ArrowLeft, BookOpen, FileText, Image as ImageIcon, ListPlus, Palette, Save, ShieldCheck } from "lucide-react";
import PageTitle from "../../components/common/PageTitle.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import Field from "../../components/common/Field.jsx";
import TextArea from "../../components/common/TextArea.jsx";
import SelectField from "../../components/common/SelectField.jsx";
import Toggle from "../../components/common/Toggle.jsx";
import UploadControl from "../../components/common/UploadControl.jsx";
import AccentColorControl from "../../components/common/AccentColorControl.jsx";
import CoursePreview from "../../components/preview/CoursePreview.jsx";
import FieldSummary from "../../components/preview/FieldSummary.jsx";
import { brand, levels } from "../../utils/data.js";
import { createSlug } from "../../utils/slug.utils.js";
import { getCourseFormData, mapFormToCourse } from "./course.helpers.js";

export default function CourseEditor({ initial, categories, onCancel, onSave }) {
  const [form, setForm] = useState(getCourseFormData(initial, categories));
  const isEdit = Boolean(initial?.id);
  const category = categories.find((item) => item.id === form.categoryId);

  function patch(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "title" && !isEdit ? { slug: createSlug(value) } : {})
    }));
  }

  function submit() {
    onSave(mapFormToCourse(form));
  }

  return (
    <section className="page split-page wide-preview">
      <div className="work-column">
        <PageTitle
          icon={BookOpen}
          title={isEdit ? "Edit Course" : "Create Course"}
          subtitle="Core information, media, content builders and course settings."
        />
        <section className="form-section top-accent-purple">
          <SectionHeader icon={BookOpen} title="Course Identity" />
          <Field label="Title" required value={form.title} onChange={(value) => patch("title", value)} placeholder="e.g. Spring Boot Masterclass" max={200} />
          <Field label="Slug" required value={form.slug} onChange={(value) => patch("slug", createSlug(value))} placeholder="spring-boot-masterclass" />
          <div className="field-grid">
            <SelectField label="Category" value={form.categoryId} onChange={(value) => patch("categoryId", value)} options={categories.map((item) => [item.id, item.name])} />
            <SelectField label="Level" value={form.level} onChange={(value) => patch("level", value)} options={levels} />
            <Field label="Language" value={form.language} onChange={(value) => patch("language", value)} placeholder="English" />
            <Field label="Duration" value={form.duration} onChange={(value) => patch("duration", value)} placeholder="e.g. 18 hrs, 6 weeks" />
          </div>
        </section>
        <section className="form-section top-accent-teal">
          <SectionHeader icon={Palette} title="Accent Color" />
          <AccentColorControl value={form.accentColor || category?.accentColor || brand.velvet} onChange={(value) => patch("accentColor", value)} />
        </section>
        <section className="form-section top-accent-purple">
          <SectionHeader icon={FileText} title="Descriptions" />
          <TextArea label="Short Description" value={form.shortDescription} onChange={(value) => patch("shortDescription", value)} placeholder="A brief summary shown in course cards and search results..." rows={3} />
          <TextArea label="Description" value={form.description} onChange={(value) => patch("description", value)} placeholder="Full course description..." rows={5} />
        </section>
        <section className="form-section top-accent-orange">
          <SectionHeader icon={ImageIcon} title="Media" />
          <p className="field-note">A matching course icon is selected automatically from the title and description.</p>
          <div className="field-grid">
            <div className="field-stack">
              <Field label="Thumbnail" value={form.thumbnail} onChange={(value) => patch("thumbnail", value)} placeholder="https://cdn.example.com/thumb.jpg" />
              <UploadControl onFile={(value) => patch("thumbnail", value)} />
            </div>
            <div className="field-stack">
              <Field label="Banner Image" value={form.bannerImage} onChange={(value) => patch("bannerImage", value)} placeholder="Banner image URL..." />
              <UploadControl onFile={(value) => patch("bannerImage", value)} />
            </div>
            <Field label="YouTube Video URL" value={form.youtubeVideoUrl} onChange={(value) => patch("youtubeVideoUrl", value)} placeholder="https://youtube.com/watch?v=..." />
            <Field label="Preview Video URL" value={form.previewVideoUrl} onChange={(value) => patch("previewVideoUrl", value)} placeholder="Preview / trailer video URL..." />
          </div>
        </section>
        <section className="form-section top-accent-teal">
          <SectionHeader icon={ListPlus} title="Course Content Builders" />
          <TextArea label="Learning Outcomes" value={form.learningOutcomes} onChange={(value) => patch("learningOutcomes", value)} placeholder="One outcome per line..." rows={4} />
          <TextArea label="Prerequisites" value={form.prerequisites} onChange={(value) => patch("prerequisites", value)} placeholder="One prerequisite per line..." rows={4} />
          <TextArea label="Target Audience" value={form.targetAudience} onChange={(value) => patch("targetAudience", value)} placeholder="One audience segment per line..." rows={4} />
          <TextArea label="Course Highlights" value={form.courseHighlights} onChange={(value) => patch("courseHighlights", value)} placeholder="Key highlights..." rows={3} />
          <TextArea label="Career Opportunities" value={form.careerOpportunities} onChange={(value) => patch("careerOpportunities", value)} placeholder="Jobs and career paths..." rows={3} />
        </section>
        <section className="form-section top-accent-purple">
          <SectionHeader icon={ShieldCheck} title="Course Flags" />
          <div className="toggle-grid">
            <Toggle label="isActive" description="Makes this course visible to admins" checked={form.isActive} onChange={(value) => patch("isActive", value)} />
            <Toggle label="isPublished" description="Makes this course live for learners" checked={form.isPublished} onChange={(value) => patch("isPublished", value)} />
            <Toggle label="isFeatured" description="Highlights course on homepage" checked={form.isFeatured} onChange={(value) => patch("isFeatured", value)} />
            <Toggle label="showInSearch" description="Shows course in platform search results" checked={form.showInSearch} onChange={(value) => patch("showInSearch", value)} />
          </div>
        </section>
        <div className="sticky-actions">
          <button className="ghost icon-text" onClick={onCancel}><ArrowLeft size={16} /> Back to Courses</button>
          <button className="secondary" onClick={onCancel}>Cancel</button>
          <button className="outline" onClick={() => onSave({ ...mapFormToCourse(form), isPublished: false })}>Save as Draft</button>
          <button className="primary" disabled={!form.title} onClick={submit}><Save size={18} /> Save Course</button>
        </div>
      </div>
      <aside className="preview-column">
        <h3>Card Preview</h3>
        <CoursePreview course={{ ...mapFormToCourse(form), title: form.title || "Spring Boot Masterclass", shortDescription: form.shortDescription || "Master Spring Boot and build production-ready REST APIs from scratch." }} category={category} moduleCount={0} />
        <FieldSummary items={[
          ["Title", form.title || "Not filled", Boolean(form.title)],
          ["Category", category?.name || "Not selected", Boolean(category)],
          ["Level", form.level, Boolean(form.level)],
          ["Thumbnail", form.thumbnail ? "Uploaded" : "Automatic icon", true],
          ["Status", form.isPublished ? "Published" : "Draft", true]
        ]} />
      </aside>
    </section>
  );
}
