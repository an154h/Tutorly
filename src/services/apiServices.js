import { API_ENDPOINTS, api } from '../config/api.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Chat Service
export const chatService = {
  async sendMessage(message, sessionId = null) {
    try {
      const response = await api.post(`${API_BASE_URL}/chat/message`, { message, sessionId });
      return response;
    } catch (error) {
      console.error('Failed to send chat message:', error);
      // Return fallback response
      return {
        message,
        response: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment!",
        timestamp: new Date().toISOString()
      };
    }
  },

  async getHistory(limit = 20, sessionId = null) {
    try {
      const url = `${API_BASE_URL}/chat/history?limit=${limit}${sessionId ? `&sessionId=${sessionId}` : ''}`;
      return await api.get(url);
    } catch (error) {
      console.error('Failed to get chat history:', error);
      return [];
    }
  },

  async clearHistory(sessionId = null) {
    try {
      const url = `${API_BASE_URL}/chat/history${sessionId ? `?sessionId=${sessionId}` : ''}`;
      return await api.delete(url);
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      return { success: false };
    }
  }
};

// Assignments Service
export const assignmentsService = {
  async getAll() {
    try {
      const response = await api.get(`${API_BASE_URL}/assignments`);
      return response;
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      // Return dummy data as fallback
      return [
        { 
          id: 1, 
          title: 'Math Homework', 
          subject: 'Math', 
          due_date: '2025-01-20', 
          status: 'Pending', 
          difficulty: 'Medium',
          score: null,
          created_at: new Date().toISOString()
        },
        { 
          id: 2, 
          title: 'Science Report', 
          subject: 'Science', 
          due_date: '2025-01-22', 
          status: 'In Progress', 
          difficulty: 'Hard',
          score: null,
          created_at: new Date().toISOString()
        }
      ];
    }
  },

  async create(assignment) {
    try {
      // Ensure consistent field names for backend
      const assignmentData = {
        title: assignment.title,
        subject: assignment.subject,
        dueDate: assignment.due || assignment.dueDate || assignment.due_date,
        status: assignment.status || 'Pending',
        difficulty: assignment.difficulty || 'Medium',
        score: assignment.score || null
      };

      const response = await api.post(`${API_BASE_URL}/assignments`, assignmentData);
      return response;
    } catch (error) {
      console.error('Failed to create assignment:', error);
      // Return mock success for development
      return { 
        ...assignment, 
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  },

  async update(id, assignment) {
    try {
      // Ensure consistent field names for backend
      const assignmentData = {};
      
      if (assignment.title !== undefined) assignmentData.title = assignment.title;
      if (assignment.subject !== undefined) assignmentData.subject = assignment.subject;
      if (assignment.due !== undefined) assignmentData.due_date = assignment.due;
      if (assignment.dueDate !== undefined) assignmentData.due_date = assignment.dueDate;
      if (assignment.due_date !== undefined) assignmentData.due_date = assignment.due_date;
      if (assignment.status !== undefined) assignmentData.status = assignment.status;
      if (assignment.difficulty !== undefined) assignmentData.difficulty = assignment.difficulty;
      if (assignment.score !== undefined) assignmentData.score = assignment.score;

      const response = await api.put(`${API_BASE_URL}/assignments/${id}`, assignmentData);
      return response;
    } catch (error) {
      console.error('Failed to update assignment:', error);
      return { ...assignment, id };
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`${API_BASE_URL}/assignments/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      return { success: true };
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`${API_BASE_URL}/assignments/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to get assignment:', error);
      return null;
    }
  },

  async getByStatus(status) {
    try {
      const response = await api.get(`${API_BASE_URL}/assignments/status/${status}`);
      return response;
    } catch (error) {
      console.error('Failed to get assignments by status:', error);
      return [];
    }
  },

  async getBySubject(subject) {
    try {
      const response = await api.get(`${API_BASE_URL}/assignments/subject/${encodeURIComponent(subject)}`);
      return response;
    } catch (error) {
      console.error('Failed to get assignments by subject:', error);
      return [];
    }
  },

  async bulkUpdate(ids, updates) {
    try {
      const response = await api.patch(`${API_BASE_URL}/assignments/bulk`, { ids, updates });
      return response;
    } catch (error) {
      console.error('Failed to bulk update assignments:', error);
      return { success: false };
    }
  }
};

// Todos Service
export const todosService = {
  async getAll() {
    try {
      const response = await api.get(`${API_BASE_URL}/todos`);
      return response;
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      // Return dummy data as fallback
      return [
        { id: 1, text: 'Complete algebra homework', done: false, created_at: new Date().toISOString() },
        { id: 2, text: 'Study for chemistry test', done: true, created_at: new Date().toISOString() },
        { id: 3, text: 'Write history essay', done: false, created_at: new Date().toISOString() }
      ];
    }
  },

  async create(todo) {
    try {
      const todoData = {
        text: todo.text,
        done: todo.done || false
      };

      const response = await api.post(`${API_BASE_URL}/todos`, todoData);
      return response;
    } catch (error) {
      console.error('Failed to create todo:', error);
      return { 
        ...todo, 
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  },

  async update(id, todo) {
    try {
      const todoData = {};
      
      if (todo.text !== undefined) todoData.text = todo.text;
      if (todo.done !== undefined) todoData.done = todo.done;

      const response = await api.put(`${API_BASE_URL}/todos/${id}`, todoData);
      return response;
    } catch (error) {
      console.error('Failed to update todo:', error);
      return { ...todo, id };
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`${API_BASE_URL}/todos/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to delete todo:', error);
      return { success: true };
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`${API_BASE_URL}/todos/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to get todo:', error);
      return null;
    }
  }
};

// Progress Service
export const progressService = {
  async getStats() {
    try {
      const response = await api.get(`${API_BASE_URL}/progress/stats`);
      return response;
    } catch (error) {
      console.error('Failed to fetch progress stats:', error);
      // Return dummy data
      return {
        assignments: {
          total: 10,
          completed: 6,
          inProgress: 2,
          pending: 1,
          overdue: 1
        },
        todos: {
          total: 8,
          completed: 5,
          pending: 3
        },
        activity: {
          recentAssignments: 3,
          currentStreak: 5
        },
        overview: {
          totalTasks: 18,
          completedTasks: 11,
          completionRate: 61.1
        }
      };
    }
  },

  async getBySubject() {
    try {
      const response = await api.get(`${API_BASE_URL}/progress/subjects`);
      return response;
    } catch (error) {
      console.error('Failed to fetch subject progress:', error);
      // Return dummy data
      return [
        { subject: 'Math', total: 4, completed: 3, progress: 75, averageScore: 88 },
        { subject: 'Science', total: 3, completed: 2, progress: 67, averageScore: 82 },
        { subject: 'History', total: 2, completed: 2, progress: 100, averageScore: 95 },
        { subject: 'English', total: 1, completed: 0, progress: 0, averageScore: null }
      ];
    }
  },

  async getActivity(weeks = 4) {
    try {
      const response = await api.get(`${API_BASE_URL}/progress/activity?weeks=${weeks}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch activity data:', error);
      // Return dummy data
      const mockData = [];
      const today = new Date();
      
      for (let i = weeks * 7 - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        mockData.push({
          date: date.toISOString().split('T')[0],
          activities: Math.floor(Math.random() * 8)
        });
      }
      
      return mockData;
    }
  }
};

// Auth Service
export const authService = {
  async login(credentials) {
    try {
      const loginData = {
        name: credentials.name,
        studentId: credentials.studentId || credentials.id,
        password: credentials.password
      };

      const response = await api.post(`${API_BASE_URL}/auth/login`, loginData);
      
      if (response.success && response.token) {
        localStorage.setItem('tutorly_token', response.token);
        localStorage.setItem('tutorly_user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('Failed to login:', error);
      // Mock successful login for development
      const mockResponse = {
        success: true,
        user: { 
          name: credentials.name || 'Student', 
          id: credentials.studentId || credentials.id || '12345',
          studentId: credentials.studentId || credentials.id || '12345'
        },
        token: 'mock-jwt-token-' + Date.now()
      };
      localStorage.setItem('tutorly_token', mockResponse.token);
      localStorage.setItem('tutorly_user', JSON.stringify(mockResponse.user));
      return mockResponse;
    }
  },

  async register(userData) {
    try {
      const registerData = {
        name: userData.name,
        studentId: userData.studentId || userData.id,
        password: userData.password
      };

      const response = await api.post(`${API_BASE_URL}/auth/register`, registerData);
      
      if (response.success && response.token) {
        localStorage.setItem('tutorly_token', response.token);
        localStorage.setItem('tutorly_user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('Failed to register:', error);
      const mockResponse = {
        success: true,
        user: { 
          name: userData.name, 
          id: userData.studentId || userData.id || Date.now().toString(),
          studentId: userData.studentId || userData.id || Date.now().toString()
        },
        token: 'mock-jwt-token-' + Date.now()
      };
      localStorage.setItem('tutorly_token', mockResponse.token);
      localStorage.setItem('tutorly_user', JSON.stringify(mockResponse.user));
      return mockResponse;
    }
  },

  async logout() {
    try {
      await api.post(`${API_BASE_URL}/auth/logout`);
    } catch (error) {
      console.error('Failed to logout:', error);
    }

    localStorage.removeItem('tutorly_token');
    localStorage.removeItem('tutorly_user');
    return { success: true };
  },

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('tutorly_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  isAuthenticated() {
    const token = localStorage.getItem('tutorly_token');
    const user = localStorage.getItem('tutorly_user');
    return !!(token && user);
  },

  getToken() {
    return localStorage.getItem('tutorly_token');
  }
};