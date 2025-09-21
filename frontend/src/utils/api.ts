import API_BASE_URL from '../config/api.config';

export const fetchWithHeaders = async (url: string, options: RequestInit = {}) => {
  const headers = {
    ...options.headers,
    'ngrok-skip-browser-warning': 'true',
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  return response;
};
