import { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom'; // For v5
import axios from 'axios';

// Base URL for your Django API
const API_BASE_URL = "http://localhost:8000/api";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Stores user details like username/email
  const [loading, setLoading] = useState(true); // To indicate if auth check is in progress
  const history = useHistory(); // Initialize useHistory

  // Function to check authentication status (JWT or Session)
  const checkAuthStatus = useCallback(async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    // 1. Check for JWT authentication
    if (accessToken) {
      try {
        // You'd typically have an endpoint like /api/user/me/ that validates the token
        // and returns user info. For now, we'll just assume token validity.
        // In a real app, you'd add an interceptor for token refresh.
        const response = await axios.get(`${API_BASE_URL}/protected/`, { // Using your existing protected endpoint
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (response.status === 200) {
          setIsAuthenticated(true);
          // Assuming the protected endpoint returns some user info, or you fetch it separately
          setUser({ username: "Authenticated User (JWT)" }); // Placeholder
          setLoading(false);
          return { isAuthenticated: true, method: 'jwt' };
        }
      } catch (jwtError) {
        console.error("JWT validation failed:", jwtError.response ? jwtError.response.data : jwtError.message);
        // Attempt to refresh token if it's expired/invalid
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh: refreshToken });
            localStorage.setItem("access_token", refreshResponse.data.access);
            // Retry the protected call or just set authenticated
            setIsAuthenticated(true);
            setUser({ username: "Authenticated User (JWT Refreshed)" });
            setLoading(false);
            return { isAuthenticated: true, method: 'jwt-refreshed' };
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError.response ? refreshError.response.data : refreshError.message);
            // Fall through to session check if JWT refresh fails
          }
        }
      }
    }

    // 2. Check for Session authentication if JWT failed or not present
    try {
      // This endpoint should return 200 if a session is active, 401/403 otherwise
      const response = await axios.get(`${API_BASE_URL}/check-session/`, {
        withCredentials: true, // Important to send session cookies
      });
      if (response.status === 200) {
        setIsAuthenticated(true);
        // In a real app, this endpoint might return user details
        setUser({ username: "Authenticated User (Session)" }); // Placeholder
        setLoading(false);
        return { isAuthenticated: true, method: 'session' };
      }
    } catch (sessionError) {
      console.error("Session check failed:", sessionError.response ? sessionError.response.data : sessionError.message);
      // Session is not active
    }

    // If neither JWT nor Session is active
    setIsAuthenticated(false);
    setUser(null);
    setLoading(false);
    return { isAuthenticated: false };
  }, []); // Empty dependency array for useCallback

  // Unified Logout function
  const logout = useCallback(async () => {
    // 1. Attempt JWT logout (blacklist refresh token)
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (accessToken && refreshToken) {
      try {
        await axios.post(`${API_BASE_URL}/logout/`, { refresh_token: refreshToken }, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log("JWT logout successful on backend.");
      } catch (err) {
        console.error("JWT Logout API error:", err.response ? err.response.data : err.message);
      }
    }

    // 2. Attempt Session logout (invalidate Django session)
    try {
      await axios.post(`${API_BASE_URL}/session-logout/`, {}, { withCredentials: true });
      console.log("Django session logout successful on backend.");
    } catch (err) {
      console.error("Django Session Logout API error:", err.response ? err.response.data : err.message);
    }

    // Clear all client-side stored data
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("userDetails");
    setIsAuthenticated(false);
    setUser(null);
    history.push("/signin"); // Redirect to login page
  }, [history]); // Dependency array for useCallback

  // Initial check on component mount (once)
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]); // Run once on mount

  return { isAuthenticated, user, logout, loading, checkAuthStatus };
}