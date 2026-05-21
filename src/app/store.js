import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import studentReducer from "../features/students/studentSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
  },
});

export default store;
