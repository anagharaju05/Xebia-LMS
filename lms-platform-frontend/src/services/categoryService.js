import api, { handleApiError } from './api';

const mapCategory = (c) => ({
  id: c.id,
  name: c.name,
  description: c.description || '',
  status: c.status === 'ACTIVE' ? 'Active' : 'Inactive',
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

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
      handleApiError(error);
    }
  },

  async create(data) {
    try {
      const response = await api.post('/api/categories', {
        name: data.name,
        description: data.description || '',
        parentCategoryId: data.parentCategoryId || null
      });
      return mapCategory(response.data);
    } catch (error) {
      handleApiError(error);
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/api/categories/${id}`, {
        name: data.name,
        description: data.description || '',
        parentCategoryId: data.parentCategoryId || null
      });
      return mapCategory(response.data);
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
