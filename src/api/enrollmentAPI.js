// src/api/enrollmentAPI.js
// ─────────────────────────────────────────────────────────────────
// WHY a dedicated API file:
//   Follows your established pattern: one API file per feature.
//   studentsAPI.js, teachersAPI.js, homeworkAPI.js — same idea.
//   Every function is a thin wrapper around axiosInstance.
//   No business logic here — just "talk to the server."
// ─────────────────────────────────────────────────────────────────

import axiosInstance from "./axiosInstance";

// Enroll a student in a class
// payload = { studentId: number, classId: number }
export const enrollStudent = (payload) =>
  axiosInstance.post("/api/ClassEnrollment", payload);

// Remove a student from a class
export const unenrollStudent = (studentId, classId) =>
  axiosInstance.delete(`/api/ClassEnrollment/${studentId}/${classId}`);

// Get all students in a class
export const getStudentsByClass = (classId) =>
  axiosInstance.get(`/api/ClassEnrollment/class/${classId}`);

// Get all classes a student is enrolled in
export const getClassesByStudent = (studentId) =>
  axiosInstance.get(`/api/ClassEnrollment/student/${studentId}`);
