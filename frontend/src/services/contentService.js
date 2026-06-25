import api, { handleApiError, delay } from './api';
import { loadExtraFields, saveExtraFields } from '../utils/extraFields';
import { getAutoIcon } from '../utils/iconHelper';

const typeToFrontend = {
  NOTE: 'Notes',
  PDF: 'PDF',
  PPT: 'PPT',
  COMPARISON_TABLE: 'Comparison Table',
  VIDEO: 'Video',
  YOUTUBE: 'YouTube',
  EXTERNAL_URL: 'External Link',
  QUIZ_PLACEHOLDER: 'Quiz Placeholder'
};

const typeToBackend = {
  'Notes': 'NOTE',
  'PDF': 'PDF',
  'PPT': 'PPT',
  'Comparison Table': 'COMPARISON_TABLE',
  'Video': 'VIDEO',
  'YouTube': 'YOUTUBE',
  'External Link': 'EXTERNAL_URL',
  'Quiz Placeholder': 'QUIZ_PLACEHOLDER'
};

const mapContentToFrontend = (c) => {
  let fileName = '';
  let fileSize = '';
  let contentData = c.contentData;

  if (c.contentType !== 'NOTE' && c.contentType !== 'COMPARISON_TABLE' && c.contentData) {
    try {
      const meta = JSON.parse(c.contentData);
      fileName = meta.fileName || '';
      fileSize = meta.fileSize || '';
      contentData = meta.textContent || c.contentData;
    } catch (e) {
      // Keep as-is if parsing fails
    }
  }

  const extra = loadExtraFields('content', c.id);

  return {
    id: c.id,
    submoduleId: c.submoduleId,
    name: c.title,
    contentType: typeToFrontend[c.contentType] || c.contentType,
    description: c.description || '',
    fileName: fileName,
    fileSize: fileSize,
    fileUrl: c.fileUrl || '#',
    contentData: contentData,
    position: c.position,
    courseName: c.courseName || '',
    durationMinutes: c.durationMinutes || 0,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    slug: extra.slug || c.slug || '',
    level: extra.level || c.level || 'Beginner',
    language: extra.language || c.language || 'English',
    estimatedDuration: extra.estimatedDuration || c.estimatedDuration || '',
    brandColor: extra.brandColor || c.brandColor || '#6C1D5F',
    bannerImage: extra.bannerImage || c.bannerImage || '',
    icon: extra.icon || c.icon || '',
  };
};

const mapContentToBackend = (data) => {
  const backendType = typeToBackend[data.contentType] || data.contentType;
  let contentData = data.contentData || '';

  if (backendType !== 'NOTE' && backendType !== 'COMPARISON_TABLE') {
    contentData = JSON.stringify({
      fileName: data.fileName || '',
      fileSize: data.fileSize || '',
      textContent: data.contentData || ''
    });
  }

  return {
    submoduleId: data.submoduleId,
    contentType: backendType,
    title: data.name,
    description: data.description || '',
    contentData: contentData,
    fileUrl: data.fileUrl || '',
    durationMinutes: data.durationMinutes || 0
  };
};

export const contentService = {
  async getAll() {
    try {
      const response = await api.get('/api/content');
      return response.data.map(mapContentToFrontend);
    } catch (error) {
      return [];
    }
  },

  async getBySubmoduleId(submoduleId) {
    try {
      const response = await api.get(`/api/content/submodule/${submoduleId}`);
      return response.data.map(mapContentToFrontend);
    } catch (error) {
      handleApiError(error);
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/api/content/${id}`);
      return mapContentToFrontend(response.data);
    } catch (error) {
      handleApiError(error);
    }
  },

  async create(data) {
    try {
      if (!data.icon || data.icon.trim() === '') {
        data.icon = getAutoIcon(data.name, data.description);
      }
      const payload = mapContentToBackend(data);
      const response = await api.post('/api/content', payload);
      const mapped = mapContentToFrontend(response.data);
      saveExtraFields('content', mapped.id, data);
      return { ...mapped, ...data };
    } catch (error) {
      handleApiError(error);
    }
  },

  async update(id, data) {
    try {
      if (!data.icon || data.icon.trim() === '') {
        data.icon = getAutoIcon(data.name, data.description);
      }
      const payload = mapContentToBackend(data);
      const response = await api.put(`/api/content/${id}`, payload);
      saveExtraFields('content', id, data);
      const mapped = mapContentToFrontend(response.data);
      return { ...mapped, ...data };
    } catch (error) {
      handleApiError(error);
    }
  },

  async delete(id) {
    try {
      await api.delete(`/api/content/${id}`);
      return { success: true, id };
    } catch (error) {
      handleApiError(error);
    }
  },

  async updatePositions(orderedIds) {
    try {
      await api.post('/api/content/reorder', {
        ids: orderedIds,
      });
      return [];
    } catch (error) {
      handleApiError(error);
    }
  },

  async mockUploadFile(file, onProgress) {
    const allowedExtensions = ['pdf', 'ppt', 'pptx', 'docx', 'mp4', 'png', 'jpg', 'jpeg'];
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(extension)) {
      throw new Error(`Unsupported file type: .${extension}. Only PDF, PPT, DOCX, MP4, and Images are allowed.`);
    }

    const maxBytes = 100 * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new Error(`File is too large. Maximum allowed size is 100MB.`);
    }

    for (let progress = 10; progress <= 100; progress += 20) {
      await delay(100);
      if (onProgress) {
        onProgress(Math.min(progress, 100));
      }
    }

    const fileSizeString = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;

    return {
      fileName: file.name,
      fileSize: fileSizeString,
      fileUrl: extension === 'mp4' ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' : `/files/${file.name}`,
    };
  }
};
