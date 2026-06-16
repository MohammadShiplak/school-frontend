// File: src/features/progress/progressSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  calculateProgress,
  getStudentProgress,
  getCourseProgress,
} from "../../api/progressAPI";

// ── THUNK 1: Calculate progress ──────────────────────────────────
// WHY { studentId, courseId } as one object?
// createAsyncThunk only accepts ONE argument.
// We bundle both into an object and destructure inside.
export const triggerCalculation = createAsyncThunk(
  "progress/calculate",
  async ({ studentId, courseId }, { rejectWithValue }) => {
    try {
      const response = await calculateProgress(studentId, courseId);
      return response.data; // returns the CourseProgressDTO
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to calculate progress",
      );
    }
  },
);

// ── THUNK 2: Load all courses progress for a student ─────────────
export const fetchStudentProgress = createAsyncThunk(
  "progress/fetchByStudent",
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await getStudentProgress(studentId);
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to load student progress");
    }
  },
);

// ── THUNK 3: Load all students' progress for a course ────────────
export const fetchCourseProgress = createAsyncThunk(
  "progress/fetchByCourse",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await getCourseProgress(courseId);
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to load course progress");
    }
  },
);

// ── SLICE ─────────────────────────────────────────────────────────
const progressSlice = createSlice({
  name: "progress",
  initialState: {
    progressList: [], // current list displayed
    loading: false,
    error: null,
    calculating: false, // true while POST calculate is running
    calcError: null,
    lastCalculated: null, // the result from the last calculation
  },
  reducers: {
    clearCalcError: (state) => {
      state.calcError = null;
    },
    clearProgress: (state) => {
      state.progressList = [];
    },
  },
  extraReducers: (builder) => {
    // ── Calculate ───────────────────────────────────────────────
    builder
      .addCase(triggerCalculation.pending, (state) => {
        state.calculating = true;
        state.calcError = null;
      })
      .addCase(triggerCalculation.fulfilled, (state, action) => {
        state.calculating = false;
        state.lastCalculated = action.payload;
        // Also update it in the list if it's already there
        const idx = state.progressList.findIndex(
          (p) =>
            p.studentId === action.payload.studentId &&
            p.courseId === action.payload.courseId,
        );
        if (idx !== -1) {
          state.progressList[idx] = action.payload;
        } else {
          state.progressList.unshift(action.payload);
        }
      })
      .addCase(triggerCalculation.rejected, (state, action) => {
        state.calculating = false;
        state.calcError = action.payload;
      })

      // ── Fetch by Student ────────────────────────────────────────
      .addCase(fetchStudentProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.progressList = action.payload;
      })
      .addCase(fetchStudentProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Fetch by Course ─────────────────────────────────────────
      .addCase(fetchCourseProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.progressList = action.payload;
      })
      .addCase(fetchCourseProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCalcError, clearProgress } = progressSlice.actions;
export default progressSlice.reducer;

// ── SELECTORS ─────────────────────────────────────────────────────
export const selectProgressList = (state) => state.progress.progressList;
export const selectProgressLoading = (state) => state.progress.loading;
export const selectProgressError = (state) => state.progress.error;
export const selectCalculating = (state) => state.progress.calculating;
export const selectCalcError = (state) => state.progress.calcError;
export const selectLastCalculated = (state) => state.progress.lastCalculated;
