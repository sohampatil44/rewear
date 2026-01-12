import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001",
  // ✅ NO headers here - they cause CORS issues
});

// ✅ Attach token + timestamp
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  
  // ✅ Timestamp prevents caching (no CORS issues)
  req.params = {
    ...req.params,
    _t: Date.now()
  };
  
  console.log(`📤 ${req.method.toUpperCase()} ${req.url}`);
  return req;
});

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