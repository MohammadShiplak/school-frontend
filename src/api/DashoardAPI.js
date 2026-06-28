// ═══════════════════════════════════════════════════════════════
// FILE: src/api/dashboardAPI.js
//
// WHY A DEDICATED API FILE?
//   Same pattern as studentsAPI.js, teachersAPI.js, etc.
//   The API file is the ONLY place that knows the URL.
//   If the URL changes, you fix it here — nowhere else.
// ═══════════════════════════════════════════════════════════════

import axiosInstance from "./axiosInstance";

// GET /api/Dashboard/stats
// Returns: DashboardStatsDTO
//
// WHY axiosInstance (not raw axios)?
//   axiosInstance has a request interceptor that automatically
//   attaches the JWT token. The dashboard requires authorization.
//   You defined this in axiosInstance.js.
export const getDashboardStats = () => {
  return axiosInstance.get("/api/Dashboard/stats");
};
