import axios from 'axios';
import API_BASE_URL from '../config/api.config';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Optional: Add a response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response, // Simply return the response if it's successful
  (error) => {
    // Log detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error: No response received', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
