// axios.js
import axios from "axios";

// Read from env instead of hardcoding. Set REACT_APP_API_URL as a Docker
// build ARG (see Dockerfile) or in .env.production. Falls back to localhost
// only for local `npm start` dev outside Docker.
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const instance = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  withCredentials: true, // Only if using cookies
  timeout: 15000, // fail fast instead of hanging forever on a dead backend
});

// ---- Request interceptor: attach token ----
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response interceptor: handle 401s (expired/invalid token) ----
let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
};

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network error / backend unreachable (no response object at all)
    if (!error.response) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refresh_token");

    // Only attempt refresh once per request, only on 401, and only if we
    // actually have a refresh token to try.
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      refreshToken
    ) {
      if (isRefreshing) {
        // queue this request until the in-flight refresh finishes
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        localStorage.setItem("access_token", data.access);
        instance.defaults.headers.Authorization = `Bearer ${data.access}`;
        originalRequest.headers.Authorization = `Bearer ${data.access}`;

        processQueue(null, data.access);
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/signin";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
export { API_BASE_URL };