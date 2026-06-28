// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import studentReducer from "../features/students/studentSlice";
import teacherReducer from "../features/teachers/teacherSlice";
import attendanceReducer from "../features/attendance/attendanceSlice";
import homeworkReducer from "../features/homework/homeworkSlice";
import notificationReducer from "../features/notifications/notificationSlice";

// ── NEW: Department reducer ──────────────────────────────────────────────
// WHY add it here?
//   configureStore is the SINGLE place that registers all slices.
//   The key name "departments" here is what selectors reference:
//     state.departments.departments  ← matches selectDepartments
//     state.departments.loading      ← matches selectDepartmentsLoading
//   If the key here doesn't match what the selector reads, you get undefined.
//   This was key learning #3 from your project history — Redux store key consistency.
import departmentReducer from "../features/departments/departmentSlice";
import DashboardReducer from "../features/Dashboard/DashboardSlice";
import attendanceAlertSlicereducer from "../features/attendanceAlert/attendanceAlertSlice";
import progressSlicereducer from "../features/progress/progressSlice";
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
  },
});

export default store;
