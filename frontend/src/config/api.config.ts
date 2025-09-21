const API_BASE_URL = import.meta.env.VITE_PRODUCTION_API_URL;

if (!API_BASE_URL) {
  throw new Error("Configuration Error: VITE_PRODUCTION_API_URL is not set. Please check your .env file.");
}

export default API_BASE_URL;