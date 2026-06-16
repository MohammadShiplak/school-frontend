// File: src/api/progressAPI.js
import axiosInstance from "./axiosInstance";

// Trigger calculation for one student + course
// WHY POST? It writes to the DB (saves the result).
export const calculateProgress = (studentId, courseId) =>
  axiosInstance.post(
    `/api/progress/calculate?studentId=${studentId}&courseId=${courseId}`,
  );

// Get saved progress for one student in one course
export const getProgress = (studentId, courseId) =>
  axiosInstance.get(`/api/progress/student/${studentId}/course/${courseId}`);

// Get ALL courses progress for a student
export const getStudentProgress = (studentId) =>
  axiosInstance.get(`/api/progress/student/${studentId}`);

// Get ALL students' progress in a course
export const getCourseProgress = (courseId) =>
  axiosInstance.get(`/api/progress/course/${courseId}`);
