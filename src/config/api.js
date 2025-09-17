// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    logout: `${API_BASE_URL}/auth/logout`
  },
  
  // Assignments endpoints
  assignments: {
    getAll: `${API_BASE_URL}/assignments`,
    create: `${API_BASE_URL}/assignments`,
    update: (id) => `${API_BASE_URL}/assignments/${id}`,
    delete: (id) => `${API_BASE_URL}/assignments/${id}`
  },
  
  // Todos endpoints
  todos: {
    getAll: `${API_BASE_URL}/todos`,
    create: `${API_BASE_URL}/todos`,
    update: (id) => `${API_BASE_URL}/todos/${id}`,
    delete: (id) => `${API_BASE_URL}/todos/${id}`
  },
  
  // Progress endpoints
  progress: {
    getStats: `${API_BASE_URL}/progress/stats`,
    getBySubject: `${API_BASE_URL}/progress/subjects`
  }
};

// Gemini AI Configuration
export const GEMINI_CONFIG = {
  apiKey: GEMINI_API_KEY,
  model: 'gemini-2.0-flash-exp',
  apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'
};

// HTTP helper functions
const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('tutorly_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data || data; // Handle both direct data and wrapped responses
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const api = {
  get: (url) => apiRequest(url),
  post: (url, data) => apiRequest(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url, data) => apiRequest(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (url) => apiRequest(url, { method: 'DELETE' })
};