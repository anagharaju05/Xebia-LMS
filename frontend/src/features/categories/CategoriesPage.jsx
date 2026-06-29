import { useMemo, useState } from "react";
import { Archive, BookOpen, CheckCircle2, ListFilter, Plus, Tags } from "lucide-react";
import PageTitle from "../../components/common/PageTitle.jsx";
import Metric from "../../components/common/Metric.jsx";
import Toolbar from "../../components/common/Toolbar.jsx";
import SearchBox from "../../components/common/SearchBox.jsx";
import Select from "../../components/common/Select.jsx";
import CategoryCard from "../../components/cards/CategoryCard.jsx";
import { filterAndSortCategories } from "./category.helpers.js";

export default function CategoriesPage({ store, onCreate, onEdit, onDelete }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("name");
  const categories = useMemo(
    () => filterAndSortCategories(store.categories, query, status, sort),
    [store.categories, query, status, sort]
  );
  const active = store.categories.filter((item) => item.status === "Active").length;
  const inactive = store.categories.filter((item) => item.status !== "Active").length;

  return (
    <section className="page">
      <PageTitle icon={Tags} title="Categories" subtitle="Manage all learning categories on the platform." action={<button className="primary" onClick={onCreate}><Plus size={18} /> Create Category</button>} />
      <div className="stat-grid four">
        <Metric icon={Tags} value={store.categories.length} label="Total Categories" />
        <Metric icon={CheckCircle2} value={active} label="Active" tone="teal" />
        <Metric icon={Archive} value={inactive} label="Inactive / Draft" tone="orange" />
        <Metric icon={BookOpen} value={store.courses.length} label="Total Courses" />
      </div>
      <Toolbar>
        <SearchBox value={query} onChange={setQuery} placeholder="Search categories..." />
        <Select value={status} onChange={setStatus} options={["All", "Active", "Inactive", "Draft"]} icon={ListFilter} />
        <Select value={sort} onChange={setSort} options={[["name", "Sort: Name A-Z"], ["courses", "Sort: Courses"], ["learners", "Sort: Learners"]]} />
        <span className="muted-count">{categories.length} categories</span>
      </Toolbar>
      <div className="card-grid">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} courses={store.courses} onEdit={() => onEdit(category.id)} onDelete={() => onDelete(category.id)} />
        ))}
      </div>
    </section>
  );
}
