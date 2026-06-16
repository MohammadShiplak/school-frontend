// src/features/enrollment/enrollmentSlice.js
// ─────────────────────────────────────────────────────────────────
// WHY Redux for enrollment:
//   The enrollment list (who is in Class A) is shared data.
//   A ClassRoster page and a StudentProfile page both need it.
//   Redux lets both read from the same source without duplicate API calls.
// ─────────────────────────────────────────────────────────────────

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  enrollStudent,
  unenrollStudent,
  getStudentsByClass,
  getClassesByStudent,
} from "../../api/enrollmentAPI";

// ── THUNK 1: Enroll ──────────────────────────────────────────────
export const createEnrollment = createAsyncThunk(
  "enrollment/create",
  async ({ studentId, classId }, { rejectWithValue }) => {
    try {
      const response = await enrollStudent({ studentId, classId });
      return response.data; // ClassEnrollmentDTO
    } catch (error) {
      // WHY extract nested message:
      //   Your controller returns { message: "..." } on errors.
      //   error.response.data.message gets that string.
      return rejectWithValue(
        error.response?.data?.message || "Failed to enroll student.",
      );
    }
  },
);

// ── THUNK 2: Unenroll ────────────────────────────────────────────
export const removeEnrollment = createAsyncThunk(
  "enrollment/remove",
  async ({ studentId, classId }, { rejectWithValue }) => {
    try {
      await unenrollStudent(studentId, classId);
      // WHY return both IDs:
      //   After removal, we need to filter the state array.
      //   We need classId to find the right list, studentId to remove the entry.
      return { studentId, classId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove enrollment.",
      );
    }
  },
);

// ── THUNK 3: Fetch students in a class ───────────────────────────
export const fetchStudentsByClass = createAsyncThunk(
  "enrollment/fetchByClass",
  async (classId, { rejectWithValue }) => {
    try {
      const response = await getStudentsByClass(classId);
      return { classId, enrollments: response.data };
    } catch (error) {
      return rejectWithValue("Failed to load class roster.");
    }
  },
);

// ── SLICE ─────────────────────────────────────────────────────────
const enrollmentSlice = createSlice({
  name: "enrollment",

  initialState: {
    // WHY an object keyed by classId (not a flat array):
    //   You might view Class A's roster AND Class B's roster on the same page.
    //   Keying by classId keeps each class's students separate and easy to look up.
    //   enrollmentsByClass[3] = [...students in class 3]
    //   This is called a "normalized" state shape — a Redux best practice.
    enrollmentsByClass: {},

    loading: false,
    error: null,

    submitting: false, // true while enrolling
    submitError: null,

    deleting: false,
  },

  reducers: {
    clearEnrollmentError: (state) => {
      state.submitError = null;
    },
  },

  extraReducers: (builder) => {
    // ── Fetch by class ────────────────────────────────────────────
    builder
      .addCase(fetchStudentsByClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentsByClass.fulfilled, (state, action) => {
        state.loading = false;
        // Store under the classId key
        // action.payload = { classId: 3, enrollments: [...] }
        state.enrollmentsByClass[action.payload.classId] =
          action.payload.enrollments;
      })
      .addCase(fetchStudentsByClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Enroll ───────────────────────────────────────────────────
      .addCase(createEnrollment.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(createEnrollment.fulfilled, (state, action) => {
        state.submitting = false;
        const { classId } = action.payload;

        // WHY initialize array if it doesn't exist:
        //   If the class roster wasn't fetched yet, the key won't exist.
        //   Creating an empty array first prevents a crash on .push().
        if (!state.enrollmentsByClass[classId]) {
          state.enrollmentsByClass[classId] = [];
        }
        state.enrollmentsByClass[classId].push(action.payload);
      })
      .addCase(createEnrollment.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // ── Unenroll ─────────────────────────────────────────────────
      .addCase(removeEnrollment.pending, (state) => {
        state.deleting = true;
      })
      .addCase(removeEnrollment.fulfilled, (state, action) => {
        state.deleting = false;
        const { studentId, classId } = action.payload;

        // Remove that student from the class roster in state
        if (state.enrollmentsByClass[classId]) {
          state.enrollmentsByClass[classId] = state.enrollmentsByClass[
            classId
          ].filter((e) => e.studentId !== studentId);
        }
      })
      .addCase(removeEnrollment.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearEnrollmentError } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────
export const selectEnrollmentsByClass = (classId) => (state) =>
  // WHY a factory selector (function that returns a function):
  //   The classId is dynamic — it changes per page.
  //   A factory selector lets you call:
  //   useSelector(selectEnrollmentsByClass(3))
  //   and get Class 3's roster from state.
  state.enrollment.enrollmentsByClass[classId] ?? [];

export const selectEnrollmentLoading = (state) => state.enrollment.loading;
export const selectEnrollmentSubmitting = (state) =>
  state.enrollment.submitting;
export const selectEnrollmentSubmitError = (state) =>
  state.enrollment.submitError;
export const selectEnrollmentDeleting = (state) => state.enrollment.deleting;
