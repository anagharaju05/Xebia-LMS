import { useEffect, useState } from "react";
import { STORAGE_KEY } from "../app/constants.js";
import { seedState } from "../utils/data.js";
import { createId } from "../utils/id.utils.js";
import { createAuditEntry, prependAuditEntry } from "../services/audit.service.js";
import { api } from "../services/api.js";
import { readStorageValue, writeStorageValue } from "../services/storage.service.js";

const EXTRA_KEY = "lms_extra_fields";
const API_ENABLED = import.meta.env.VITE_ENABLE_API === "true";

function toUUID(str) {
  if (!str) return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;
  let hashStr = "";
  for (let i = 0; i < 32; i++) {
    const charCode = str.charCodeAt(i % str.length) || 0;
    const hexVal = ((charCode * (i + 1)) % 16).toString(16);
    hashStr += hexVal;
  }
  return `${hashStr.slice(0, 8)}-${hashStr.slice(8, 12)}-4${hashStr.slice(13, 16)}-a${hashStr.slice(17, 20)}-${hashStr.slice(20, 32)}`;
}

function capitalizeWord(word) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function getRecordLabel(record) {
  return record.title || record.name || record.text || record.type;
}

export function useLmsStore(showToast) {
  const [store, setStore] = useState(() => readStorageValue(STORAGE_KEY, seedState));
  const [isOffline, setIsOffline] = useState(!API_ENABLED);

  // Sync to local storage as offline backup
  useEffect(() => {
    writeStorageValue(STORAGE_KEY, store);
  }, [store]);

  // Initial load
  useEffect(() => {
    if (!API_ENABLED) return;
    async function loadData() {
      try {
        await syncAndMergeDatabase();
        setIsOffline(false);
      } catch (err) {
        console.warn("Failed to load database data, running in offline mode:", err);
        setIsOffline(true);
      }
    }
    loadData();
  }, []);

  async function syncAndMergeDatabase() {
    let isStudent = false;
    try {
      const sessionStr = localStorage.getItem("xebia-lms-auth-session-v1");
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session.role?.toUpperCase() === "STUDENT") {
          isStudent = true;
        }
      }
    } catch {}

    if (isStudent) {
      return;
    }

    let pgCategories = await api.get("/api/categories");
    let pgCourses = await api.get("/api/courses");
    let pgModules = await api.get("/api/modules/course/all");
    let pgSubmodules = await api.get("/api/submodules/module/all");
    let pgContents = await api.get("/api/content");

    const existingCatIds = new Set(pgCategories.map(c => c.id));
    const existingCourseIds = new Set(pgCourses.map(c => c.id));
    const existingModIds = new Set(pgModules.map(m => m.id));
    const existingSubIds = new Set(pgSubmodules.map(s => s.id));
    const existingContentIds = new Set(pgContents.map(c => c.id));

    let seededNew = false;

    // Seed missing categories
    for (const cat of seedState.categories) {
      const uuid = toUUID(cat.id);
      if (!existingCatIds.has(uuid)) {
        const payload = {
          id: uuid,
          name: cat.name,
          description: cat.description || "",
          status: cat.status === "Active" ? "ACTIVE" : "INACTIVE",
          parentCategoryId: null,
          metadata: JSON.stringify(cat)
        };
        await api.post("/api/categories", payload).catch(console.error);
        seededNew = true;
      }
    }

    // Seed missing courses
    for (const course of seedState.courses) {
      const uuid = toUUID(course.id);
      if (!existingCourseIds.has(uuid)) {
        const durationMinutes = parseInt(course.duration) || 0;
        const difficulty = (course.level || "Beginner").toUpperCase();
        const status = course.status === "Active" ? "PUBLISHED" : "DRAFT";
        const payload = {
          id: uuid,
          categoryId: toUUID(course.categoryId),
          trainerId: "123e4567-e89b-12d3-a456-426614174000",
          courseCode: course.slug ? course.slug.toUpperCase() : "COURSE-" + course.id.slice(0, 5).toUpperCase(),
          courseName: course.title,
          shortDescription: course.shortDescription || "",
          durationMinutes: durationMinutes,
          difficulty: difficulty === "EXPERT" ? "ADVANCED" : difficulty,
          status: status,
          thumbnailUrl: course.thumbnail || "",
          metadata: JSON.stringify(course)
        };
        await api.post("/api/courses", payload).catch(console.error);
        seededNew = true;
      }
    }

    // Seed missing modules
    for (const mod of seedState.modules) {
      const uuid = toUUID(mod.id);
      if (!existingModIds.has(uuid)) {
        const payload = {
          id: uuid,
          courseId: toUUID(mod.courseId),
          name: mod.title,
          description: mod.description || "",
          position: mod.order || 0,
          metadata: JSON.stringify(mod)
        };
        await api.post("/api/modules", payload).catch(console.error);
        seededNew = true;
      }
    }

    // Seed missing submodules
    for (const sub of seedState.submodules) {
      const uuid = toUUID(sub.id);
      if (!existingSubIds.has(uuid)) {
        const payload = {
          id: uuid,
          moduleId: toUUID(sub.moduleId),
          name: sub.title,
          description: sub.description || "",
          position: sub.order || 0,
          metadata: JSON.stringify(sub)
        };
        await api.post("/api/submodules", payload).catch(console.error);
        seededNew = true;
      }
    }

    // Seed missing content blocks
    const typeMap = {
      "Heading": "NOTE", "Text": "NOTE", "Code": "NOTE", "Callout": "NOTE", "Notes": "NOTE",
      "Video": "VIDEO", "Image": "NOTE", "PDF": "PDF", "PPT": "PPT", "Table": "NOTE"
    };
    for (const block of seedState.contentBlocks) {
      const uuid = toUUID(block.id);
      if (!existingContentIds.has(uuid)) {
        const contentType = typeMap[block.type] || "NOTE";
        const payload = {
          id: uuid,
          submoduleId: toUUID(block.submoduleId),
          contentType: contentType,
          title: block.title || block.type || "Content Block",
          description: block.text || "",
          contentData: JSON.stringify(block),
          durationMinutes: parseInt(block.duration) || 0,
          fileUrl: block.fileUrl || ""
        };
        await api.post("/api/content", payload).catch(console.error);
        seededNew = true;
      }
    }

    if (seededNew) {
      pgCategories = await api.get("/api/categories");
      pgCourses = await api.get("/api/courses");
      pgModules = await api.get("/api/modules/course/all");
      pgSubmodules = await api.get("/api/submodules/module/all");
      pgContents = await api.get("/api/content");
    }

    const categories = pgCategories.map(cat => {
      let extra = {};
      try {
        if (cat.metadata) extra = JSON.parse(cat.metadata);
      } catch {}
      return {
        ...extra,
        id: cat.id,
        name: cat.name,
        description: cat.description || "",
        status: cat.status === "ACTIVE" ? "Active" : "Inactive"
      };
    });

    const courses = pgCourses.map(course => {
      let extra = {};
      try {
        if (course.metadata) extra = JSON.parse(course.metadata);
      } catch {}
        return {
          ...extra,
          id: course.id,
          categoryId: course.categoryId,
          title: course.courseName,
          slug: extra.slug || course.courseCode || course.courseName.toLowerCase().replace(/\s+/g, '-'),
          shortDescription: course.shortDescription || "",
          duration: course.durationMinutes ? `${course.durationMinutes} hrs` : extra.duration || "0 hrs",
          level: course.difficulty ? capitalizeWord(course.difficulty) : extra.level || "Beginner",
          thumbnail: course.thumbnailUrl || extra.thumbnail || "",
          status: course.status === "PUBLISHED" ? "Active" : "Draft",
          isActive: extra.isActive !== undefined ? extra.isActive : course.status === "PUBLISHED",
          isPublished: extra.isPublished !== undefined ? extra.isPublished : course.status === "PUBLISHED"
        };
    });

    const modules = pgModules.map(mod => {
      let extra = {};
      try {
        if (mod.metadata) extra = JSON.parse(mod.metadata);
      } catch {}
      return {
        ...extra,
        id: mod.id,
        courseId: mod.courseId,
        title: mod.name,
        description: mod.description || "",
        order: mod.position || 0,
        isActive: extra.isActive !== undefined ? extra.isActive : true
      };
    });

    const submodules = pgSubmodules.map(sub => {
      let extra = {};
      try {
        if (sub.metadata) extra = JSON.parse(sub.metadata);
      } catch {}
      return {
        ...extra,
        id: sub.id,
        moduleId: sub.moduleId,
        title: sub.name,
        description: sub.description || "",
        order: sub.position || 0,
        isActive: extra.isActive !== undefined ? extra.isActive : true
      };
    });

    const contentBlocks = pgContents.map(c => {
      try {
        if (c.contentData) {
          const data = JSON.parse(c.contentData);
          return { ...data, id: c.id, submoduleId: c.submoduleId, type: data.type || "Text" };
        }
      } catch {}
      return {
        id: c.id,
        submoduleId: c.submoduleId,
        title: c.title,
        text: c.description || "",
        fileUrl: c.fileUrl || "",
        type: "Text",
        order: c.position || 0
      };
    });

    setStore(currentStore => ({
      categories,
      courses,
      modules,
      submodules,
      contentBlocks,
      audit: currentStore.audit
    }));
  }

  function addAudit(label, target) {
    const entry = createAuditEntry(label, target);
    setStore((currentStore) => ({
      ...currentStore,
      audit: prependAuditEntry(currentStore.audit, entry)
    }));
  }

  async function upsertEntity(entity, record, label) {
    const isUpdate = Boolean(record.id);
    const id = record.id || createId(entity.slice(0, 3));
    const finalRecord = { ...record, id };

    // Update locally first (optimistic UI)
    setStore((currentStore) => {
      const exists = currentStore[entity].some((item) => item.id === id);
      const nextItems = exists
        ? currentStore[entity].map((item) => (item.id === id ? finalRecord : item))
        : [finalRecord, ...currentStore[entity]];
      return { ...currentStore, [entity]: nextItems };
    });

    addAudit(label, getRecordLabel(record));
    showToast(label);

    if (isOffline) {
      return id;
    }

    try {
      if (entity === "categories") {
        const payload = {
          id: toUUID(id),
          name: finalRecord.name,
          description: finalRecord.description || "",
          status: finalRecord.status === "Active" ? "ACTIVE" : "INACTIVE",
          parentCategoryId: null,
          metadata: JSON.stringify(finalRecord)
        };
        if (isUpdate) {
          await api.put(`/api/categories/${toUUID(id)}`, payload);
        } else {
          await api.post("/api/categories", payload);
        }
      } else if (entity === "courses") {
        const durationMinutes = parseInt(finalRecord.duration) || 0;
        const difficulty = (finalRecord.level || "Beginner").toUpperCase();
        const status = finalRecord.status === "Active" ? "PUBLISHED" : "DRAFT";
        const payload = {
          id: toUUID(id),
          categoryId: toUUID(finalRecord.categoryId),
          trainerId: "123e4567-e89b-12d3-a456-426614174000",
          courseCode: finalRecord.slug ? finalRecord.slug.toUpperCase() : "COURSE-" + id.slice(0, 5).toUpperCase(),
          courseName: finalRecord.title,
          shortDescription: finalRecord.shortDescription || "",
          durationMinutes: durationMinutes,
          difficulty: difficulty === "EXPERT" ? "ADVANCED" : difficulty,
          status: status,
          thumbnailUrl: finalRecord.thumbnail || "",
          metadata: JSON.stringify(finalRecord)
        };
        if (isUpdate) {
          await api.put(`/api/courses/${toUUID(id)}`, payload);
        } else {
          await api.post("/api/courses", payload);
        }
      } else if (entity === "modules") {
        const payload = {
          id: toUUID(id),
          courseId: toUUID(finalRecord.courseId),
          name: finalRecord.title,
          description: finalRecord.description || "",
          position: finalRecord.order || 0,
          metadata: JSON.stringify(finalRecord)
        };
        if (isUpdate) {
          await api.put(`/api/modules/${toUUID(id)}`, payload);
        } else {
          await api.post("/api/modules", payload);
        }
      } else if (entity === "submodules") {
        const payload = {
          id: toUUID(id),
          moduleId: toUUID(finalRecord.moduleId),
          name: finalRecord.title,
          description: finalRecord.description || "",
          position: finalRecord.order || 0,
          metadata: JSON.stringify(finalRecord)
        };
        if (isUpdate) {
          await api.put(`/api/submodules/${toUUID(id)}`, payload);
        } else {
          await api.post("/api/submodules", payload);
        }
      } else if (entity === "contentBlocks") {
        const typeMap = {
          "Heading": "NOTE", "Text": "NOTE", "Code": "NOTE", "Callout": "NOTE", "Notes": "NOTE",
          "Video": "VIDEO", "Image": "NOTE", "PDF": "PDF", "PPT": "PPT", "Table": "NOTE"
        };
        const contentType = typeMap[finalRecord.type] || "NOTE";
        const payload = {
          id: toUUID(id),
          submoduleId: toUUID(finalRecord.submoduleId),
          contentType: contentType,
          title: finalRecord.title || finalRecord.type || "Content Block",
          description: finalRecord.text || "",
          contentData: JSON.stringify(finalRecord),
          durationMinutes: parseInt(finalRecord.duration) || 0,
          fileUrl: finalRecord.fileUrl || ""
        };
        if (isUpdate) {
          await api.put(`/api/content/${toUUID(id)}`, payload);
        } else {
          await api.post("/api/content", payload);
        }
      }
    } catch (err) {
      console.error("API error while upserting:", err);
      showToast("DB write failed. Running in offline/cached mode.", "warning");
    }
    return id;
  }

  async function handleDeleteCategory(id) {
    const category = store.categories.find((item) => item.id === id);
    if (!window.confirm(`Delete category "${category?.name || "this category"}"? Courses will keep their data but lose this category.`)) return false;

    setStore((currentStore) => ({
      ...currentStore,
      categories: currentStore.categories.filter((item) => item.id !== id),
      courses: currentStore.courses.map((course) =>
        course.categoryId === id ? { ...course, categoryId: "" } : course
      )
    }));
    addAudit("Category deleted", category?.name || "Category");
    showToast("Category deleted");

    if (isOffline) return true;
    try {
      await api.delete(`/api/categories/${toUUID(id)}`);
    } catch (err) {
      console.error("Failed to delete category in DB", err);
    }
    return true;
  }

  async function handleDeleteCourse(id) {
    const course = store.courses.find((item) => item.id === id);
    if (!window.confirm(`Delete course "${course?.title || "this course"}" and its curriculum?`)) return false;

    const moduleIds = store.modules.filter((item) => item.courseId === id).map((item) => item.id);
    const submoduleIds = store.submodules
      .filter((item) => moduleIds.includes(item.moduleId))
      .map((item) => item.id);

    setStore((currentStore) => ({
      ...currentStore,
      courses: currentStore.courses.filter((item) => item.id !== id),
      modules: currentStore.modules.filter((item) => item.courseId !== id),
      submodules: currentStore.submodules.filter((item) => !moduleIds.includes(item.moduleId)),
      contentBlocks: currentStore.contentBlocks.filter(
        (item) => !submoduleIds.includes(item.submoduleId)
      )
    }));
    addAudit("Course deleted", course?.title || "Course");
    showToast("Course deleted");

    if (isOffline) return true;
    try {
      await api.delete(`/api/courses/${toUUID(id)}`);
    } catch (err) {
      console.error("Failed to delete course in DB", err);
    }
    return true;
  }

  async function handleDeleteModule(id) {
    const moduleRecord = store.modules.find((item) => item.id === id);
    if (!window.confirm(`Delete module "${moduleRecord?.title || "this module"}" and its submodules?`)) return false;

    const submoduleIds = store.submodules
      .filter((item) => item.moduleId === id)
      .map((item) => item.id);

    setStore((currentStore) => ({
      ...currentStore,
      modules: currentStore.modules.filter((item) => item.id !== id),
      submodules: currentStore.submodules.filter((item) => item.moduleId !== id),
      contentBlocks: currentStore.contentBlocks.filter(
        (item) => !submoduleIds.includes(item.submoduleId)
      )
    }));
    addAudit("Module deleted", moduleRecord?.title || "Module");
    showToast("Module deleted");

    if (isOffline) return true;
    try {
      await api.delete(`/api/modules/${toUUID(id)}`);
    } catch (err) {
      console.error("Failed to delete module in DB", err);
    }
    return true;
  }

  async function handleDeleteSubmodule(id) {
    const submodule = store.submodules.find((item) => item.id === id);
    if (!window.confirm(`Delete submodule "${submodule?.title || "this submodule"}" and its content blocks?`)) return false;

    setStore((currentStore) => ({
      ...currentStore,
      submodules: currentStore.submodules.filter((item) => item.id !== id),
      contentBlocks: currentStore.contentBlocks.filter((item) => item.submoduleId !== id)
    }));
    addAudit("Submodule deleted", submodule?.title || "Submodule");
    showToast("Submodule deleted");

    if (isOffline) return true;
    try {
      await api.delete(`/api/submodules/${toUUID(id)}`);
    } catch (err) {
      console.error("Failed to delete submodule in DB", err);
    }
    return true;
  }

  async function handleDeleteContentBlock(id) {
    const block = store.contentBlocks.find((item) => item.id === id);
    if (!window.confirm(`Delete ${block?.type || "content"} block?`)) return false;

    setStore((currentStore) => ({
      ...currentStore,
      contentBlocks: currentStore.contentBlocks.filter((item) => item.id !== id)
    }));
    addAudit("Content block deleted", block?.title || block?.type || "Content");
    showToast("Content block deleted");

    if (isOffline) return true;
    try {
      await api.delete(`/api/content/${toUUID(id)}`);
    } catch (err) {
      console.error("Failed to delete content in DB", err);
    }
    return true;
  }

  function handleToggleEntity(entity, id, field) {
    setStore((currentStore) => {
      const nextItems = currentStore[entity].map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: !item[field] };
          if (!isOffline) {
            // Trigger background update
            if (entity === "categories") {
              api.put(`/api/categories/${toUUID(id)}`, {
                id: toUUID(id),
                name: updated.name,
                description: updated.description || "",
                status: updated.status === "Active" ? "ACTIVE" : "INACTIVE",
                metadata: JSON.stringify(updated)
              }).catch(console.error);
            } else if (entity === "courses") {
              const status = updated.status === "Active" ? "PUBLISHED" : "DRAFT";
              api.put(`/api/courses/${toUUID(id)}`, {
                id: toUUID(id),
                categoryId: toUUID(updated.categoryId),
                trainerId: "123e4567-e89b-12d3-a456-426614174000",
                courseCode: updated.slug ? updated.slug.toUpperCase() : "COURSE-" + id.slice(0, 5).toUpperCase(),
                courseName: updated.title,
                shortDescription: updated.shortDescription || "",
                durationMinutes: parseInt(updated.duration) || 0,
                difficulty: (updated.level || "Beginner").toUpperCase() === "EXPERT" ? "ADVANCED" : (updated.level || "Beginner").toUpperCase(),
                status: status,
                thumbnailUrl: updated.thumbnail || "",
                metadata: JSON.stringify(updated)
              }).catch(console.error);
            }
          }
          return updated;
        }
        return item;
      });
      return { ...currentStore, [entity]: nextItems };
    });
    showToast("Status updated");
  }

  async function handleResetStore() {
    if (!window.confirm("Reset the prototype data to the original seed? This will overwrite the PostgreSQL database records.")) return false;
    
    if (!isOffline) {
      try {
        for (const cat of store.categories) {
          await api.delete(`/api/categories/${toUUID(cat.id)}`).catch(() => {});
        }
        for (const course of store.courses) {
          await api.delete(`/api/courses/${toUUID(course.id)}`).catch(() => {});
        }
        for (const mod of store.modules) {
          await api.delete(`/api/modules/${toUUID(mod.id)}`).catch(() => {});
        }
        for (const sub of store.submodules) {
          await api.delete(`/api/submodules/${toUUID(sub.id)}`).catch(() => {});
        }
        for (const block of store.contentBlocks) {
          await api.delete(`/api/content/${toUUID(block.id)}`).catch(() => {});
        }
        await syncAndMergeDatabase();
      } catch (err) {
        console.error("Failed to reset DB:", err);
      }
    } else {
      setStore(seedState);
    }
    showToast("Prototype data reset");
    return true;
  }

  return {
    store,
    upsertEntity,
    handleDeleteCategory,
    handleDeleteCourse,
    handleDeleteModule,
    handleDeleteSubmodule,
    handleDeleteContentBlock,
    handleToggleEntity,
    handleResetStore
  };
}
