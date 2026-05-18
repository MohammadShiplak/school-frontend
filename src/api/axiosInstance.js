// src/api/axiosInstance.js

import axios from "axios";

// Create one Axios instance with your API base URL
const axiosInstance = axios.create({
  baseURL: "https://localhost:7195", // 👈 change port to match yours
});

// ── Request Interceptor ──────────────────────────────────────
// Before EVERY request, this runs automatically
// It grabs the JWT token from Redux (via localStorage) and attaches it
axiosInstance.interceptors.request.use((config) => {
  // Get the token we saved after login
  const token = localStorage.getItem("token");

  // If token exists, add it to the Authorization header
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config; // continue with the request
});

export default axiosInstance;
