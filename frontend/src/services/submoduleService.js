import api, { handleApiError } from './api';
import { loadExtraFields, saveExtraFields } from '../utils/extraFields';
import { getAutoIcon } from '../utils/iconHelper';

const mapSubmodule = (s) => {
  const extra = loadExtraFields('submodule', s.id);
  return {
    id: s.id,
    moduleId: s.moduleId,
    name: s.name,
    description: s.description || '',
    position: s.position,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    slug: extra.slug || s.slug || '',
    level: extra.level || s.level || 'Beginner',
    language: extra.language || s.language || 'English',
    estimatedDuration: extra.estimatedDuration || s.estimatedDuration || '',
    brandColor: extra.brandColor || s.brandColor || '#6C1D5F',
    bannerImage: extra.bannerImage || s.bannerImage || '',
    icon: extra.icon || s.icon || '',
  };
};

export const submoduleService = {
  async getAll() {
    try {
      const response = await api.get('/api/submodules/module/all');
      return response.data.map(mapSubmodule);
    } catch (error) {
      return [];
    }
  },

  async getByModuleId(moduleId) {
    try {
      const response = await api.get(`/api/submodules/module/${moduleId}`);
      return response.data.map(mapSubmodule);
    } catch (error) {
      handleApiError(error);
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/api/submodules/${id}`);
      return mapSubmodule(response.data);
    } catch (error) {
      handleApiError(error);
    }
  },

  async create(data) {
    try {
      if (!data.icon || data.icon.trim() === '') {
        data.icon = getAutoIcon(data.name, data.description);
      }
      const response = await api.post('/api/submodules', {
        moduleId: data.moduleId,
        name: data.name,
        description: data.description || '',
      });
      const mapped = mapSubmodule(response.data);
      saveExtraFields('submodule', mapped.id, data);
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
      const response = await api.put(`/api/submodules/${id}`, {
        moduleId: data.moduleId,
        name: data.name,
        description: data.description || '',
      });
      saveExtraFields('submodule', id, data);
      const mapped = mapSubmodule(response.data);
      return { ...mapped, ...data };
    } catch (error) {
      handleApiError(error);
    }
  },

  async delete(id) {
    try {
      await api.delete(`/api/submodules/${id}`);
      return { success: true, id };
    } catch (error) {
      handleApiError(error);
    }
  },

  async updatePositions(orderedIds) {
    try {
      await api.post('/api/submodules/reorder', {
        ids: orderedIds,
      });
      return [];
    } catch (error) {
      handleApiError(error);
    }
  }
};
