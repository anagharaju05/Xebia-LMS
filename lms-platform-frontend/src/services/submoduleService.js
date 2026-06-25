import api, { handleApiError } from './api';

const mapSubmodule = (s) => ({
  id: s.id,
  moduleId: s.moduleId,
  name: s.name,
  description: s.description || '',
  position: s.position,
  createdAt: s.createdAt,
  updatedAt: s.updatedAt,
});

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
      const response = await api.post('/api/submodules', {
        moduleId: data.moduleId,
        name: data.name,
        description: data.description || '',
      });
      return mapSubmodule(response.data);
    } catch (error) {
      handleApiError(error);
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/api/submodules/${id}`, {
        moduleId: data.moduleId,
        name: data.name,
        description: data.description || '',
      });
      return mapSubmodule(response.data);
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
