// src/features/departments/departmentSlice.js
import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";

import {
  getAllDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStatistics,
} from "../../api/departmentAPI";

// ═══════════════════════════════════════════════════════════════
// THUNK 1 — Fetch all departments
// ═══════════════════════════════════════════════════════════════
// WHY createAsyncThunk?
//   API calls are async (they take time). createAsyncThunk handles
//   the three states automatically: pending → fulfilled → rejected.
//   You write one function; Redux Toolkit generates three action types.
export const fetchDepartments = createAsyncThunk(
  "departments/fetchAll",
  async (_, { rejectWithValue }) => {
    // WHY the underscore (_) for the first argument?
    //   createAsyncThunk always passes the caller's argument as the first param.
    //   We don't need any argument here (no pagination, just "get all").
    //   _ is a convention meaning "I acknowledge this param but won't use it."
    try {
      const response = await getAllDepartments();
      // response.data = array of DepartmentDTO from the server
      // [ { id: 1, name: "IT" }, { id: 2, name: "HR" }, ... ]
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to load departments.");
    }
  },
);

// ═══════════════════════════════════════════════════════════════
// THUNK 2 — Fetch statistics for ONE department
// ═══════════════════════════════════════════════════════════════
// WHY a separate thunk for statistics (not combined with fetchDepartments)?
//   Statistics are loaded ON DEMAND — only when the user clicks "View Stats"
//   on a specific department row. Loading stats for ALL departments upfront
//   would mean N extra API calls (one per department) on page load. Bad UX.
//   Lazy loading = fetch only what the user actually asks for.
export const fetchDepartmentStats = createAsyncThunk(
  "departments/fetchStats",
  async (departmentId, { rejectWithValue }) => {
    try {
      const response = await getDepartmentStatistics(departmentId);
      // response.data = DepartmentStatisticsDTO
      // { departmentId, departmentName, totalTeachers, totalSubjects, totalStudents, totalClasses }
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to load department statistics.");
    }
  },
);

// ═══════════════════════════════════════════════════════════════
// THUNK 3 — Add a new department
// ═══════════════════════════════════════════════════════════════
export const createDepartment = createAsyncThunk(
  "departments/create",
  async (departmentData, { rejectWithValue }) => {
    try {
      const response = await addDepartment(departmentData);
      return response.data; // The newly created DepartmentDTO (with Id from DB)
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to add department.",
      );
    }
  },
);

// ═══════════════════════════════════════════════════════════════
// THUNK 4 — Update a department
// ═══════════════════════════════════════════════════════════════
export const editDepartment = createAsyncThunk(
  "departments/edit",
  async ({ id, departmentData }, { rejectWithValue }) => {
    // WHY destructure { id, departmentData }?
    //   createAsyncThunk takes ONE argument. We bundle both values into
    //   one object and destructure here. Same pattern as editHomework/editTeacher.
    try {
      const response = await updateDepartment(id, departmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to update department.");
    }
  },
);

// ═══════════════════════════════════════════════════════════════
// THUNK 5 — Delete a department
// ═══════════════════════════════════════════════════════════════
export const removeDepartment = createAsyncThunk(
  "departments/remove",
  async (id, { rejectWithValue }) => {
    try {
      await deleteDepartment(id);
      // WHY return id? The fulfilled case needs to know WHICH department to
      // remove from the local state array (filter by id).
      return id;
    } catch (error) {
      return rejectWithValue("Failed to delete department.");
    }
  },
);

// ═══════════════════════════════════════════════════════════════
// THE SLICE — State shape + reducers + extraReducers
// ═══════════════════════════════════════════════════════════════
const departmentSlice = createSlice({
  name: "departments",

  initialState: {
    // ── Department list state ─────────────────────────────────
    departments: [], // array of DepartmentDTO
    loading: false, // true while GET /api/Department is in flight
    error: null, // error message if fetch fails

    // ── Form state (add/edit) ─────────────────────────────────
    submitting: false, // true while POST or PUT is in flight
    submitError: null, // error to show inside the form modal

    // ── Delete state ──────────────────────────────────────────
    deleting: false,

    // ── Statistics state ──────────────────────────────────────
    // WHY separate stats state (not inside each department object)?
    //   We only load stats for ONE department at a time (the one clicked).
    //   Storing it separately keeps the departments array lean.
    //   The UI shows a stats modal — it reads from selectedStats.
    selectedStats: null, // DepartmentStatisticsDTO | null
    statsLoading: false, // true while GET /api/Department/:id/statistics is in flight
    statsError: null, // error if stats fetch fails
  },

  reducers: {
    // Sync action: clear form error when modal opens
    clearSubmitError: (state) => {
      state.submitError = null;
    },

    // Sync action: clear stats when the stats modal is closed
    // WHY? So the next time the user clicks a different department's stats,
    // they don't briefly see the previous department's data.
    clearSelectedStats: (state) => {
      state.selectedStats = null;
      state.statsError = null;
    },
  },

  extraReducers: (builder) => {
    // ── FETCH ALL ──────────────────────────────────────────────
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload = [ { id, name }, ... ]
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── FETCH STATS ────────────────────────────────────────────
      .addCase(fetchDepartmentStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
        // WHY clear selectedStats here?
        //   If the user clicks "Stats" on Dept 1, then Dept 2 before Dept 1 loads,
        //   clearing prevents briefly showing Dept 1's stale data under Dept 2's modal.
        state.selectedStats = null;
      })
      .addCase(fetchDepartmentStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.selectedStats = action.payload; // DepartmentStatisticsDTO
      })
      .addCase(fetchDepartmentStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      })

      // ── CREATE ─────────────────────────────────────────────────
      .addCase(createDepartment.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.submitting = false;
        // Add to the front of the list for instant visual feedback
        state.departments.unshift(action.payload);
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // ── EDIT ───────────────────────────────────────────────────
      .addCase(editDepartment.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(editDepartment.fulfilled, (state, action) => {
        state.submitting = false;
        // Find the department in the array and replace it with the updated version
        // WHY findIndex + replace (not re-fetch)?
        //   Re-fetching all departments after one edit wastes network.
        //   We already have the updated DTO from the server in action.payload.
        //   Just swap it in place — O(n) scan, fine for small department lists.
        const index = state.departments.findIndex(
          (d) => d.id === action.payload.id,
        );
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      })
      .addCase(editDepartment.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // ── DELETE ─────────────────────────────────────────────────
      .addCase(removeDepartment.pending, (state) => {
        state.deleting = true;
      })
      .addCase(removeDepartment.fulfilled, (state, action) => {
        state.deleting = false;
        // action.payload = the deleted department's id
        state.departments = state.departments.filter(
          (d) => d.id !== action.payload,
        );
      })
      .addCase(removeDepartment.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

// ── Export sync actions ───────────────────────────────────────
export const { clearSubmitError, clearSelectedStats } = departmentSlice.actions;
export default departmentSlice.reducer;

// ═══════════════════════════════════════════════════════════════
// SELECTORS
// ─────────────────────────────────────────────────────────────
// WHY selectors?
//   Components call useSelector(selectDepartments) instead of
//   useSelector(state => state.departments.departments).
//   If you ever rename the state key, fix it HERE once.
//
// WHY createSelector for stats?
//   selectedStats is an object. Without memoization, every Redux state
//   change would create a new object reference → unnecessary re-renders.
//   createSelector caches the result until inputs actually change.
// ═══════════════════════════════════════════════════════════════
export const selectDepartments = (state) => state.departments.departments ?? [];
export const selectDepartmentsLoading = (state) => state.departments.loading;
export const selectDepartmentsError = (state) => state.departments.error;
export const selectDepartmentsSubmitting = (state) =>
  state.departments.submitting;
export const selectDepartmentsSubmitError = (state) =>
  state.departments.submitError;
export const selectDepartmentsDeleting = (state) => state.departments.deleting;

// Memoized selector for the stats object (avoids re-renders when other state changes)
export const selectDepartmentStats = createSelector(
  (state) => state.departments.selectedStats,
  (stats) => stats,
);
export const selectDepartmentStatsLoading = (state) =>
  state.departments.statsLoading;
export const selectDepartmentStatsError = (state) =>
  state.departments.statsError;
