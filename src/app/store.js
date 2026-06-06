import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import studentReducer from "../features/students/studentSlice";
import teacherReducer from "../features/teachers/teacherSlice";
import attendanceReducer from "../features/attendance/attendanceSlice";
import homeworkReducer from "../features/homework/homeworkSlice";
import notificationReducer from "../features/notifications/notificationSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    teachers: teacherReducer,
    attendance: attendanceReducer,
    homework: homeworkReducer,
    notifications: notificationReducer,
  },
});

export default store;
