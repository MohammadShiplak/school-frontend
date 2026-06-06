// src/components/NotificationBell.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectNotifications,
  selectUnreadCount,
  markAllAsRead,
  clearNotifications,
} from "../features/notifications/notificationSlice";

// ── Small helper: color badge by notification type ────────────────────────
// type = "info" | "success" | "warning" | "error"
// Returns Tailwind classes for the colored dot on each notification row.
const typeDot = (type) => {
  const map = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };
  return map[type] ?? "bg-slate-400";
};

// ── Format timestamp nicely ───────────────────────────────────────────────
// "2026-06-03T14:30:00Z" → "2:30 PM"
const formatTime = (timestamp) => {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const NotificationBell = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);

  // Controls whether the dropdown panel is open or closed
  const [isOpen, setIsOpen] = useState(false);

  // ── When user clicks the bell ─────────────────────────────────────────
  const handleToggle = () => {
    setIsOpen((prev) => !prev);

    // Mark all as read when opening the panel
    // WHY? The act of looking at notifications = reading them
    if (!isOpen && unreadCount > 0) {
      dispatch(markAllAsRead());
    }
  };

  const handleClear = () => {
    dispatch(clearNotifications());
    setIsOpen(false);
  };

  return (
    // relative so the dropdown positions itself relative to this div
    <div className="relative">
      {/* ── Bell Button ──────────────────────────────────────────────── */}
      <button
        onClick={handleToggle}
        className="relative inline-flex items-center justify-center
                   w-9 h-9 rounded-xl text-slate-500
                   hover:bg-slate-100 hover:text-slate-800
                   focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                   transition-all"
        aria-label="Notifications"
      >
        {/* Bell Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>

        {/* ── Red Badge (only shows when there are unread notifications) */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5
                       min-w-[18px] h-[18px] px-1
                       bg-red-500 text-white text-[10px] font-bold
                       rounded-full flex items-center justify-center
                       leading-none"
          >
            {/* Cap display at 99 — "100+" looks bad on a tiny badge */}
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ───────────────────────────────────────────── */}
      {isOpen && (
        <>
          {/* Invisible overlay: click anywhere outside → close panel */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel itself */}
          <div
            className="absolute right-0 top-11 z-50
                       w-80 bg-white rounded-2xl border border-slate-100
                       shadow-xl shadow-slate-200/60
                       flex flex-col overflow-hidden"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                Notifications
              </h3>
              {notifications.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-xs font-medium text-slate-400
                             hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto max-h-80">
              {notifications.length === 0 ? (
                // Empty state
                <div className="py-10 text-center">
                  <div className="text-3xl mb-2">🔕</div>
                  <p className="text-sm font-medium text-slate-800">
                    All caught up!
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 px-4 py-3
                                border-b border-slate-50 last:border-0
                                transition-colors
                                ${
                                  notification.read
                                    ? "bg-white"
                                    : "bg-indigo-50/30" // unread = subtle highlight
                                }`}
                  >
                    {/* Colored dot showing notification type */}
                    <div
                      className={`mt-1.5 w-2 h-2 rounded-full shrink-0
                                  ${typeDot(notification.type)}`}
                    />

                    {/* Message + timestamp */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
