import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CircleGauge,
  Code2,
  FileText,
  Globe2,
  Image as ImageIcon,
  ListPlus,
  Palette,
  Save,
  Search,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import PageTitle from "../../components/common/PageTitle.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import Field from "../../components/common/Field.jsx";
import TextArea from "../../components/common/TextArea.jsx";
import SelectField from "../../components/common/SelectField.jsx";
import Toggle from "../../components/common/Toggle.jsx";
import Segmented from "../../components/common/Segmented.jsx";
import UploadControl from "../../components/common/UploadControl.jsx";
import AccentColorControl from "../../components/common/AccentColorControl.jsx";
import CoursePreview from "../../components/preview/CoursePreview.jsx";
import FieldSummary from "../../components/preview/FieldSummary.jsx";
import EmojiPicker from "../../components/common/EmojiPicker.jsx";
import { brand, levels } from "../../utils/data.js";
import { createSlug } from "../../utils/slug.utils.js";
import {
  calculateSeoScore,
  getCourseFormData,
  mapFormToCourse
} from "./course.helpers.js";

export default function CourseEditor({ initial, categories, onCancel, onSave }) {
  const [tab, setTab] = useState("basic");
  const [form, setForm] = useState(getCourseFormData(initial, categories));
  const isEdit = Boolean(initial?.id);
  const category = categories.find((item) => item.id === form.categoryId);
  const score = calculateSeoScore(form);

  function patch(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "title" && !isEdit ? { slug: createSlug(value), metaTitle: value ? `${value} | Xebia Learning` : "" } : {})
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
          title={tab === "basic" ? "Create Course - Basic Details" : "Create Course - SEO & Meta"}
          subtitle={tab === "basic" ? "Core information, media, content builders and course settings." : "SEO core, Open Graph, Twitter/X, structured data and analytics fields."}
          action={<Segmented value={tab} onChange={setTab} options={[["basic", "Basic Details"], ["seo", "SEO & Meta"]]} compact />}
        />
        {tab === "basic" ? (
          <>
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
              <TextArea label="Description" value={form.description} onChange={(value) => patch("description", value)} placeholder="Full course description - markdown supported..." rows={6} />
            </section>
            <section className="form-section top-accent-orange">
              <SectionHeader icon={ImageIcon} title="Media" />
              <div className="field-grid">
                <EmojiPicker label="Icon" value={form.icon} onChange={(value) => patch("icon", value)} placeholder="Select course icon..." />
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
              <TextArea label="Course Highlights" value={form.courseHighlights} onChange={(value) => patch("courseHighlights", value)} placeholder="Key highlights shown on the course landing page..." rows={3} />
              <TextArea label="Career Opportunities" value={form.careerOpportunities} onChange={(value) => patch("careerOpportunities", value)} placeholder="Jobs and career paths this course prepares for..." rows={3} />
            </section>
            <section className="form-section top-accent-purple">
              <SectionHeader icon={ShieldCheck} title="Course Flags" />
              <div className="toggle-grid">
                <Toggle label="isActive" description="Makes this course visible to admins" checked={form.isActive} onChange={(value) => patch("isActive", value)} />
                <Toggle label="isPublished" description="Makes this course live for learners" checked={form.isPublished} onChange={(value) => patch("isPublished", value)} />
                <Toggle label="isFeatured" description="Highlights course on homepage" checked={form.isFeatured} onChange={(value) => patch("isFeatured", value)} />
                <Toggle label="allowIndexing" description="Allows search engines to crawl this page" checked={form.allowIndexing} onChange={(value) => patch("allowIndexing", value)} />
                <Toggle label="showInSearch" description="Shows course in platform search results" checked={form.showInSearch} onChange={(value) => patch("showInSearch", value)} />
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="form-section top-accent-teal">
              <SectionHeader icon={Search} title="SEO Core" />
              <Field label="Meta Title" value={form.metaTitle} onChange={(value) => patch("metaTitle", value)} placeholder="Spring Boot Masterclass | Xebia Learning" max={70} />
              <TextArea label="Meta Description" value={form.metaDescription} onChange={(value) => patch("metaDescription", value)} placeholder="Appears in Google search snippets..." rows={3} max={320} />
              <div className="field-grid">
                <Field label="Canonical URL" value={form.canonicalUrl} onChange={(value) => patch("canonicalUrl", value)} placeholder="https://xebia.com/courses/..." />
                <SelectField label="Robots" value={form.robots} onChange={(value) => patch("robots", value)} options={["index, follow", "noindex, nofollow", "index, nofollow"]} />
                <Field label="Author" value={form.author} onChange={(value) => patch("author", value)} placeholder="e.g. Ankit Sharma" />
                <Field label="SEO Category" value={form.seoCategory} onChange={(value) => patch("seoCategory", value)} placeholder="Backend Development" />
              </div>
              <div className="field-grid">
                <TextArea label="Meta Keywords" value={form.metaKeywords} onChange={(value) => patch("metaKeywords", value)} rows={3} placeholder="spring boot, java, rest api..." />
                <TextArea label="SEO Tags" value={form.seoTags} onChange={(value) => patch("seoTags", value)} rows={3} placeholder="backend, java, spring..." />
              </div>
            </section>
            <section className="form-section top-accent-purple">
              <SectionHeader icon={Sparkles} title="Advanced SEO" />
              <Field label="Primary Keyword" value={form.primaryKeyword} onChange={(value) => patch("primaryKeyword", value)} placeholder="spring boot course" />
              <div className="field-grid">
                <TextArea label="Secondary Keywords" value={form.secondaryKeywords} onChange={(value) => patch("secondaryKeywords", value)} rows={3} />
                <TextArea label="Focus Keywords" value={form.focusKeywords} onChange={(value) => patch("focusKeywords", value)} rows={3} />
                <TextArea label="Semantic Keywords" value={form.semanticKeywords} onChange={(value) => patch("semanticKeywords", value)} rows={3} />
                <TextArea label="Search Synonyms" value={form.relatedTopics} onChange={(value) => patch("relatedTopics", value)} rows={3} />
              </div>
              <TextArea label="Search Intent" value={form.searchIntent} onChange={(value) => patch("searchIntent", value)} rows={3} placeholder="informational, transactional..." />
            </section>
            <section className="form-section top-accent-orange">
              <SectionHeader icon={Globe2} title="Open Graph" />
              <div className="field-grid">
                <Field label="OG Title" value={form.ogTitle} onChange={(value) => patch("ogTitle", value)} />
                <Field label="OG Type" value="website" onChange={() => {}} />
                <TextArea label="OG Description" value={form.ogDescription} onChange={(value) => patch("ogDescription", value)} rows={3} />
                <div className="field-stack">
                  <Field label="OG Image" value={form.ogImage} onChange={(value) => patch("ogImage", value)} />
                  <UploadControl onFile={(value) => patch("ogImage", value)} />
                </div>
              </div>
            </section>
            <section className="form-section top-accent-purple">
              <SectionHeader icon={Code2} title="Structured Data & Scripts" />
              <TextArea dark label="Schema Markup" value={`{"@context":"https://schema.org","@type":"Course","name":"${form.title || "Course"}"}`} onChange={() => {}} rows={4} />
              <TextArea label="FAQ Content" value={form.faqContent} onChange={(value) => patch("faqContent", value)} rows={4} placeholder="Q: Who is this course for? A: ..." />
              <TextArea dark label="Custom Head Script" value={form.customHeadScript} onChange={(value) => patch("customHeadScript", value)} rows={4} placeholder="<!-- e.g. Google Tag Manager snippet -->" />
              <TextArea dark label="Custom Body Script" value={form.customBodyScript} onChange={(value) => patch("customBodyScript", value)} rows={4} placeholder="<!-- e.g. chat widget script -->" />
            </section>
          </>
        )}
        <div className="sticky-actions">
          <button className="ghost icon-text" onClick={() => (tab === "seo" ? setTab("basic") : onCancel())}>
            <ArrowLeft size={16} /> {tab === "seo" ? "Back: Basic Details" : "Back to Courses"}
          </button>
          <button className="secondary" onClick={onCancel}>Cancel</button>
          <button className="outline" onClick={() => onSave({ ...mapFormToCourse(form), isPublished: false })}>Save as Draft</button>
          {tab === "basic" ? (
            <button className="primary" onClick={() => setTab("seo")}>Next SEO & Meta <ArrowRight size={18} /></button>
          ) : (
            <button className="primary" disabled={!form.title} onClick={submit}><Save size={18} /> Save & Publish</button>
          )}
        </div>
      </div>
      <aside className="preview-column">
        <h3>{tab === "basic" ? "Card Preview" : "SEO Score"}</h3>
        {tab === "basic" ? (
          <CoursePreview course={{ ...mapFormToCourse(form), title: form.title || "Spring Boot Masterclass", shortDescription: form.shortDescription || "Master Spring Boot and build production-ready REST APIs from scratch." }} category={category} moduleCount={0} />
        ) : (
          <>
            <div className="seo-score">
              <CircleGauge size={42} />
              <strong>{score}</strong>
              <span>{score > 70 ? "Good" : "Needs work"}</span>
            </div>
            <FieldSummary items={[
              ["metaTitle", form.metaTitle || "Missing", Boolean(form.metaTitle)],
              ["metaDescription", form.metaDescription || "Missing", Boolean(form.metaDescription)],
              ["primaryKeyword", form.primaryKeyword || "Missing", Boolean(form.primaryKeyword)],
              ["canonicalUrl", form.canonicalUrl || "Optional", true],
              ["ogImage", form.ogImage || "Missing", Boolean(form.ogImage)]
            ]} />
            <section className="serp-card">
              <span>xebia.com â€º courses â€º {form.slug || "course"}</span>
              <strong>{form.metaTitle || form.title || "Course title"}</strong>
              <p>{form.metaDescription || "Meta description will appear here..."}</p>
            </section>
          </>
        )}
      </aside>
    </section>
  );
}
