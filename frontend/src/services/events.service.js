import { api } from "./api.js";

export const eventService = {
  /**
   * Create a new event
   * @param {Object} eventData 
   * @returns {Promise<Object>}
   */
  createEvent: (eventData) => api.post("/api/events", eventData),

  /**
   * Fetch all events, optionally filtered by status or courseId
   * @param {string} [status] 
   * @param {string} [courseId] 
   * @returns {Promise<Array>}
   */
  getAllEvents: (status, courseId) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (courseId) params.append("courseId", courseId);
    
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return api.get(`/api/events${queryString}`);
  },

  /**
   * Fetch a single event by its UUID
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  getEventById: (id) => api.get(`/api/events/${id}`),

  /**
   * Update an existing event
   * @param {string} id 
   * @param {Object} eventData 
   * @returns {Promise<Object>}
   */
  updateEvent: (id, eventData) => api.put(`/api/events/${id}`, eventData),

  /**
   * Delete an event permanently
   * @param {string} id 
   * @returns {Promise<void>}
   */
  deleteEvent: (id) => api.delete(`/api/events/${id}`),

  /**
   * Cancel an event (changes status to CANCELLED)
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  cancelEvent: (id) => api.put(`/api/events/${id}/cancel`)
};
