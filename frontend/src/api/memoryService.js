import api from './api';

export const memoryService = {
  createMemory: async (memoryData) => {
    const response = await api.post('/memories', memoryData);
    return response.data;
  },

  getMemories: async (params = {}) => {
    const response = await api.get('/memories', { params });
    return response.data;
  },

  getMemory: async (id) => {
    const response = await api.get(`/memories/${id}`);
    return response.data;
  },

  updateMemory: async (id, memoryData) => {
    const response = await api.put(`/memories/${id}`, memoryData);
    return response.data;
  },

  deleteMemory: async (id) => {
    const response = await api.delete(`/memories/${id}`);
    return response.data;
  },

  searchMemories: async (query, params = {}) => {
    const response = await api.get(`/memories/search/${query}`, { params });
    return response.data;
  },

  getMemoriesByImportance: async (threshold, params = {}) => {
    const response = await api.get(`/memories/importance/${threshold}`, { params });
    return response.data;
  },
};
