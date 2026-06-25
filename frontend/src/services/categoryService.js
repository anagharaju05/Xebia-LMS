import api, { handleApiError } from './api';
import { loadExtraFields, saveExtraFields } from '../utils/extraFields';
import { getAutoIcon } from '../utils/iconHelper';

const mapCategory = (c) => {
  const extra = loadExtraFields('category', c.id);
  return {
    id: c.id,
    name: c.name,
    description: c.description || '',
    status: c.status === 'ACTIVE' || c.status === 'Active' ? 'Active' : 'Inactive',
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

export const categoryService = {
  async getAll() {
    try {
      const response = await api.get('/api/categories');
      return response.data.map(mapCategory);
    } catch (error) {
      handleApiError(error);
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/api/categories/${id}`);
      return mapCategory(response.data);
    } catch (error) {
      // Fallback: If direct GET fails (e.g., 404 or backend not restarted), fetch all and find the match
      try {
        const listResponse = await api.get('/api/categories');
        const found = listResponse.data.find((c) => c.id === id);
        if (found) {
          return mapCategory(found);
        }
      } catch (fallbackError) {
        console.error('Fallback fetch all categories failed:', fallbackError);
      }
      handleApiError(error);
    }
  },

  async create(data) {
    try {
      if (!data.icon || data.icon.trim() === '') {
        data.icon = getAutoIcon(data.name, data.description);
      }
      const response = await api.post('/api/categories', {
        name: data.name,
        description: data.description || '',
        parentCategoryId: data.parentCategoryId || null
      });
      const mapped = mapCategory(response.data);
      saveExtraFields('category', mapped.id, data);
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
      const response = await api.put(`/api/categories/${id}`, {
        name: data.name,
        description: data.description || '',
        parentCategoryId: data.parentCategoryId || null
      });
      saveExtraFields('category', id, data);
      const mapped = mapCategory(response.data);
      return { ...mapped, ...data };
    } catch (error) {
      handleApiError(error);
    }
  },

  async delete(id) {
    try {
      await api.delete(`/api/categories/${id}`);
      return { success: true, id };
    } catch (error) {
      handleApiError(error);
    }
  }
};
