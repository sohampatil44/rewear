const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001/api", 
});

// ✅ Attach token automatically if logged in
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
