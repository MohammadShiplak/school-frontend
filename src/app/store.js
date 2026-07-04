// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import studentReducer from "../features/students/studentSlice";
import teacherReducer from "../features/teachers/teacherSlice";
import attendanceReducer from "../features/attendance/attendanceSlice";
import homeworkReducer from "../features/homework/homeworkSlice";
import notificationReducer from "../features/notifications/notificationSlice";
import departmentReducer from "../features/departments/departmentSlice";
import DashboardReducer from "../features/Dashboard/DashboardSlice";
import attendanceAlertSlicereducer from "../features/attendanceAlert/attendanceAlertSlice";
import progressSlicereducer from "../features/progress/progressSlice";
import enrollmentSliceReducer from "../features/enrollment/enrollmentSlice";
import chatbotReducer from "../features/chatbot/chatbotSlice";
import classSubjectSliceReducer from "../features/classSubject/classSubjectSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    teachers: teacherReducer,
    attendance: attendanceReducer,
    homework: homeworkReducer,
    notifications: notificationReducer,
    departments: departmentReducer, // ← registered as "departments"
    dashboard: DashboardReducer,
    attendanceAlerts: attendanceAlertSlicereducer,
    progress: progressSlicereducer,
    enrollment: enrollmentSliceReducer,
    chatbot: chatbotReducer,
    classSubject: classSubjectSliceReducer, // ← registered as "classSubject"
  },
});

export default store;
