import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001/api'
});

// Attach JWT token to every request if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If token is invalid/expired, log the user out automatically
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ---- Auth ----
export const loginRequest = (data) => API.post('/auth/login', data);
export const registerRequest = (data) => API.post('/auth/register', data);
export const getMeRequest = () => API.get('/auth/me');

// ---- Dashboard ----
export const getDashboardStats = () => API.get('/dashboard/stats');

// ---- Kanban Boards ----
export const getKanbanBoard = (id) => API.get(`/v1/kanban/boards/${id}`);

// ---- Generic entity CRUD ----
export const getAll = (entity, search = '') => API.get(`/${entity}${search ? `?search=${search}` : ''}`);
export const getOne = (entity, id) => API.get(`/${entity}/${id}`);
export const createRecord = (entity, data) => API.post(`/${entity}`, data);
export const updateRecord = (entity, id, data) => API.put(`/${entity}/${id}`, data);
export const deleteRecord = (entity, id) => API.delete(`/${entity}/${id}`);

export default API;
