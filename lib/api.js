// file: frontend/lib/api.js
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — добавляем токен
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — обработка 401 (неавторизован)
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

// ────────────────────────────────────────────────
// Auth
// ────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);

// ────────────────────────────────────────────────
// Summary / Lectures
// ────────────────────────────────────────────────
export const createSummary = (data) => api.post('/summary', data);
export const getLectures = (params) => api.get('/summary', { params });
export const getLectureById = (id) => api.get(`/summary/${id}`);
export const deleteLecture = (id) => api.delete(`/summary/${id}`);

// ────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────
export const generateTest = (data) => api.post('/test/generate', data);
export const getTests = (params) => api.get('/test', { params });
export const getTestById = (id) => api.get(`/test/${id}`);
export const deleteTest = (id) => api.delete(`/test/${id}`);

// ────────────────────────────────────────────────
// Code Check
// ────────────────────────────────────────────────
export const checkCode = (data) => api.post('/code/check', data);

// ────────────────────────────────────────────────
// Cheat Sheet
// ────────────────────────────────────────────────
export const createCheatSheet = (data) => api.post('/cheatsheet', data);

// ────────────────────────────────────────────────
// Exam — новые и существующие функции
// ────────────────────────────────────────────────
export const startExam = (data) => api.post('/exam/start', data);
export const getExamResults = (id) => api.get(`/exam/results/${id}`);
export const getExams = (params) => api.get('/exam', { params });

// НОВОЕ: все завершённые экзамены по конкретному тесту (для ревью/истории)
export const getExamsByTest = async (testId) => {
  try {
    const res = await api.get(`/exam/test/${testId}`);
    return res.data;
  } catch (error) {
    console.error('Ошибка при получении экзаменов по тесту:', error);
    throw error;
  }
};

// НОВОЕ: детальная информация по одному экзамену (если нужно открыть конкретную попытку)
export const getExamById = async (examId) => {
  try {
    const res = await api.get(`/exam/results/${examId}`);
    return res.data;
  } catch (error) {
    console.error('Ошибка при получении экзамена:', error);
    throw error;
  }
};

export default api;