import api, { handleApiError } from './api';
import { loadExtraFields, saveExtraFields } from '../utils/extraFields';
import { getAutoIcon } from '../utils/iconHelper';

const mapModule = (m) => {
  const extra = loadExtraFields('module', m.id);
  return {
    id: m.id,
    courseId: m.courseId,
    name: m.name,
    description: m.description || '',
    position: m.position,
    courseName: m.courseName || '',
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    slug: extra.slug || m.slug || '',
    level: extra.level || m.level || 'Beginner',
    language: extra.language || m.language || 'English',
    estimatedDuration: extra.estimatedDuration || m.estimatedDuration || '',
    brandColor: extra.brandColor || m.brandColor || '#6C1D5F',
    bannerImage: extra.bannerImage || m.bannerImage || '',
    icon: extra.icon || m.icon || '',
  };
};

export const moduleService = {
  async getAll() {
    try {
      const modulesResponse = await api.get('/api/modules/course/all');
      return modulesResponse.data.map(mapModule);
    } catch (error) {
      return [];
    }
  },

  async getByCourseId(courseId) {
    try {
      const response = await api.get(`/api/modules/course/${courseId}`);
      return response.data.map(mapModule);
    } catch (error) {
      handleApiError(error);
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/api/modules/${id}`);
      return mapModule(response.data);
    } catch (error) {
      handleApiError(error);
    }
  },

  async create(data) {
    try {
      if (!data.icon || data.icon.trim() === '') {
        data.icon = getAutoIcon(data.name, data.description);
      }
      const response = await api.post('/api/modules', {
        courseId: data.courseId,
        name: data.name,
        description: data.description || '',
      });
      const mapped = mapModule(response.data);
      saveExtraFields('module', mapped.id, data);
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
      const response = await api.put(`/api/modules/${id}`, {
        courseId: data.courseId,
        name: data.name,
        description: data.description || '',
      });
      saveExtraFields('module', id, data);
      const mapped = mapModule(response.data);
      return { ...mapped, ...data };
    } catch (error) {
      handleApiError(error);
    }
  },

  async delete(id) {
    try {
      await api.delete(`/api/modules/${id}`);
      return { success: true, id };
    } catch (error) {
      handleApiError(error);
    }
  },

  async updatePositions(orderedIds) {
    try {
      await api.post('/api/modules/reorder', {
        ids: orderedIds,
      });
      return [];
    } catch (error) {
      handleApiError(error);
    }
  }
};
