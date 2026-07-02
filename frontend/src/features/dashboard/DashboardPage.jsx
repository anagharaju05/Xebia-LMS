import {
  ArrowRight,
  BookOpen,
  Boxes,
  CheckCircle2,
  Layers3,
  LayoutDashboard,
  ListPlus,
  Tags,
  TrendingUp,
  Users
} from "lucide-react";
import PageTitle from "../../components/common/PageTitle.jsx";
import Metric from "../../components/common/Metric.jsx";
import CategoryThumb from "../../components/common/CategoryThumb.jsx";
import { blockTypes } from "../../utils/data.js";
import { useStudentManagement } from "../students/useStudentManagement.js";

export default function DashboardPage({ store, stats, go }) {
  const studentStore = useStudentManagement();
  const totalStudents = studentStore.management.students.length;

  const inactiveCategories = store.categories.length - stats.activeCategories;
  const draftCourses = store.courses.filter((course) => !course.isPublished).length;
  const publishedRate = store.courses.length ? Math.round((stats.publishedCourses / store.courses.length) * 100) : 0;
  const curriculumDepth = stats.modules ? (stats.submodules / stats.modules).toFixed(1) : "0";
  const contentCounts = blockTypes.map((type) => ({
    type,
    count: store.contentBlocks.filter((block) => block.type === type).length
  })).filter((item) => item.count > 0);
  const maxContent = Math.max(1, ...contentCounts.map((item) => item.count));
  
  const categoryCourseCounts = {};
  store.courses.forEach(c => {
    categoryCourseCounts[c.categoryId] = (categoryCourseCounts[c.categoryId] || 0) + 1;
  });
  const topCategories = [...store.categories].map(cat => ({
    ...cat,
    courses: categoryCourseCounts[cat.id] || 0
  })).sort((a, b) => b.courses - a.courses).slice(0, 4);

  const statCards = [
    { label: "Published Rate", value: `${publishedRate}%`, icon: TrendingUp, tone: "teal", help: `${stats.publishedCourses} of ${store.courses.length} courses live` },
    { label: "Learner Reach", value: totalStudents.toLocaleString(), icon: Users, tone: "purple", help: "Registered platform learners" },
    { label: "Curriculum Depth", value: curriculumDepth, icon: Layers3, tone: "orange", help: "Submodules per module" },
    { label: "Active Blocks", value: stats.activeBlocks, icon: Boxes, tone: "teal", help: `${store.contentBlocks.length} total content items` }
  ];

  return (
    <section className="page dashboard-page">
      <PageTitle
        icon={LayoutDashboard}
        title="Admin Dashboard"
        subtitle="Track catalog health, curriculum depth, content mix and publishing progress."
      />
      <div className="dashboard-masthead">
        <div className="dashboard-hero-stat">
          <span>Catalog Health</span>
          <strong>{publishedRate}%</strong>
          <p>{stats.activeCourses} active courses, {draftCourses} drafts, {inactiveCategories} inactive categories.</p>
          <div className="hero-progress"><span style={{ width: `${publishedRate}%` }} /></div>
        </div>
        <div className="dashboard-mini-grid">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <article className={`dashboard-stat ${card.tone}`} key={card.label}>
                <Icon size={24} />
                <div>
                  <strong>{card.value}</strong>
                  <span>{card.label}</span>
                  <p>{card.help}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <div className="dashboard-analytics-grid">
        <section className="dashboard-panel">
          <div className="panel-title">
            <h3>Operational Snapshot</h3>
            <span>Live local data</span>
          </div>
          <div className="snapshot-grid">
            <Metric icon={Tags} value={store.categories.length} label="Categories" />
            <Metric icon={BookOpen} value={store.courses.length} label="Courses" />
            <Metric icon={Layers3} value={stats.modules} label="Modules" />
            <Metric icon={ListPlus} value={stats.submodules} label="Submodules" />
          </div>
        </section>
        <section className="dashboard-panel">
          <div className="panel-title">
            <h3>Content Mix</h3>
            <span>{store.contentBlocks.length} blocks</span>
          </div>
          <div className="mix-bars">
            {contentCounts.map((item) => (
              <div className="mix-row" key={item.type}>
                <span>{item.type}</span>
                <div><i style={{ width: `${(item.count / maxContent) * 100}%` }} /></div>
                <b>{item.count}</b>
              </div>
            ))}
          </div>
        </section>
        <section className="dashboard-panel">
          <div className="panel-title">
            <h3>Top Categories</h3>
            <span>By course count</span>
          </div>
          <div className="category-rank-list">
            {topCategories.map((category, index) => (
              <button key={category.id} onClick={() => go("/categories")} style={{ "--accent": category.accentColor }}>
                <span>{index + 1}</span>
                <CategoryThumb category={category} />
                <strong>{category.name}</strong>
                <em>{category.courses} courses</em>
              </button>
            ))}
          </div>
        </section>
        <section className="dashboard-panel quick-actions-panel">
          <div className="panel-title">
            <h3>Admin Shortcuts</h3>
            <span>Create and review</span>
          </div>
          {[
            { label: "Manage Categories", icon: Tags, view: "/categories" },
            { label: "Build Courses", icon: BookOpen, view: "/courses" },
            { label: "Review Content", icon: Boxes, view: "/content" },
            { label: "Review Students", icon: Users, view: "/students" }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button className="dashboard-shortcut" key={item.label} onClick={() => go(item.view)}>
                <Icon size={19} />
                <span>{item.label}</span>
                <ArrowRight size={16} />
              </button>
            );
          })}
        </section>
        <section className="dashboard-panel recent-panel">
          <div className="panel-title">
            <h3>Recent Admin Activity</h3>
            <span>Stored locally in this browser</span>
          </div>
          <div className="activity-list">
            {store.audit.map((item) => (
              <div key={item.id} className="activity-row">
                <CheckCircle2 size={18} />
                <span>{item.label}</span>
                <strong>{item.target}</strong>
                <em>{item.time}</em>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
