import axios from 'axios';
import { baseURL } from './baseUrl';
import { useAuth } from '../auth/useAuth';

const authAxiosClient = axios.create({
  baseURL: baseURL,
  timeout: 10000,
});

// Request interceptor to add auth token
authAxiosClient.interceptors.request.use((config) => {
  const token = useAuth().user;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login helper
const redirectToLogin = () => {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// Response interceptor
authAxiosClient.interceptors.response.use(
  (response) => {
    const { data } = response;

    if (data?.status === false) {
      if (data.message === 'Authorization token missing' && data.responseCode === 401) {
        redirectToLogin();
      }

      const customError = new Error(data.message || 'Something went wrong');
      customError.responseCode = data.responseCode || 400;
      customError.isHandled = true;
      throw customError;
    }

    return response;
  },
  (error) => {
    const message = error?.response?.data?.message;
    const responseCode = error?.response?.data?.responseCode || error?.response?.status;

    if (message === 'Authorization token missing' && responseCode === 401) {
      redirectToLogin();
    }

    const customError = new Error(message || error.message || 'Network error');
    customError.responseCode = responseCode || 500;
    customError.isHandled = true;
    throw customError;
  }
);

export default authAxiosClient;
