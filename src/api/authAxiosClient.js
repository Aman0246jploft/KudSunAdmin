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

// Response interceptor - handle API-level errors and HTTP errors uniformly
authAxiosClient.interceptors.response.use(
  (response) => {
    const { data } = response;

    if (data?.status === false) {
      const customError = new Error(data.message || 'Something went wrong');
      customError.responseCode = data.responseCode || 400;
      customError.isHandled = true;
      throw customError;
    }

    return response;
  },
  (error) => {
    const customError = new Error(
      error.response?.data?.message || error.message || 'Network error'
    );
    customError.responseCode =
      error.response?.data?.responseCode || error.response?.status || 500;
    customError.isHandled = true;
    throw customError;
  }
);

export default authAxiosClient;
