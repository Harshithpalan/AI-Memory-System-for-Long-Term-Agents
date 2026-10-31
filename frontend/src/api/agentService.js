import api from './api';

export const agentService = {
  createAgent: async (agentData) => {
    const response = await api.post('/agents', agentData);
    return response.data;
  },

  getAgents: async () => {
    const response = await api.get('/agents');
    return response.data;
  },

  getAgent: async (id) => {
    const response = await api.get(`/agents/${id}`);
    return response.data;
  },

  updateAgent: async (id, agentData) => {
    const response = await api.put(`/agents/${id}`, agentData);
    return response.data;
  },

  deleteAgent: async (id) => {
    const response = await api.delete(`/agents/${id}`);
    return response.data;
  },

  getAgentMemories: async (id, params = {}) => {
    const response = await api.get(`/agents/${id}/memories`, { params });
    return response.data;
  },
};
