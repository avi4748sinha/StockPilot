import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("StockPilot_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("StockPilot_token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error) {
  if (!error?.response) {
    return "Unable to connect to the server. Please check if the backend is running.";
  }

  const detail = error.response.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || "Invalid input").join(", ");
  }
  if (typeof detail === "string") {
    return detail;
  }
  if (error.response.status >= 500) {
    return "Something went wrong on the server. Please try again.";
  }
  return "Please check the form and try again.";
}

export default api;
