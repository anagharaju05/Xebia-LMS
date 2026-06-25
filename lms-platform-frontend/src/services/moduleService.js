import api, { handleApiError } from './api';

const mapModule = (m) => ({
  id: m.id,
  courseId: m.courseId,
  name: m.name,
  description: m.description || '',
  position: m.position,
  courseName: m.courseName || '',
  createdAt: m.createdAt,
  updatedAt: m.updatedAt,
});

export const moduleService = {
  async getAll() {
    try {
      const modulesResponse = await api.get('/api/modules/course/all'); // Fallback or retrieve via all courses
      return modulesResponse.data.map(mapModule);
    } catch (error) {
      // If global all is not configured, fall back to empty or return empty
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
      const response = await api.post('/api/modules', {
        courseId: data.courseId,
        name: data.name,
        description: data.description || '',
      });
      return mapModule(response.data);
    } catch (error) {
      handleApiError(error);
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/api/modules/${id}`, {
        courseId: data.courseId,
        name: data.name,
        description: data.description || '',
      });
      return mapModule(response.data);
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
      // Return updated modules list if needed
      return [];
    } catch (error) {
      handleApiError(error);
    }
  }
};
