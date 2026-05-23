import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import studentReducer from "../features/students/studentSlice";
import teacherReducer from "../features/teachers/teacherSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    teachers: teacherReducer,
  },
});

export default store;
