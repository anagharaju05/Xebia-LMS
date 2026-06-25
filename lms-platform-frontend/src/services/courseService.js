import api, { handleApiError } from './api';

const mapCourse = (c) => ({
  id: c.id,
  categoryId: c.categoryId,
  name: c.courseName,
  description: c.shortDescription || '',
  thumbnail: c.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80',
  status: c.status === 'PUBLISHED' ? 'Active' : 'Draft',
  durationMinutes: c.durationMinutes || 0,
  difficulty: c.difficulty,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

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
      // Auto-generate code if not present, to pass backend validation
      const generatedCode = 'CRSE-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const response = await api.post('/api/courses', {
        categoryId: data.categoryId,
        trainerId: '123e4567-e89b-12d3-a456-426614174000', // Static default trainer UUID
        courseCode: generatedCode,
        courseName: data.name,
        shortDescription: data.description || '',
        difficulty: 'BEGINNER', // Default difficulty
        thumbnailUrl: data.thumbnail || ''
      });
      return mapCourse(response.data);
    } catch (error) {
      handleApiError(error);
    }
  },

  async update(id, data) {
    try {
      // Get current course details to preserve courseCode
      const currentCourse = await api.get(`/api/courses/${id}`);
      
      const response = await api.put(`/api/courses/${id}`, {
        categoryId: data.categoryId,
        trainerId: currentCourse.data.trainerId,
        courseCode: currentCourse.data.courseCode,
        courseName: data.name,
        shortDescription: data.description || '',
        difficulty: currentCourse.data.difficulty || 'BEGINNER',
        thumbnailUrl: data.thumbnail || currentCourse.data.thumbnailUrl
      });
      return mapCourse(response.data);
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
  
  // Submit DRAFT course to REVIEW
  async submitReview(id) {
    try {
      const response = await api.post(`/api/courses/${id}/submit-review`);
      return mapCourse(response.data);
    } catch (error) {
      handleApiError(error);
    }
  },

  // Approve and PUBLISH course
  async publish(id) {
    try {
      const response = await api.post(`/api/courses/${id}/publish`);
      return mapCourse(response.data);
    } catch (error) {
      handleApiError(error);
    }
  }
};
