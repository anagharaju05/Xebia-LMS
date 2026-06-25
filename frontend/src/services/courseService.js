import api, { handleApiError } from './api';
import { loadExtraFields, saveExtraFields } from '../utils/extraFields';
import { getAutoIcon } from '../utils/iconHelper';

const mapCourse = (c) => {
  const extra = loadExtraFields('course', c.id);
  return {
    id: c.id,
    categoryId: c.categoryId,
    name: c.courseName || c.name,
    description: c.shortDescription || c.description || '',
    thumbnail: c.thumbnailUrl || c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80',
    status: c.status === 'PUBLISHED' || c.status === 'Active' ? 'Active' : 'Draft',
    durationMinutes: c.durationMinutes || 0,
    difficulty: c.difficulty,
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

export const courseService = {
  async getAll() {
    try {
      const coursesResponse = await api.get('/api/courses');
      const categoriesResponse = await api.get('/api/categories');
      
      const courses = coursesResponse.data;
      const categories = categoriesResponse.data;

      return courses.map((course) => ({
        ...mapCourse(course),
        categoryName: categories.find((cat) => cat.id === course.categoryId)?.name || 'Unknown Category',
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  async getById(id) {
    try {
      const courseResponse = await api.get(`/api/courses/${id}`);
      const course = courseResponse.data;
      
      // Fetch category details
      let categoryName = 'Unknown Category';
      try {
        const catResponse = await api.get(`/api/categories/${course.categoryId}`);
        categoryName = catResponse.data.name;
      } catch (e) {
        console.warn('Could not load category name', e);
      }

      return {
        ...mapCourse(course),
        categoryName,
      };
    } catch (error) {
      handleApiError(error);
    }
  },

  async create(data) {
    try {
      if (!data.icon || data.icon.trim() === '') {
        data.icon = getAutoIcon(data.name, data.description);
      }
      const generatedCode = 'CRSE-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const response = await api.post('/api/courses', {
        categoryId: data.categoryId,
        trainerId: '123e4567-e89b-12d3-a456-426614174000',
        courseCode: generatedCode,
        courseName: data.name,
        shortDescription: data.description || '',
        difficulty: data.level?.toUpperCase() || 'BEGINNER',
        thumbnailUrl: data.thumbnail || ''
      });
      const mapped = mapCourse(response.data);
      saveExtraFields('course', mapped.id, data);
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
      const currentCourse = await api.get(`/api/courses/${id}`);
      
      const response = await api.put(`/api/courses/${id}`, {
        categoryId: data.categoryId,
        trainerId: currentCourse.data.trainerId,
        courseCode: currentCourse.data.courseCode,
        courseName: data.name,
        shortDescription: data.description || '',
        difficulty: data.level?.toUpperCase() || currentCourse.data.difficulty || 'BEGINNER',
        thumbnailUrl: data.thumbnail || currentCourse.data.thumbnailUrl
      });
      saveExtraFields('course', id, data);
      const mapped = mapCourse(response.data);
      return { ...mapped, ...data };
    } catch (error) {
      handleApiError(error);
    }
  },

  async delete(id) {
    try {
      await api.delete(`/api/courses/${id}`);
      return { success: true, id };
    } catch (error) {
      handleApiError(error);
    }
  },
  
  async submitReview(id) {
    try {
      const response = await api.post(`/api/courses/${id}/submit-review`);
      return mapCourse(response.data);
    } catch (error) {
      handleApiError(error);
    }
  },

  async publish(id) {
    try {
      const response = await api.post(`/api/courses/${id}/publish`);
      return mapCourse(response.data);
    } catch (error) {
      handleApiError(error);
    }
  }
};
