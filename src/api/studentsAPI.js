// src/api/studentsAPI.js
import axiosInstance from "./axiosInstance";

// ── Get all students (paginated) ─────────────────────────────
export const getAllStudents = (pageNumber = 1, pageSize = 10) =>
  axiosInstance.get(
    `/api/Student?pageNumber=${pageNumber}&pageSize=${pageSize}`,
  );

// get one student by ID

export const GetStudentById = (id) => axiosInstance.get(`/api/Student/${id}`);

// Add new student

export const addStudent = (studentData) =>
  axiosInstance.post("/api/Student", studentData);

// update student
export const updateStudent = (id, studentData) =>
  axiosInstance.put(`/api/Student/${id}`, studentData); // ✅ fixed
// delete Student
export const deleteStudent = (id) => axiosInstance.delete(`/api/Student/${id}`);
