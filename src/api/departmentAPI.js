// src/api/departmentsAPI.js
import axiosInstance from "./axiosInstance";

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
