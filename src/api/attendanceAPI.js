import axiosInstance from "./axiosInstance";

export const getAllAttendances = () => {
  return axiosInstance.get(`/api/Attendance`);
};

export const getAttendanceById = (id) => {
  return axiosInstance.get(`/api/Attendance/${id}`);
};
// we decode the date to ensure that any special characters in the date string are properly handled in the URL. This is important to prevent issues with URL parsing and to ensure that the server receives the correct date value.
export const getAttendanceByDate = (date) => {
  return axiosInstance.get(`/api/Attendance/date/${encodeURIComponent(date)}`);
};

export const getAttendanceByStudent = (studentId) => {
  return axiosInstance.get(`/api/Attendance/student/
    ${studentId}`);
};

export const updateAttendance = (id, attendanceDate) => {
  return axiosInstance.put(`/api/Attendance/${id}`, attendanceDate);
};

export const deleteAttendance = (id) => {
  return axiosInstance.delete(`/api/Attendance/${id}`);
};

export const addAttendance = (attendanceData) => {
  return axiosInstance.post("/api/Attendance", attendanceData);
};
