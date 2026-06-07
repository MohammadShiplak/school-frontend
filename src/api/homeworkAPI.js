import axiosInstance from "./axiosInstance";

export const getAllHomework = (pageNumber = 1, pageSize = 10) => {
  return axiosInstance.get(
    `/api/homework?pageNumber=${pageNumber}&pageSize=${pageSize}`,
  );
};

// GET /api/homework/teacher/5
export const getHomeworkByTeacher = (teacherId) => {
  return axiosInstance.get(`/api/homework/teacher/${teacherId}`);
};

// GET /api/homework/class/3
export const getHomeworkByClass = (classId) => {
  return axiosInstance.get(`/api/homework/class/${classId}`);
};

// GET /api/homework/42
export const getHomeworkById = (id) => {
  return axiosInstance.get(`/api/homework/${id}`);
};

// POST /api/homework
// WHY spread ...getAuthHeader(): The POST also needs Content-Type: application/json,
//   but Axios sets that automatically when you pass a JS object as the body.
//   We only need to add the Authorization header.
export const addHomework = (homeworkData) => {
  const formData = buildHomewokFormData(homeworkData);

  return axiosInstance.post("/api/homework", formData);
};

// PUT /api/homework/42
export const updateHomework = (id, homeworkData) => {
  const formData = buildHomewokFormData(homeworkData);

  return axiosInstance.put(`/api/homework/${id}`, formData);
};

// DELETE /api/homework/42
export const deleteHomework = (id) => {
  return axiosInstance.delete(`/api/homework/${id}`);
};
export const deleteHomeworkFile = (id) => {
  return axiosInstance.delete(`/api/Homework/${id}/file`);
};

const buildHomewokFormData = (homeworkData) => {
  const formData = new FormData();

  formData.append("teacherId", String(homeworkData.teacherId));
  formData.append("title", String(homeworkData.title));
  formData.append("dueDate", String(homeworkData.dueDate));
  formData.append("status", String(homeworkData.status));

  if (homeworkData.classId) {
    formData.append("classId", String(homeworkData.classId));
  }

  if (homeworkData.subjectId) {
    formData.append("subjectId", String(homeworkData.subjectId));
  }

  if (homeworkData.description) {
    formData.append("description", homeworkData.description);
  }

  if (homeworkData.assignmentFile instanceof File) {
    formData.append("assignmentFile", homeworkData.assignmentFile);
  }

  return formData;
};
