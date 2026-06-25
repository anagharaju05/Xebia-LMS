export const loadExtraFields = (modelName, id) => {
  try {
    const data = localStorage.getItem(`lms_extra_${modelName}_${id}`);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to load extra fields', e);
    return {};
  }
};

export const saveExtraFields = (modelName, id, fields) => {
  try {
    const current = loadExtraFields(modelName, id);
    const updated = {
      ...current,
      slug: fields.slug !== undefined ? fields.slug : current.slug || '',
      level: fields.level !== undefined ? fields.level : current.level || 'Beginner',
      language: fields.language !== undefined ? fields.language : current.language || 'English',
      estimatedDuration: fields.estimatedDuration !== undefined ? fields.estimatedDuration : current.estimatedDuration || '',
      brandColor: fields.brandColor !== undefined ? fields.brandColor : current.brandColor || '#6C1D5F',
      bannerImage: fields.bannerImage !== undefined ? fields.bannerImage : current.bannerImage || '',
      icon: fields.icon !== undefined ? fields.icon : current.icon || '',
    };
    localStorage.setItem(`lms_extra_${modelName}_${id}`, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save extra fields', e);
  }
};
