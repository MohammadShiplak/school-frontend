// src/components/DashboardLayout.jsx
import { use, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar.";
import useSignalR from "../hooks/useSignalR";
import ChatBot from "./chatbot/ChatBot";
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

          <Outlet />
        </main>
        <ChatBot />
      </div>
    </div>
  );
};

export default DashboardLayout;
