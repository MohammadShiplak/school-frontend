// src/components/Navbar.jsx
import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  logout,
  selectUser,
  getProfileImageUrl,
} from "../features/auth/authSlice";
import { getClaim } from "../utils/tokenHelper";
import NotificationBell from "./NotificationBell";
/**
 * Clean, decoupled top-level navigation header component built to match
 * the modern SaaS/shadcn design patterns used in the EduPulse Portal.
 */
export const Navbar = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  // Local state to track broken avatar asset downloads
  const [imageError, setImageError] = useState(false);

  // Safely evaluate user properties with fallbacks
  const userName = getClaim(user, "name") || "Alex Rivera";
  const userRole = getClaim(user, "role") || "System Admin";

  const profileImageUrl = getProfileImageUrl(user);
  const initials = userName?.[0]?.toUpperCase() || "A";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      {/* Left Section: Branding & Control */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-95 transition-all"
          aria-label="Toggle navigation sidebar"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 text-white shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.263 15.541A1.75 1.75 0 0 1 3.5 14H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h.5a1.75 1.75 0 0 1 1.637 1.132l1.312 3.565A1.75 1.75 0 0 1 8.086 14H12m-7.737 1.541A1.746 1.746 0 0 0 5.5 16h13a1.745 1.745 0 0 0 1.237-.459m-15.474 0a1.745 1.745 0 0 1-.263-1.541l1.312-3.565A1.75 1.75 0 0 1 6.95 9H17.05a1.75 1.75 0 0 1 1.637 1.132l1.312 3.565a1.75 1.75 0 0 1-1.637 2.303H4.263Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              />
            </svg>
          </div>
          <span className="text-base font-bold text-slate-900 tracking-tight hidden sm:block">
            EduPulse Portal
          </span>
        </div>
      </div>

      {/* Right Section: System Metrics & User Actions */}
      <div className="flex items-center gap-4">
        {/* Security Badge */}
        <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50/60 border border-emerald-100 rounded-full text-xs font-semibold text-emerald-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-3.5 h-3.5 text-emerald-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          Secured
        </div>
        {<NotificationBell />}

        {/* User Identity Segment */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-none mb-1">
              {userName}
            </p>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              {userRole}
            </p>
          </div>

          {profileImageUrl && !imageError ? (
            <img
              src={profileImageUrl}
              alt={`${userName}'s profile`}
              className="w-9 h-9 rounded-xl object-cover border-2 border-indigo-50 shadow-sm"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm select-none">
              {initials}
            </div>
          )}
        </div>

        {/* Action: Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-rose-50/60 border border-slate-200/80 hover:border-rose-100 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 active:scale-95"
        >
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
