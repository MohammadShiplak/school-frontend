// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// _________ Helper : decode token to get user info _______________

// The JWT token contains hidden info like name,email, role
// jwtDecode() extracts that info so we can show it in the UI

const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

// ── Async Thunk: Login ───────────────────────────────────────
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/Auth/login`,
        credentials,
      );
      localStorage.setItem("token", response.data.token);
      return response.data.token;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Invalid email or password",
      );
    }
  },
);
// Register
export const registerUser = createAsyncThunk(
  "auth/register", // unique name for this action
  async (userData, { rejectWithValue }) => {
    // userData = { userName, email, password, role, isActive }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/Auth/register`,
        userData, // send form data to backend
      );
      return response.data; // "User registered successfully"
    } catch (error) {
      // error.response.data is the message from your backend
      return rejectWithValue(
        error.response?.data || "Registration failed. Try again.",
      );
    }
  },
);
// ── Slice ────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("token") || null,

    user: localStorage.getItem("token")
      ? decodeToken(localStorage.getItem("toke"))
      : null,

    //-- Register state
    loading: false,
    error: null,
    registerLoading: false,
    registerError: null,
    registerSuccess: false,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.error = null;
      state.user = null;
      state.loading = false; // ← added
      localStorage.removeItem("token");
    },

    // _____ reset register state when leaving a page

    resetRegister: (state) => {
      state.registerLoading = false;
      state.registerError = null;
      state.registerSuccess = false;
    },
  },
  extraReducers: (builder) => {
    // _________________ login cases _____________
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload;
        // Decode token and save user info to state
        state.user = decodeToken(action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ______Regsiter cases _______________

      .addCase(registerUser.pending, (state) => {
        state.registerLoading = true;
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.registerLoading = false;
        state.registerSuccess = true;
        state.registerError = null;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.registerLoading = false;
        state.registerSuccess = false;
        state.registerError = action.payload;
      });
  },
});

export const { logout, resetRegister } = authSlice.actions;
export default authSlice.reducer;

// ── Selectors ────────────────────────────────────────────────
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => !!state.auth.token;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectUser = (state) => state.auth.user;
//Register selectors

export const selectRegisterLoading = (state) => state.auth.registerLoading;
export const selectRegisterError = (state) => state.auth.registerError;
export const selectRegisterSuccess = (state) => state.auth.registerSuccess;
