// src/features/attendance/attendanceSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllAttendances,
  addAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByDate,
  getAttendanceByStudent,
} from "../../api/attendanceAPI";

// ─────────────────────────────────────────────────────────────
// THUNKS — async actions that talk to your backend
// Think of thunks as "smart functions" that:
// 1. Call the API
// 2. On success → dispatch fulfilled → update state
// 3. On failure → dispatch rejected → show error
// ─────────────────────────────────────────────────────────────

// ── Thunk 1: Fetch ALL attendance ─────────────────────────────
export const fetchAttendances = createAsyncThunk(
  "attendance/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllAttendances();

      // ADD THIS TEMPORARILY
      console.log("Full response:", response);
      console.log("Response data:", response.data);

      return response.data;
    } catch (error) {
      // ADD THIS TOO
      console.log("Error:", error);
      return rejectWithValue("Failed to load attendance records");
    }
  },
);
// ── Thunk 2: Fetch by Date ────────────────────────────────────
export const fetchAttendanceByDate = createAsyncThunk(
  "attendance/fetchByDate",
  async (date, { rejectWithValue }) => {
    try {
      const response = await getAttendanceByDate(date);
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to filter by date");
    }
  },
);

// ── Thunk 3: Fetch by Student ─────────────────────────────────
export const fetchAttendanceByStudent = createAsyncThunk(
  "attendance/fetchByStudent",
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await getAttendanceByStudent(studentId);
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to filter by student");
    }
  },
);

// ── Thunk 4: Add Attendance ───────────────────────────────────
export const createAttendance = createAsyncThunk(
  "attendance/create",
  async (attendanceData, { rejectWithValue }) => {
    try {
      const response = await addAttendance(attendanceData);
      return response.data;
    } catch (error) {
      // WHY this specific error message extraction?
      // Your backend throws InvalidOperationException with a message
      // like "Attendance already exists for this student"
      // error.response.data contains that message
      return rejectWithValue(
        error.response?.data || "Failed to add attendance",
      );
    }
  },
);

// ── Thunk 5: Edit Attendance ──────────────────────────────────
export const editAttendance = createAsyncThunk(
  "attendance/edit",
  async ({ id, attendanceData }, { rejectWithValue }) => {
    try {
      const response = await updateAttendance(id, attendanceData);
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to update attendance");
    }
  },
);

// ── Thunk 6: Delete Attendance ────────────────────────────────
export const removeAttendance = createAsyncThunk(
  "attendance/remove",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAttendance(id);
      return id; // WHY return id? So we know WHICH record to remove from state
    } catch (error) {
      return rejectWithValue("Failed to delete attendance");
    }
  },
);

// ─────────────────────────────────────────────────────────────
// SLICE — defines your state shape and how it changes
// ─────────────────────────────────────────────────────────────
export const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    attendances: [], // the list shown in the table
    loading: false, // true while fetching
    error: null, // fetch error message

    submitting: false, // true while adding/editing
    submitError: null, // add/edit error message

    deleting: false, // true while deleting
  },

  reducers: {
    // WHY clearSubmitError?
    // When the modal opens, we clear the old error
    // so a previous error doesn't show on a fresh form
    clearSubmitError: (state) => {
      state.submitError = null;
    },
  },

  extraReducers: (builder) => {
    // ── Fetch All ─────────────────────────────────────────────
    builder
      .addCase(fetchAttendances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendances.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances = action.payload;
      })
      .addCase(fetchAttendances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Fetch By Date (same pattern — replaces the list) ─────
      .addCase(fetchAttendanceByDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances = action.payload; // replaces the whole list
      })
      .addCase(fetchAttendanceByDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Fetch By Student ──────────────────────────────────────
      .addCase(fetchAttendanceByStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceByStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances = action.payload;
      })
      .addCase(fetchAttendanceByStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Create ────────────────────────────────────────────────
      .addCase(createAttendance.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(createAttendance.fulfilled, (state, action) => {
        state.submitting = false;
        // Add to beginning of list — newest first
        state.attendances.unshift(action.payload);
      })
      .addCase(createAttendance.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // ── Edit ──────────────────────────────────────────────────
      .addCase(editAttendance.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(editAttendance.fulfilled, (state, action) => {
        state.submitting = false;
        // WHY findIndex + replace?
        // We don't refetch everything — we just update the
        // one changed item in the existing list. Faster!
        const index = state.attendances.findIndex(
          (a) => a.id === action.payload.id,
        );
        if (index !== -1) {
          state.attendances[index] = action.payload;
        }
      })
      .addCase(editAttendance.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // ── Delete ────────────────────────────────────────────────
      .addCase(removeAttendance.pending, (state) => {
        state.deleting = true;
      })
      .addCase(removeAttendance.fulfilled, (state, action) => {
        state.deleting = false;
        // WHY filter? Remove the deleted item without refetching
        state.attendances = state.attendances.filter(
          (a) => a.id !== action.payload,
        );
      })
      .addCase(removeAttendance.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearSubmitError } = attendanceSlice.actions;
export default attendanceSlice.reducer;

// ─────────────────────────────────────────────────────────────
// SELECTORS — clean way to read state in components
// WHY selectors? If you rename a state property, you only
// fix it here — not in every component that uses it.
// ─────────────────────────────────────────────────────────────
export const selectAttendances = (state) => state.attendance.attendances ?? [];
export const selectAttendanceLoading = (state) => state.attendance.loading;
export const selectAttendanceError = (state) => state.attendance.error;
export const selectAttendanceSubmitting = (state) =>
  state.attendance.submitting;
export const selectAttendanceSubmitError = (state) =>
  state.attendance.submitError;
export const selectAttendanceDeleting = (state) => state.attendance.deleting;
