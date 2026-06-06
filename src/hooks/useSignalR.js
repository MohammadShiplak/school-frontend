// src/hooks/useSignalR.js
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectToken } from "../features/auth/authSlice";
import { addNotification } from "../features/notifications/notificationSlice";
import { startConnection, stopConnection } from "../services/signalRService";

const useSignalR = () => {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);

  // ─────────────────────────────────────────────────────────────────
  // WHY useRef instead of useState?
  // useRef persists across re-renders WITHOUT causing re-renders.
  // It also survives React StrictMode's mount→unmount→remount cycle.
  // useState would trigger a re-render when changed — we don't want that.
  // ─────────────────────────────────────────────────────────────────
  const isConnected = useRef(false);

  useEffect(() => {
    // ── User logged out → disconnect ──────────────────────────────
    if (!token) {
      if (isConnected.current) {
        stopConnection();
        isConnected.current = false;
      }
      return;
    }

    // ── Already connected → don't connect again ───────────────────
    // WHY this check?
    // React StrictMode calls this effect twice.
    // Without this guard, you'd create 2 connections.
    if (isConnected.current) return;

    // ── Connect ───────────────────────────────────────────────────
    const handleNotification = (notification) => {
      dispatch(addNotification(notification));
    };

    isConnected.current = true;
    startConnection(token, handleNotification);

    // ── Cleanup ───────────────────────────────────────────────────
    // WHY no stopConnection() here?
    // Notifications are GLOBAL — they should work on every page.
    // If we stopped here, navigating to another page would kill
    // the connection. We only stop when the token is gone (logout).
    return () => {};
  }, [token, dispatch]);
};

export default useSignalR;
