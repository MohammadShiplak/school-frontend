// src/components/DashboardLayout.jsx
import { use, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar.";
import useSignalR from "../hooks/useSignalR";

const DashboardLayout = () => {
  // useState(true) = sidebar starts open by default
  const [isOpen, setIsOpen] = useState(true);

  // Function to flip isOpen true↔false
  const handleToggle = () => setIsOpen((prev) => !prev);

  useSignalR(); // Custom hook to manage SignalR connection and notifications

  return (
    // Body now uses a cleaner slate-50 background
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ── Left: Styled Sidebar ── */}
      {/* (The line border matches the new aesthetic) */}
      <div
        className={`transition-all duration-300 ease-in-out border-r border-slate-100 bg-white ${isOpen ? "w-64" : "w-20"}`}
      >
        <Sidebar isOpen={isOpen} />
      </div>

      {/* ── Right: Navbar + Content ── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Harmonized Navbar with improved shadow and padding */}
        <Navbar onToggleSidebar={handleToggle} />

        {/* ── Polished Page Content Area ── */}
        <main className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10">
          {/* Main Title & Action Bar (Integrated for clean UX) */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Dashboard Overview
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Key metrics and recent activity across the EduPulse Portal.
              </p>
            </div>

            <div className="flex items-center gap-5 bg-white border border-slate-100 rounded-full px-5 py-2.5 shadow-sm">
              {/* Harmonized Security Status (Moved from Navbar) */}
              <p className="text-xs text-green-600 font-semibold flex items-center gap-1.5 pt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 text-slate-300"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
                Secured SSL Connection
              </p>

              <div className="relative group select-container w-48">
                <select
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-full pl-5 pr-11 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 appearance-none cursor-pointer"
                >
                  <option value="allCharts">All Charts</option>
                  <option value="studentMetrics">Student Metrics</option>
                  <option value="financialReports">Financial Reports</option>
                  <option value="systemLogs">System Logs</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
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
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* This is where the actual page content (cards, charts, data) renders */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
