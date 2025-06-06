import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,      // http://localhost:3000/api
  withCredentials: false                     // we’re using bearer tokens, no cookies
});

// Add token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');      // auto-logout
      window.location.reload();              // or redirect to /login
    }
    return Promise.reject(err);
  }
);


export default api;
