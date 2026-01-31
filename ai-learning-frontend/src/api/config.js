import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  withCredentials: true 
  });

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle logout or redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;