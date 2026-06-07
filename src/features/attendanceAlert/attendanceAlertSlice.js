// FILE: src/features/attendanceAlerts/attendanceAlertSlice.js
// ═══════════════════════════════════════════════════════════════
// WHY Redux for alerts?
//   Alerts need to be visible in MULTIPLE places:
//   1. The Alert Report Page (full list)
//   2. The Notification Bell (count badge)
//   3. Possibly the Sidebar (alert count badge)
//
//   Redux = global state. One place, any component can read it.
//   Without Redux, you'd call the API separately in each component (wasteful).
// ═══════════════════════════════════════════════════════════════

import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";

import {
  getAllAlerts,
  getActiveAlerts,
  getAlertCount,
  resolveAlert,
} from "../../api/attendanceAlertAPI";

// ── THUNK 1: Fetch all alerts ─────────────────────────────────
export const fetchAlerts = createAsyncThunk(
  "attendanceAlerts/fetchAll",
  async (_, { rejectWithValue }) => {
    // WHY underscore (_) as first argument:
    //   createAsyncThunk always passes the "argument" as the first param.
    //   We don't need any argument here (no pageNumber, no filter).
    //   The convention is to name unused params _ to signal "intentionally unused".
    try {
      const response = await getAllAlerts();
      return response.data; // Array of AttendanceAlertDTO
    } catch (error) {
      return rejectWithValue("Failed to load attendance alerts.");
    }
  },
);

// ── THUNK 2: Fetch only active alerts ────────────────────────
export const fetchActiveAlerts = createAsyncThunk(
  "attendanceAlerts/fetchActive",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getActiveAlerts();
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to load active alerts.");
    }
  },
);

// ── THUNK 3: Fetch alert count (for badge) ────────────────────
export const fetchAlertCount = createAsyncThunk(
  "attendanceAlerts/fetchCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAlertCount();
      return response.data; // Single integer, e.g. 5
    } catch (error) {
      return rejectWithValue("Failed to load alert count.");
    }
  },
);

// ── THUNK 4: Resolve an alert ─────────────────────────────────
export const resolveAlertThunk = createAsyncThunk(
  "attendanceAlerts/resolve",
  async ({ alertId, resolveData }, { rejectWithValue }) => {
    // WHY bundle alertId and resolveData in one object:
    //   createAsyncThunk only accepts ONE argument.
    //   We bundle them in an object and destructure here.
    //   Same pattern as your editHomework thunk.
    try {
      const response = await resolveAlert(alertId, resolveData);
      return response.data; // Updated AttendanceAlertDTO
    } catch (error) {
      return rejectWithValue("Failed to resolve alert.");
    }
  },
);

// ── THE SLICE ──────────────────────────────────────────────────
const attendanceAlertSlice = createSlice({
  name: "attendanceAlerts",
  initialState: {
    alerts: [], // Full list for the report page
    activeCount: 0, // Number for the badge

    loading: false,
    error: null,

    resolving: false, // True while a resolve API call is in progress
    resolveError: null,
  },

  reducers: {
    clearResolveError: (state) => {
      state.resolveError = null;
    },
  },

  extraReducers: (builder) => {
    // ── Fetch All ──────────────────────────────────────────────
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload;
        // Also update the active count based on the fetched data
        // WHY: avoids a separate API call just to update the count
        state.activeCount = action.payload.filter(
          (a) => a.status === 1, // AlertStatus.Active = 1
        ).length;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Fetch Active ───────────────────────────────────────────
      .addCase(fetchActiveAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload;
        state.activeCount = action.payload.length;
      })

      // ── Fetch Count ────────────────────────────────────────────
      .addCase(fetchAlertCount.fulfilled, (state, action) => {
        state.activeCount = action.payload;
      })

      // ── Resolve ────────────────────────────────────────────────
      .addCase(resolveAlertThunk.pending, (state) => {
        state.resolving = true;
        state.resolveError = null;
      })
      .addCase(resolveAlertThunk.fulfilled, (state, action) => {
        state.resolving = false;

        // Update the alert in the list — same pattern as editHomework
        const index = state.alerts.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.alerts[index] = action.payload;
        }

        // Update the active count — one alert is now resolved/dismissed
        // WHY recount: simpler than trying to track +1/-1 manually
        state.activeCount = state.alerts.filter((a) => a.status === 1).length;
      })
      .addCase(resolveAlertThunk.rejected, (state, action) => {
        state.resolving = false;
        state.resolveError = action.payload;
      });
  },
});

export const { clearResolveError } = attendanceAlertSlice.actions;
export default attendanceAlertSlice.reducer;

// ── SELECTORS ──────────────────────────────────────────────────
export const selectAlerts = (state) => state.attendanceAlerts.alerts ?? [];
export const selectActiveAlertCount = (state) =>
  state.attendanceAlerts.activeCount;
export const selectAlertsLoading = (state) => state.attendanceAlerts.loading;
export const selectAlertsError = (state) => state.attendanceAlerts.error;
export const selectAlertsResolving = (state) =>
  state.attendanceAlerts.resolving;

// Memoized selector: only active alerts (for a filtered view)
export const selectActiveAlerts = createSelector(
  selectAlerts,
  // WHY createSelector here:
  //   .filter() returns a NEW array every call.
  //   Without memoization, components would re-render even when data hasn't changed.
  //   createSelector caches the result and only recalculates when selectAlerts changes.
  (alerts) => alerts.filter((a) => a.status === 1),
);
