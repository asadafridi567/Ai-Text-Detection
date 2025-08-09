// axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8000/api/",
  withCredentials: true, // Only if using cookies
});

// Attach token before every request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;