// ═══════════════════════════════════════════════════════════════
// FILE: src/features/classSubject/classSubjectSlice.js
//
// WHY REDUX FOR THIS FEATURE?
//   When you open the "Manage Subjects" panel for a class,
//   you fetch a list of assigned subjects.
//   That list needs to be shared between:
//   - The subject list display (showing what's assigned)
//   - The assign form (knowing what's already there to avoid duplicates in UI)
//   - The delete button (removing an item from the list optimistically)
//
//   Redux keeps this shared state in one place.
//   All components read from and write to the same source of truth.
//
// STATE SHAPE (what the Redux store will look like for this feature):
//   {
//     classSubject: {
//       subjects: [],        ← subjects assigned to the currently-viewed class
//       loading: false,      ← true while fetching
//       error: null,         ← fetch error message
//       submitting: false,   ← true while assigning
//       submitError: null,   ← assign error message
//       deleting: false,     ← true while removing
//     }
//   }
// ═══════════════════════════════════════════════════════════════

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getSubjectsByClass,
  assignSubjectToClass,
  removeSubjectFromClass,
} from "../../api/classSubjectAPI";

// ════════════════════════════════════════════════════════════════
// THUNK 1: Fetch subjects for a class
// ════════════════════════════════════════════════════════════════
export const fetchSubjectsByClass = createAsyncThunk(
  // "classSubject/fetchByClass" is the unique ACTION TYPE NAME.
  // RTK auto-generates: "classSubject/fetchByClass/pending" etc.
  "classSubject/fetchByClass",

  async (classId, { rejectWithValue }) => {
    // WHY { rejectWithValue }?
    //   If the API call fails, rejectWithValue lets us pass a CUSTOM ERROR STRING
    //   to the rejected case in extraReducers.
    //   Without it, the error object would be a raw Axios error — messy to display.
    try {
      const response = await getSubjectsByClass(classId);
      return response.data; // Array of ClassSubjectReadDTO
    } catch (error) {
      return rejectWithValue("Failed to load subjects for this class.");
    }
  },
);

// ════════════════════════════════════════════════════════════════
// THUNK 2: Assign a subject to a class
// ════════════════════════════════════════════════════════════════
export const assignSubject = createAsyncThunk(
  "classSubject/assign",
  async (assignmentData, { rejectWithValue }) => {
    // assignmentData = { classId: 1, subjectId: 3 }
    try {
      const response = await assignSubjectToClass(assignmentData);
      return response.data; // ClassSubjectReadDTO of the new assignment
    } catch (error) {
      // WHY error.response?.data?
      //   The backend throws InvalidOperationException and the controller
      //   returns 400 with the MESSAGE as the body (plain string).
      //   error.response.data = "Subject 2 is already assigned to Class 1"
      //   We surface THAT message to the user instead of a generic one.
      return rejectWithValue(
        error.response?.data || "Failed to assign subject to class.",
      );
    }
  },
);

// ════════════════════════════════════════════════════════════════
// THUNK 3: Remove a subject from a class
// ════════════════════════════════════════════════════════════════
export const removeSubject = createAsyncThunk(
  "classSubject/remove",
  async ({ classId, subjectId }, { rejectWithValue }) => {
    // WHY destructure { classId, subjectId }?
    //   createAsyncThunk takes ONE argument.
    //   We bundle both into an object and destructure here.
    //   Same pattern as editHomework({ id, homeworkData }) in your homeworkSlice.
    try {
      await removeSubjectFromClass(classId, subjectId);
      // WHY return subjectId (not classId)?
      //   The fulfilled case needs to know WHICH SUBJECT to remove from the list.
      //   The list is a set of ClassSubjectReadDTOs.
      //   We filter by subjectId: state.subjects.filter(s => s.subjectId !== subjectId)
      return subjectId;
    } catch (error) {
      return rejectWithValue("Failed to remove subject from class.");
    }
  },
);

// ════════════════════════════════════════════════════════════════
// THE SLICE
// ════════════════════════════════════════════════════════════════
const classSubjectSlice = createSlice({
  name: "classSubject",

  initialState: {
    subjects: [], // ClassSubjectReadDTO[] — subjects assigned to current class
    loading: false,
    error: null,

    submitting: false, // true while POST is in flight
    submitError: null,

    deleting: false, // true while DELETE is in flight
  },

  reducers: {
    // WHY clearSubmitError?
    //   When the modal OPENS for a new assignment, we clear the old error.
    //   Without this, a previous error message lingers on the fresh form.
    clearSubmitError: (state) => {
      state.submitError = null;
    },
    // WHY clearSubjects?
    //   When the user navigates away from a class, we clear the loaded subjects.
    //   If they come back to a different class, they won't briefly see the old class's subjects.
    clearSubjects: (state) => {
      state.subjects = [];
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // ── FETCH ──────────────────────────────────────────────────
    builder
      .addCase(fetchSubjectsByClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjectsByClass.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = action.payload; // The full list from server
      })
      .addCase(fetchSubjectsByClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // The rejectWithValue string
      })

      // ── ASSIGN ─────────────────────────────────────────────────
      .addCase(assignSubject.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(assignSubject.fulfilled, (state, action) => {
        state.submitting = false;
        // WHY push (not unshift)?
        //   New subjects append to the END of the list.
        //   The list is typically sorted by SubjectName (alphabetically) server-side.
        //   Appending at the end is fine — the user can re-fetch for sorted order.
        //   Using unshift would put it first, which might look out of order.
        state.subjects.push(action.payload);
      })
      .addCase(assignSubject.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload; // Show error in the form
      })

      // ── REMOVE ─────────────────────────────────────────────────
      .addCase(removeSubject.pending, (state) => {
        state.deleting = true;
      })
      .addCase(removeSubject.fulfilled, (state, action) => {
        state.deleting = false;
        // action.payload = subjectId (we returned it from the thunk)
        // WHY filter?
        //   Remove the deleted assignment from the list WITHOUT refetching.
        //   filter() creates a NEW array (immutability — React needs new reference to re-render).
        state.subjects = state.subjects.filter(
          (s) => s.subjectId !== action.payload,
        );
      })
      .addCase(removeSubject.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearSubmitError, clearSubjects } = classSubjectSlice.actions;
export default classSubjectSlice.reducer;

// ════════════════════════════════════════════════════════════════
// SELECTORS
// WHY selectors instead of direct state access?
//   Components call: useSelector(selectClassSubjects)
//   If you rename state.classSubject.subjects → state.classSubject.list,
//   you fix it HERE once, not in every component.
// ════════════════════════════════════════════════════════════════
export const selectClassSubjects = (state) => state.classSubject.subjects ?? [];
export const selectClassSubjectLoading = (state) => state.classSubject.loading;
export const selectClassSubjectError = (state) => state.classSubject.error;
export const selectClassSubjectSubmitting = (state) =>
  state.classSubject.submitting;
export const selectClassSubjectSubmitError = (state) =>
  state.classSubject.submitError;
export const selectClassSubjectDeleting = (state) =>
  state.classSubject.deleting;
