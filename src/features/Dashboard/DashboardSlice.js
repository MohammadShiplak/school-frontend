// ═══════════════════════════════════════════════════════════════
// FILE: src/features/dashboard/dashboardSlice.js
//
// WHY REDUX FOR THE DASHBOARD?
//   The dashboard stats object is fetched once and displayed
//   across multiple card components.
//   Redux stores it globally so every component reads from
//   the same data source — no duplicate API calls.
//
// STATE SHAPE:
//   {
//     dashboard: {
//       stats: null,          ← null until loaded, then DashboardStatsDTO
//       loading: false,       ← true while API call is in flight
//       error: null,          ← error message if fetch fails
//     }
//   }
// ═══════════════════════════════════════════════════════════════

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDashboardStats } from "../../api/DashoardAPI";

// ── THUNK: Fetch dashboard stats ─────────────────────────────────
// One thunk for one API call. Simple and clean.
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    // WHY underscore (_) for the argument?
    //   createAsyncThunk requires an argument but we don't need one here.
    //   Underscore is a JS convention meaning "I'm ignoring this argument."
    //   It's not required — you could write async (arg, { rejectWithValue })
    //   but _ makes it clear the argument is intentionally unused.
    try {
      const response = await getDashboardStats();
      return response.data; // DashboardStatsDTO object
    } catch (error) {
      return rejectWithValue("Failed to load dashboard statistics.");
    }
  },
);

// ── THE SLICE ─────────────────────────────────────────────────────
const dashboardSlice = createSlice({
  name: "dashboard",

  initialState: {
    stats: null, // WHY null (not {})? null = "not loaded yet" vs {} = "loaded but empty"
    loading: false,
    error: null,
  },

  reducers: {
    // WHY no sync reducers here?
    //   The dashboard is purely a display page.
    //   You fetch stats, show them.
    //   There's no pagination, no forms, no local state to manage.
    //   If you later add a "refresh" button, you'd just dispatch fetchDashboardStats again.
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload = the DashboardStatsDTO returned by the API
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // the rejectWithValue string
      });
  },
});

export default dashboardSlice.reducer;

// ── SELECTORS ─────────────────────────────────────────────────────
// WHY selectors?
//   Components call useSelector(selectDashboardStats) instead of
//   useSelector(state => state.dashboard.stats).
//   If you rename the state key, you fix it HERE once — not in every component.

export const selectDashboardStats = (state) => state.dashboard.stats;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;
