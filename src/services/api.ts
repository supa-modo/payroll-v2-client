import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const storedAuth = localStorage.getItem("payroll-auth-storage");
    if (storedAuth) {
      try {
        const { state } = JSON.parse(storedAuth);
        if (state?.accessToken) {
          config.headers.Authorization = `Bearer ${state.accessToken}`;
        }
      } catch (e) {
        console.error("Error parsing auth storage:", e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip token refresh for login endpoint
    if (originalRequest.url?.includes("/auth/login")) {
      return Promise.reject(error);
    }

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const storedAuth = localStorage.getItem("payroll-auth-storage");
        if (storedAuth) {
          const { state } = JSON.parse(storedAuth);
          if (state?.refreshToken) {
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken: state.refreshToken,
            });

            const { accessToken } = response.data;

            // Update localStorage
            const newState = {
              ...state,
              accessToken,
            };
            localStorage.setItem(
              "payroll-auth-storage",
              JSON.stringify({ state: newState })
            );

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Clear auth on refresh failure
        localStorage.removeItem("payroll-auth-storage");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

