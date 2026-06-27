// src/api/departmentsAPI.js
import axiosInstance from "./axiosInstance";

// ── WHY a dedicated API file? ─────────────────────────────────────────────
// This file is the ONLY place that knows:
//   - The backend URL (/api/Department)
//   - Which HTTP verb to use (GET, POST, PUT, DELETE)
//   - What parameters to send
//
// Slices and components CALL these functions.
// If the URL changes (e.g. /api/Department → /api/departments),
// you fix it in ONE place — not scattered across your app.
// This is the Single Responsibility Principle applied to API calls.
// ─────────────────────────────────────────────────────────────────────────

// GET /api/Department
// WHY no pagination for departments?
//   Departments are small, stable data (10–20 records max).
//   Loading them all at once is fine — no need for the overhead of pagination.
//   Compare: Students might be 10,000+, so they need pagination.
export const getAllDepartments = () => axiosInstance.get("/api/Department");

// GET /api/Department/:id
export const getDepartmentById = (id) =>
  axiosInstance.get(`/api/Department/${id}`);

// GET /api/Department/:id/statistics  ← the new endpoint you just built
// WHY a separate function (not combined with getDepartmentById)?
//   They return different shapes of data (DepartmentDTO vs DepartmentStatisticsDTO).
//   Separate functions = clear intent, easy to call independently.
export const getDepartmentStatistics = (id) =>
  axiosInstance.get(`/api/Department/${id}/statistics`);

// POST /api/Department
export const addDepartment = (departmentData) =>
  axiosInstance.post("/api/Department", departmentData);

// PUT /api/Department?id=:id
// WHY query param and not route param for update?
//   Your DepartmentController has [HttpPut] without {id} in the route.
//   So it expects ?id=1 as a query string, not /api/Department/1.
//   Always match what the controller expects.
export const updateDepartment = (id, departmentData) =>
  axiosInstance.put(`/api/Department?id=${id}`, departmentData);

// DELETE /api/Department/:id
export const deleteDepartment = (id) =>
  axiosInstance.delete(`/api/Department/${id}`);
