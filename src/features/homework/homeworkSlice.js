// ═══════════════════════════════════════════════════════════════
//  WHY REDUX TOOLKIT (RTK)?
//  ─────────────────────────────────────────────────────────────
//  Redux manages GLOBAL STATE — data that multiple components
//  need to share (e.g., the homework list shown in a table AND
//  a count badge in the sidebar).
//
//  Without Redux, you'd prop-drill data through many components,
//  or duplicate API calls in each component.
//
//  RTK is the OFFICIAL, MODERN way to use Redux:
//  ┌──────────────────────────────────────────────────────────┐
//  │ createSlice:    Creates actions + reducer in one place   │
//  │ createAsyncThunk: Handles async operations (API calls)   │
//  │ createSelector: Memoized selectors (performance)         │
//  └──────────────────────────────────────────────────────────┘
//
//  This file follows the EXACT same pattern as your existing
//  studentSlice.js and teacherSlice.js — always match the pattern!
// ═══════════════════════════════════════════════════════════════

import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import {
  getAllHomework,
  addHomework,
  updateHomework,
  deleteHomework,
  getHomeworkByTeacher,
  deleteHomeworkFile,
} from "../../api/homeworkAPI";
// ⚠️ Adjust the import path to match YOUR project structure.
//    In your project: src/api/homeworkAPI.js
//    If your API files are elsewhere, change the path.

// ═══════════════════════════════════════════════════════════════
//  ASYNC THUNKS
//  ─────────────────────────────────────────────────────────────
//  createAsyncThunk creates three actions automatically:
//    fetchHomework.pending   → API call started
//    fetchHomework.fulfilled → API call succeeded (data available)
//    fetchHomework.rejected  → API call failed (error available)
//
//  WHY thunks instead of calling the API directly in components:
//   - Components stay "dumb" (display only)
//   - Business logic lives in one place (the slice)
//   - Easy to test: just dispatch the thunk and check state
// ═══════════════════════════════════════════════════════════════

// ── THUNK 1: Fetch all homework (paginated) ──────────────────────
export const fetchHomework = createAsyncThunk(
  "homework/fetchAll",
  // The first argument "homework/fetchAll" is the action TYPE prefix.
  // RTK generates: "homework/fetchAll/pending", "homework/fetchAll/fulfilled", etc.
  // Make it descriptive and unique across your whole app.

  async ({ pageNumber, pageSize }, { rejectWithValue }) => {
    // WHY { rejectWithValue }:
    //   If the API call fails, we want to store the ERROR MESSAGE in state,
    //   not crash the app with an uncaught exception.
    //   rejectWithValue() lets us pass a custom error string to the rejected case.
    try {
      const response = await getAllHomework(pageNumber, pageSize);
      // response.data is the PagedResponse<HomeworkDTO> object from the API
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to load homework list.");
    }
  },
);

// ── THUNK 2: Fetch homework for a specific teacher ───────────────
export const fetchHomeworkByTeacher = createAsyncThunk(
  "homework/fetchByTeacher",
  async (teacherId, { rejectWithValue }) => {
    try {
      const response = await getHomeworkByTeacher(teacherId);
      return response.data; // Array of HomeworkDTO
    } catch (error) {
      return rejectWithValue("Failed to load teacher's homework.");
    }
  },
);

// ── THUNK 3: Add new homework ────────────────────────────────────
export const createHomework = createAsyncThunk(
  "homework/create",
  async (homeworkData, { rejectWithValue }) => {
    try {
      const response = await addHomework(homeworkData);
      return response.data; // The newly created HomeworkDTO (with Id from DB)
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to add homework.");
      // WHY error.response?.data:
      //   Axios puts the server's response body in error.response.data.
      //   If the server returns "Teacher with Id 99 does not exist."
      //   we can show THAT message to the user instead of a generic one.
    }
  },
);

// ── THUNK 4: Update homework ─────────────────────────────────────
export const editHomework = createAsyncThunk(
  "homework/edit",
  async ({ id, homeworkData }, { rejectWithValue }) => {
    // WHY destructure { id, homeworkData }:
    //   createAsyncThunk only accepts ONE argument.
    //   We bundle both needed values into one object and destructure here.
    try {
      const response = await updateHomework(id, homeworkData);
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to update homework.");
    }
  },
);

// ── THUNK 5: Delete homework ─────────────────────────────────────
export const removeHomework = createAsyncThunk(
  "homework/remove",
  async (id, { rejectWithValue }) => {
    try {
      await deleteHomework(id);
      // WHY return id (not response.data):
      //   DELETE returns a string message, not the deleted object.
      //   We need the id to remove the item from the Redux state array.
      return id;
    } catch (error) {
      return rejectWithValue("Failed to delete homework.");
    }
  },
);
export const removeHomeworkFile = createAsyncThunk(
  "homework/removeFile",
  async (homeworkId, { rejectWithValue }) => {
    try {
      await deleteHomeworkFile(homeworkId);
      // WHY return homeworkId:
      //   We need the ID to find and update the right item in state.
      //   We set its filePath and fileName to null.
      return homeworkId;
    } catch (error) {
      return rejectWithValue("Failed to delete homework file.");
    }
  },
);
// ═══════════════════════════════════════════════════════════════
//  THE SLICE
//  ─────────────────────────────────────────────────────────────
//  createSlice bundles:
//   - name: namespace for this slice in Redux store
//   - initialState: what state looks like before any API calls
//   - reducers: SYNCHRONOUS state changes (setPage, clearError)
//   - extraReducers: handle ASYNC thunk results (pending/fulfilled/rejected)
// ═══════════════════════════════════════════════════════════════
const homeworkSlice = createSlice({
  name: "homework",

  initialState: {
    // The list of homework items currently displayed
    homeworks: [],

    // Pagination metadata from the API response
    totalRecords: 0,
    totalPages: 0,
    pageNumber: 1,
    pageSize: 10,

    // Loading states — WHY separate booleans:
    //   loading: the main list is being fetched (show skeleton rows)
    //   submitting: a form is being saved (disable submit button)
    //   deleting: a delete is in progress (show spinner in modal)
    loading: false,
    error: null,

    submitting: false,
    submitError: null,

    deleting: false,
  },

  reducers: {
    // Sync action: user clicks page 2 → update pageNumber in state
    // The useEffect in the component watches pageNumber and re-fetches.
    setPage: (state, action) => {
      state.pageNumber = action.payload;
    },

    // Clear form error when user opens the form again
    clearSubmitError: (state) => {
      state.submitError = null;
    },
  },

  extraReducers: (builder) => {
    // ── FETCH ALL ──────────────────────────────────────────────
    builder
      .addCase(fetchHomework.pending, (state) => {
        state.loading = true;
        state.error = null;
        // WHY clear error: Previous errors shouldn't linger when retrying.
      })
      .addCase(fetchHomework.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload = the PagedResponse<HomeworkDTO> object
        state.homeworks = action.payload.data;
        state.totalRecords = action.payload.totalRecords;
        state.totalPages = action.payload.totalPages;
        state.pageNumber = action.payload.pageNumber;
      })
      .addCase(fetchHomework.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // The rejectWithValue string
      })

      // ── FETCH BY TEACHER ───────────────────────────────────────
      .addCase(fetchHomeworkByTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomeworkByTeacher.fulfilled, (state, action) => {
        state.loading = false;
        state.homeworks = action.payload; // Direct array (no pagination)
      })
      .addCase(fetchHomeworkByTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── CREATE ─────────────────────────────────────────────────
      .addCase(createHomework.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(createHomework.fulfilled, (state, action) => {
        state.submitting = false;
        // WHY unshift (add to front) instead of push (add to end):
        //   Newest homework appears at the TOP of the list.
        //   This gives immediate visual feedback without re-fetching.
        //   TRADE-OFF: The local list might be slightly out of sync if
        //   the server applies different sorting. For this use case it's fine.
        state.homeworks.unshift(action.payload);
        state.totalRecords += 1;
      })
      .addCase(createHomework.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // ── EDIT ───────────────────────────────────────────────────
      .addCase(editHomework.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(editHomework.fulfilled, (state, action) => {
        state.submitting = false;
        // Find the homework in the array and replace it with the updated version
        // WHY findIndex: We need the position (index) to replace, not just the item.
        const index = state.homeworks.findIndex(
          (h) => h.id === action.payload.id,
        );
        if (index !== -1) {
          state.homeworks[index] = action.payload;
          // RTK uses Immer internally — you can "mutate" state directly.
          // Immer detects the change and creates a new immutable state object.
          // WHY this matters: React needs a NEW reference to re-render.
          // Immer handles this automatically — you write mutation-style code safely.
        }
      })
      .addCase(editHomework.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // ── DELETE ─────────────────────────────────────────────────
      .addCase(removeHomework.pending, (state) => {
        state.deleting = true;
      })
      .addCase(removeHomework.fulfilled, (state, action) => {
        state.deleting = false;
        // action.payload = the deleted homework's id (we returned it from the thunk)
        // Filter creates a NEW array without the deleted item.
        state.homeworks = state.homeworks.filter(
          (h) => h.id !== action.payload,
        );
        state.totalRecords -= 1;
      })
      .addCase(removeHomework.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })
      .addCase(removeHomeworkFile.fulfilled, (state, action) => {
        // action.payload = homeworkId (we returned it from the thunk)
        const index = state.homeworks.findIndex((h) => h.id === action.payload);
        if (index !== -1) {
          // Set filePath and fileName to null to reflect deletion in UI
          state.homeworks[index].filePath = null;
          state.homeworks[index].fileName = null;
        }
      });
  },
});

// ── EXPORT ACTIONS ───────────────────────────────────────────────
export const { setPage, clearSubmitError } = homeworkSlice.actions;
export default homeworkSlice.reducer;

// ═══════════════════════════════════════════════════════════════
//  SELECTORS
//  ─────────────────────────────────────────────────────────────
//  Selectors are functions that EXTRACT specific data from
//  the Redux store. Components call these instead of accessing
//  state directly.
//
//  WHY selectors:
//   - Centralized: if state shape changes, fix ONE selector
//   - Reusable: any component can use the same selector
//   - Testable: pure functions, easy to unit test
//
//  WHY createSelector (memoized selectors):
//   - Regular selectors recalculate on every render.
//   - createSelector caches the result and only recalculates
//     when its INPUT selectors return different values.
//   - Important for objects/arrays: prevents unnecessary re-renders
//     because a new object reference (even with same data) causes re-render.
// ═══════════════════════════════════════════════════════════════

// Simple selectors (primitives — no memoization needed)
export const selectHomeworks = (state) => state.homework.homeworks ?? [];
export const selectHomeworkLoading = (state) => state.homework.loading;
export const selectHomeworkError = (state) => state.homework.error;
export const selectHomeworkSubmitting = (state) => state.homework.submitting;
export const selectHomeworkSubmitError = (state) => state.homework.submitError;
export const selectHomeworkDeleting = (state) => state.homework.deleting;

// Memoized selector for pagination metadata (object — needs memoization)
export const selectHomeworkMeta = createSelector(
  (state) => state.homework.totalRecords,
  (state) => state.homework.totalPages,
  (state) => state.homework.pageNumber,
  (state) => state.homework.pageSize,
  (totalRecords, totalPages, pageNumber, pageSize) => ({
    totalRecords,
    totalPages,
    pageNumber,
    pageSize,
  }),
);
