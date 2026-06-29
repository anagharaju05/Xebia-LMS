import { useState, useEffect } from "react";
import { Boxes } from "lucide-react";
import PageTitle from "../../components/common/PageTitle.jsx";
import Toolbar from "../../components/common/Toolbar.jsx";
import SearchBox from "../../components/common/SearchBox.jsx";
import Select from "../../components/common/Select.jsx";
import ContentBlockEditor from "./ContentBlockEditor.jsx";
import { blockTypes } from "../../utils/data.js";
import { filterContentBlocks } from "./content.helpers.js";

export default function ContentLibraryPage({ store, upsert, removeContentBlock, toggleEntity }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [submoduleId, setSubmoduleId] = useState(store.submodules[0]?.id || "");
  const blocks = filterContentBlocks(store.contentBlocks, query, type);

  useEffect(() => {
    if (!submoduleId && store.submodules.length > 0) {
      setSubmoduleId(store.submodules[0].id);
    }
  }, [store.submodules, submoduleId]);

  return (
    <section className="page">
      <PageTitle icon={Boxes} title="Content Blocks" subtitle="CRUD library for LMS content items: notes, PDF, PPT, comparison tables, video and more." />
      <Toolbar>
        <SearchBox value={query} onChange={setQuery} placeholder="Search content blocks..." />
        <Select value={type} onChange={setType} options={["All", ...blockTypes]} />
        <Select value={submoduleId} onChange={setSubmoduleId} options={store.submodules.map((item) => [item.id, item.title])} />
        <span className="muted-count">{blocks.length} blocks</span>
      </Toolbar>
      <ContentBlockEditor
        store={{ ...store, contentBlocks: blocks, submodules: store.submodules }}
        selectedSubmoduleId={submoduleId}
        upsert={upsert}
        removeContentBlock={removeContentBlock}
        toggleEntity={toggleEntity}
      />
    </section>
  );
}
