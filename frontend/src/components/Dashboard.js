import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import agentService from '../api/agentService';
import memoryService from '../api/memoryService';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [memories, setMemories] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [agentForm, setAgentForm] = useState({
    name: '',
    description: '',
    agent_type: 'general',
  });

  const [memoryForm, setMemoryForm] = useState({
    content: '',
    memory_type: 'general',
    importance: 5,
    tags: '',
    metadata: '',
  });

  useEffect(() => {
    loadAgents();
    loadMemories();
  }, []);

  const loadAgents = async () => {
    try {
      const data = await agentService.getAgents();
      setAgents(data);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMemories = async (agentId = null) => {
    try {
      const params = agentId ? { agent_id: agentId } : {};
      const data = await memoryService.getMemories(params);
      setMemories(data);
    } catch (error) {
      console.error('Failed to load memories:', error);
    }
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    try {
      await agentService.createAgent(agentForm);
      setShowAgentModal(false);
      setAgentForm({ name: '', description: '', agent_type: 'general' });
      loadAgents();
    } catch (error) {
      console.error('Failed to create agent:', error);
      alert('Failed to create agent');
    }
  };

  const handleCreateMemory = async (e) => {
    e.preventDefault();
    try {
      const memoryData = {
        ...memoryForm,
        tags: memoryForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        agent_id: selectedAgent,
        metadata: memoryForm.metadata ? JSON.parse(memoryForm.metadata) : null,
      };
      await memoryService.createMemory(memoryData);
      setShowMemoryModal(false);
      setMemoryForm({ content: '', memory_type: 'general', importance: 5, tags: '', metadata: '' });
      loadMemories(selectedAgent);
    } catch (error) {
      console.error('Failed to create memory:', error);
      alert('Failed to create memory');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadMemories(selectedAgent);
      return;
    }
    try {
      const params = selectedAgent ? { agent_id: selectedAgent } : {};
      const data = await memoryService.searchMemories(searchQuery, params);
      setMemories(data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleDeleteMemory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this memory?')) return;
    try {
      await memoryService.deleteMemory(id);
      loadMemories(selectedAgent);
    } catch (error) {
      console.error('Failed to delete memory:', error);
    }
  };

  const handleDeleteAgent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this agent and all its memories?')) return;
    try {
      await agentService.deleteAgent(id);
      if (selectedAgent === id) {
        setSelectedAgent(null);
        loadMemories();
      }
      loadAgents();
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>AI Memory System</h1>
        <div className="user-info">
          <span>Welcome, {user?.username}</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Agents</h2>
            <button onClick={() => setShowAgentModal(true)} className="btn-add">
              + New Agent
            </button>
          </div>
          <div className="agent-list">
            <button
              className={`agent-item ${!selectedAgent ? 'active' : ''}`}
              onClick={() => {
                setSelectedAgent(null);
                loadMemories();
              }}
            >
              All Memories
            </button>
            {agents.map((agent) => (
              <div key={agent.id} className="agent-item-container">
                <button
                  className={`agent-item ${selectedAgent === agent.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedAgent(agent.id);
                    loadMemories(agent.id);
                  }}
                >
                  {agent.name}
                  <span className="memory-count">{agent.memory_count || 0}</span>
                </button>
                <button
                  className="btn-delete-agent"
                  onClick={() => handleDeleteAgent(agent.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </aside>

        <main className="main-content">
          <div className="memories-header">
            <h2>Memories</h2>
            <button onClick={() => setShowMemoryModal(true)} className="btn-add">
              + Add Memory
            </button>
          </div>

          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>

          <div className="memories-list">
            {memories.length === 0 ? (
              <p className="no-memories">No memories found</p>
            ) : (
              memories.map((memory) => (
                <div key={memory.id} className="memory-card">
                  <div className="memory-header">
                    <span className="memory-type">{memory.memory_type}</span>
                    <span className="memory-importance">Importance: {memory.importance}/10</span>
                    <button
                      onClick={() => handleDeleteMemory(memory.id)}
                      className="btn-delete-memory"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="memory-content">{memory.content}</p>
                  {memory.tags && memory.tags.length > 0 && (
                    <div className="memory-tags">
                      {memory.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="memory-footer">
                    <small>Created: {new Date(memory.created_at).toLocaleString()}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {showAgentModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Create New Agent</h3>
            <form onSubmit={handleCreateAgent}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={agentForm.name}
                  onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={agentForm.description}
                  onChange={(e) => setAgentForm({ ...agentForm, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Type:</label>
                <select
                  value={agentForm.agent_type}
                  onChange={(e) => setAgentForm({ ...agentForm, agent_type: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="assistant">Assistant</option>
                  <option value="researcher">Researcher</option>
                  <option value="analyzer">Analyzer</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAgentModal(false)}>
                  Cancel
                </button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemoryModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add New Memory</h3>
            <form onSubmit={handleCreateMemory}>
              <div className="form-group">
                <label>Content:</label>
                <textarea
                  value={memoryForm.content}
                  onChange={(e) => setMemoryForm({ ...memoryForm, content: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Type:</label>
                <select
                  value={memoryForm.memory_type}
                  onChange={(e) => setMemoryForm({ ...memoryForm, memory_type: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="fact">Fact</option>
                  <option value="conversation">Conversation</option>
                  <option value="preference">Preference</option>
                  <option value="task">Task</option>
                </select>
              </div>
              <div className="form-group">
                <label>Importance (1-10):</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={memoryForm.importance}
                  onChange={(e) => setMemoryForm({ ...memoryForm, importance: parseInt(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>Tags (comma-separated):</label>
                <input
                  type="text"
                  value={memoryForm.tags}
                  onChange={(e) => setMemoryForm({ ...memoryForm, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div className="form-group">
                <label>Metadata (JSON):</label>
                <textarea
                  value={memoryForm.metadata}
                  onChange={(e) => setMemoryForm({ ...memoryForm, metadata: e.target.value })}
                  placeholder='{"key": "value"}'
                  rows={2}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowMemoryModal(false)}>
                  Cancel
                </button>
                <button type="submit">Add Memory</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
