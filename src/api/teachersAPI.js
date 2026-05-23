import axiosInstance from "./axiosInstance";

// ── Get all students (paginated) ─────────────────────────────
export const getAllTeachers = (pageNumber = 1, pageSize = 10) =>
  axiosInstance.get(
    `/api/Teacher?pageNumber=${pageNumber}&pageSize=${pageSize}`,
  );

// get one student by ID

export const GetTeacherById = (id) => axiosInstance.get(`/api/Teacher/${id}`);

// Add new student

export const addTeacher = (teacherData) =>
  axiosInstance.post("/api/Teacher", teacherData);

// update student
export const updateTeacher = (id, teacherData) =>
  axiosInstance.put(`/api/Teacher/${id}`, teacherData); // ✅ fixed
// delete Student
export const deleteTeacher = (id) => axiosInstance.delete(`/api/Teacher/${id}`);
