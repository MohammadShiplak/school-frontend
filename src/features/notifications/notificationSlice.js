// src/features/notifications/notificationSlice.js

// ─────────────────────────────────────────────────────────────────────────
// WHY REDUX FOR NOTIFICATIONS?
// Notifications can come in while the user is on ANY page.
// Redux is global state — it lives outside any component.
// When a notification arrives, we put it in Redux.
// Then the NotificationBell (in Navbar) reads from Redux — always in sync.
// ─────────────────────────────────────────────────────────────────────────

import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",

  initialState: {
    // Array of notification objects:
    // { id, message, type, timestamp, read }
    notifications: [],

    // Separate counter for the red badge on the bell icon.
    // WHY not just count notifications.filter(n => !n.read).length?
    // That works too, but keeping a dedicated counter avoids
    // recalculating on every render — small performance win.
    unreadCount: 0,
  },

  reducers: {
    // ── addNotification ───────────────────────────────────────────────
    // Called every time SignalR sends us a new notification.
    // We unshift (add to front) so newest notification appears at top.
    addNotification: (state, action) => {
      state.notifications.unshift({
        id: Date.now(), // simple unique id using current timestamp
        message: action.payload.message,
        type: action.payload.type || "info",
        timestamp: action.payload.timestamp || new Date().toISOString(),
        read: false, // every new notification starts as unread
      });

      state.unreadCount += 1;

      // ── Optional: Cap at 20 notifications ─────────────────────────
      // WHY? If the user never clears them, the array grows forever.
      // In production you'd persist these to a database instead.
      if (state.notifications.length > 20) {
        state.notifications = state.notifications.slice(0, 20);
      }
    },

    // ── markAllAsRead ─────────────────────────────────────────────────
    // Called when user clicks the bell and sees the list.
    // Sets all notifications to read:true and resets badge to 0.
    markAllAsRead: (state) => {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        read: true,
      }));
      state.unreadCount = 0;
    },

    // ── clearNotifications ────────────────────────────────────────────
    // Called when user clicks "Clear All"
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markAllAsRead, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────
export const selectNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
