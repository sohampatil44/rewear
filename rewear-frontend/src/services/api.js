import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001",
  headers: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  }
});

// ✅ Attach token automatically + add timestamp to bust cache
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  
  // ✅ Add timestamp to prevent caching
  req.params = {
    ...req.params,
    _t: Date.now()
  };
  
  console.log(`📤 ${req.method.toUpperCase()} ${req.url}`);
  return req;
});

// ✅ Log responses
API.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

export default API;