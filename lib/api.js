// file: frontend/lib/api.js
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);

// Summary
export const createSummary = (data) => api.post('/summary', data);
export const getLectures = (params) => api.get('/summary', { params });
export const getLectureById = (id) => api.get(`/summary/${id}`);
export const deleteLecture = (id) => api.delete(`/summary/${id}`);

// Test
export const generateTest = (data) => api.post('/test/generate', data);
export const getTests = (params) => api.get('/test', { params });
export const getTestById = (id) => api.get(`/test/${id}`);
export const deleteTest = (id) => api.delete(`/test/${id}`);

// Code Check
export const checkCode = (data) => api.post('/code/check', data);

// Cheat Sheet
export const createCheatSheet = (data) => api.post('/cheatsheet', data);

// Exam
export const startExam = (data) => api.post('/exam/start', data);
export const getExamResults = (id) => api.get(`/exam/results/${id}`);
export const getExams = (params) => api.get('/exam', { params });

export default api;
