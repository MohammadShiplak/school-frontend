// FILE: src/api/attendanceAlertAPI.js
// ═══════════════════════════════════════════════════════════════
// WHY a separate API file (not putting calls directly in the slice)?
//   Same reason as your other API files (studentsAPI.js, homeworkAPI.js).
//   This file is ONLY responsible for making HTTP calls.
//   The slice is responsible for state management.
//   Separation of concerns = easier to maintain and test.
//
// axiosInstance already has:
//   - baseURL set to your API
//   - JWT token interceptor (auto-attaches Authorization header)
//   You get both for free by importing it.
// ═══════════════════════════════════════════════════════════════

import axiosInstance from "./axiosInstance";

// ── GET all alerts (full report) ───────────────────────────────
export const getAllAlerts = () => {
  return axiosInstance.get("/api/AttendanceAlert");
};

// ── GET only active (unresolved) alerts ───────────────────────
export const getActiveAlerts = () => {
  return axiosInstance.get("/api/AttendanceAlert/active");
};

// ── GET alert count (for the badge number) ────────────────────
// Returns a single integer, e.g. 5
export const getAlertCount = () => {
  return axiosInstance.get("/api/AttendanceAlert/count");
};

// ── GET alerts for one specific student ───────────────────────
export const getAlertsByStudent = (studentId) => {
  return axiosInstance.get(`/api/AttendanceAlert/student/${studentId}`);
};

// ── PUT resolve an alert ──────────────────────────────────────
// resolveData = { status: 2, notes: "Called parent, excused" }
// WHY PUT: We're updating an existing resource (the alert's status).
export const resolveAlert = (alertId, resolveData) => {
  return axiosInstance.put(
    `/api/AttendanceAlert/${alertId}/resolve`,
    resolveData,
  );
};
