// src/pages/HomeworkPage.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// ── Redux: thunks + selectors ─────────────────────────────────────────────────
import {
  fetchHomework,
  removeHomework,
  setPage,
  selectHomeworks,
  selectHomeworkLoading,
  selectHomeworkError,
  selectHomeworkDeleting,
  selectHomeworkMeta,
} from "../features/homework/homeworkSlice";

// ── Components ────────────────────────────────────────────────────────────────
import HomeworkForm from "../components/Homeworks/HomeworkForm";
import DeleteConfirmModal from "../components/Homeworks/DeleteConfirmModel";
// ─────────────────────────────────────────────────────────────────────────────
// HomeworkFileDownload — inline in this file for simplicity.
// WHY inline here instead of a separate import:
//   It's a small, focused component used ONLY in this page.
//   You can also put it in src/components/homework/HomeworkFileDownload.jsx
//   and import it — both approaches are correct.
//
// HOW the download URL is built:
//   filePath in DB  = "homework-files/Chapter5_abc123.pdf"  (relative)
//   VITE_API_URL    = "https://localhost:7001/api"
//   We strip "/api" → "https://localhost:7001"
//   Final URL       = "https://localhost:7001/homework-files/Chapter5_abc123.pdf"
//   ASP.NET serves that file from wwwroot via UseStaticFiles().
// ─────────────────────────────────────────────────────────────────────────────
const HomeworkFileDownload = ({ filePath, fileName }) => {
  // No file attached → show a subtle dash
  if (!filePath) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-3.5 h-3.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
        No file
      </span>
    );
  }

  // Build the full static file URL
  const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "";
  const fileUrl = `${baseUrl}/${filePath}`;

  // Determine file icon color by extension
  // WHY: Gives instant visual cue about the file type
  const ext = fileName?.split(".").pop()?.toLowerCase();
  const iconColor =
    ext === "pdf"
      ? "text-red-500 bg-red-50 border-red-100"
      : ext === "doc" || ext === "docx"
        ? "text-blue-500 bg-blue-50 border-blue-100"
        : ext === "ppt" || ext === "pptx"
          ? "text-orange-500 bg-orange-50 border-orange-100"
          : "text-indigo-500 bg-indigo-50 border-indigo-100"; // images

  return (
    // WHY <a> with download attribute:
    //   <a href="..." download> tells the browser to DOWNLOAD the file
    //   instead of navigating to it or opening it inline.
    //   Without 'download', PDFs open in the browser tab instead of saving.
    <a
      href={fileUrl}
      download={fileName || "assignment"}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 
                  border rounded-lg text-xs font-medium transition-all 
                  duration-150 hover:opacity-80 hover:shadow-sm ${iconColor}`}
      title={`Download: ${fileName}`}
    >
      {/* Download arrow icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        className="w-3 h-3 shrink-0"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>

      {/* Truncate very long file names */}
      <span className="max-w-[110px] truncate">{fileName || "Download"}</span>
    </a>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// WHY outside the page component:
//   Pure presentational component, no state needed.
//   Defined outside = created once, not recreated on every render.
// ─────────────────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  // status from API: 1 = Active, 2 = Archived (matches your HomeworkStatus enum)
  const isActive = status === 1 || status === "Active";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full 
                      text-xs font-semibold ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`}
      />
      {isActive ? "Active" : "Archived"}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DUE DATE BADGE
// WHY: Colors the due date red if it's overdue, amber if due soon, else normal.
//   Gives teachers an instant visual warning about upcoming deadlines.
// ─────────────────────────────────────────────────────────────────────────────
const DueDateBadge = ({ dueDate }) => {
  if (!dueDate) return <span className="text-slate-400 text-xs">—</span>;

  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  const color =
    diffDays < 0
      ? "text-red-600 bg-red-50 border-red-100" // overdue
      : diffDays <= 2
        ? "text-amber-600 bg-amber-50 border-amber-100" // due very soon
        : diffDays <= 7
          ? "text-orange-500 bg-orange-50 border-orange-100" // due this week
          : "text-slate-600 bg-slate-50 border-slate-200"; // normal

  const label =
    diffDays < 0
      ? `${Math.abs(diffDays)}d overdue`
      : diffDays === 0
        ? "Due today"
        : diffDays === 1
          ? "Due tomorrow"
          : due.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md 
                      text-xs font-medium border ${color}`}
    >
      {diffDays <= 2 && diffDays >= 0 && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-3 h-3"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      )}
      {label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const HomeworkPage = () => {
  const dispatch = useDispatch();

  // ── Redux state ────────────────────────────────────────────────────────────
  const homeworks = useSelector(selectHomeworks);
  const loading = useSelector(selectHomeworkLoading);
  const error = useSelector(selectHomeworkError);
  const deleting = useSelector(selectHomeworkDeleting);
  const { pageNumber, pageSize, totalPages, totalRecords } =
    useSelector(selectHomeworkMeta);

  // ── Local UI state ─────────────────────────────────────────────────────────
  // WHY local state for modal control (not Redux):
  //   isFormOpen, selectedHomework, isDeleteOpen are UI concerns —
  //   they only affect THIS page component, nothing else in the app.
  //   Redux is for SHARED state. Local useState is for component-local UI state.
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null); // null = add mode, object = edit mode
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [homeworkToDelete, setHomeworkToDelete] = useState(null);

  // ── Search / Filter state ──────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "1" | "2"

  // ── Initial data fetch ─────────────────────────────────────────────────────
  // WHY useEffect with [pageNumber, pageSize]:
  //   Fetches homework whenever the page changes (pagination).
  //   This is the standard pattern: watch what changes → re-fetch.
  useEffect(() => {
    dispatch(fetchHomework({ pageNumber, pageSize }));
  }, [dispatch, pageNumber, pageSize]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAddClick = () => {
    setSelectedHomework(null); // null = create mode in HomeworkForm
    setIsFormOpen(true);
  };

  const handleEditClick = (hw) => {
    setSelectedHomework(hw); // object = edit mode in HomeworkForm
    setIsFormOpen(true);
  };

  const handleDeleteClick = (hw) => {
    setHomeworkToDelete(hw);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!homeworkToDelete) return;
    const result = await dispatch(removeHomework(homeworkToDelete.id));
    if (removeHomework.fulfilled.match(result)) {
      setIsDeleteOpen(false);
      setHomeworkToDelete(null);
    }
  };

  const handleRefresh = () => {
    dispatch(fetchHomework({ pageNumber, pageSize }));
  };

  // ── Client-side filtering ──────────────────────────────────────────────────
  // WHY filter client-side (not a new API call):
  //   For small-to-medium datasets on the current page, filtering in JS is
  //   instant and avoids a round-trip to the server.
  //   For very large datasets you'd move filtering to the API (query params).
  const filteredHomeworks = homeworks.filter((hw) => {
    const matchesSearch =
      searchTerm === "" ||
      hw.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hw.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hw.subjectName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      String(hw.status) === statusFilter ||
      (statusFilter === "1" && hw.status === 1) ||
      (statusFilter === "2" && hw.status === 2);

    return matchesSearch && matchesStatus;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    // WHY min-h-screen with bg-slate-50: matches DashboardLayout's background
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-6">
      {/* ── PAGE HEADER ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Homework Assignments
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {/* Show total count or filtered count */}
            {searchTerm || statusFilter !== "all"
              ? `${filteredHomeworks.length} result${filteredHomeworks.length !== 1 ? "s" : ""} found`
              : `${totalRecords} assignment${totalRecords !== 1 ? "s" : ""} total`}
          </p>
        </div>

        {/* Add Homework Button */}
        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 
                     hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm 
                     font-semibold rounded-xl shadow-sm shadow-indigo-200 
                     transition-all duration-150 focus:outline-none 
                     focus:ring-2 focus:ring-indigo-500/40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Assign Homework
        </button>
      </div>

      {/* ── SEARCH + FILTER BAR ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by title, teacher, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 
                       rounded-xl text-sm text-slate-800 placeholder:text-slate-400
                       focus:outline-none focus:ring-2 focus:ring-indigo-500/20 
                       focus:border-indigo-400 transition"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl 
                     text-sm text-slate-700 focus:outline-none focus:ring-2 
                     focus:ring-indigo-500/20 focus:border-indigo-400 transition
                     min-w-[140px]"
        >
          <option value="all">All Statuses</option>
          <option value="1">Active</option>
          <option value="2">Archived</option>
        </select>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white 
                     border border-slate-200 rounded-xl text-sm font-medium 
                     text-slate-600 hover:bg-slate-50 transition"
          title="Refresh list"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* ── CONTENT AREA ─────────────────────────────────────────────────── */}

      {/* LOADING SKELETON */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-1/4" />
                <div className="h-4 bg-slate-100 rounded w-1/6" />
                <div className="h-4 bg-slate-100 rounded w-1/6" />
                <div className="h-4 bg-slate-100 rounded w-1/5" />
                <div className="h-4 bg-slate-100 rounded w-1/12" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-red-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-700">{error}</p>
          <button
            onClick={handleRefresh}
            className="text-xs text-indigo-600 underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && filteredHomeworks.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-20 gap-3 
                        bg-white rounded-2xl border border-slate-100 shadow-sm"
        >
          <div
            className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center 
                          justify-center text-indigo-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">
              {searchTerm || statusFilter !== "all"
                ? "No results match your filter"
                : "No homework assigned yet"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm || statusFilter !== "all"
                ? "Try clearing the search or changing the filter"
                : "Click 'Assign Homework' to create the first assignment"}
            </p>
          </div>
          {(searchTerm || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="text-xs text-indigo-600 underline underline-offset-2"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── HOMEWORK TABLE ────────────────────────────────────────────────── */}
      {!loading && !error && filteredHomeworks.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {/*
              WHY overflow-x-auto on the wrapper:
                On mobile screens, wide tables overflow the viewport.
                overflow-x-auto adds a horizontal scrollbar on the TABLE
                container, not on the whole page — much better UX.
            */}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {/* WHY text-left on th: Default is center-aligned in many browsers. */}
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Title
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Teacher
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Class
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Subject
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Due Date
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Status
                  </th>

                  {/* ── FILE COLUMN ─────────────────────────────────────────── */}
                  {/*
                    WHY a dedicated "File" column:
                      Users need to see at a glance which assignments have
                      attached files. The HomeworkFileDownload component
                      renders "No file" or a styled download button.
                  */}
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    File
                  </th>

                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {filteredHomeworks.map((hw) => (
                  // WHY key={hw.id}: React needs a stable unique key for list items.
                  // Using the DB id is the correct choice (not array index).
                  <tr
                    key={hw.id}
                    className="hover:bg-slate-50/50 transition-colors duration-100"
                  >
                    {/* TITLE */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-800 leading-snug line-clamp-1">
                          {hw.title}
                        </span>
                        {/* Show description preview if exists */}
                        {hw.description && (
                          <span className="text-xs text-slate-400 line-clamp-1">
                            {hw.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* TEACHER */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {/* Avatar initial circle */}
                        <div
                          className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 
                                        flex items-center justify-center text-xs font-bold shrink-0"
                        >
                          {hw.teacherName?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span className="text-slate-700 text-sm truncate max-w-[100px]">
                          {hw.teacherName ?? "—"}
                        </span>
                      </div>
                    </td>

                    {/* CLASS */}
                    <td className="px-4 py-4">
                      {hw.className ? (
                        <span
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 
                                         rounded-md text-xs font-medium"
                        >
                          {hw.className}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>

                    {/* SUBJECT */}
                    <td className="px-4 py-4">
                      {hw.subjectName ? (
                        <span
                          className="px-2 py-0.5 bg-violet-50 text-violet-600 
                                         border border-violet-100 rounded-md text-xs font-medium"
                        >
                          {hw.subjectName}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>

                    {/* DUE DATE */}
                    <td className="px-4 py-4">
                      <DueDateBadge dueDate={hw.dueDate} />
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-4">
                      <StatusBadge status={hw.status} />
                    </td>

                    {/* ── FILE DOWNLOAD CELL ─────────────────────────────────── */}
                    {/*
                      HOW HomeworkFileDownload works here:
                        - hw.filePath = "homework-files/abc123.pdf" (from the API)
                        - hw.fileName = "Chapter5_abc123.pdf" (from the API)
                        - If both are null → shows "No file"
                        - If they exist → shows a styled download button
                        - Clicking triggers browser file download
                    */}
                    <td className="px-4 py-4">
                      <HomeworkFileDownload
                        filePath={hw.filePath}
                        fileName={hw.fileName}
                      />
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit button */}
                        <button
                          onClick={() => handleEditClick(hw)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 
                                     bg-slate-50 hover:bg-indigo-50 border border-slate-200 
                                     hover:border-indigo-200 text-slate-600 hover:text-indigo-600 
                                     rounded-lg text-xs font-medium transition-all"
                          title="Edit homework"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-3.5 h-3.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
                            />
                          </svg>
                          Edit
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteClick(hw)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 
                                     bg-slate-50 hover:bg-red-50 border border-slate-200 
                                     hover:border-red-200 text-slate-500 hover:text-red-600 
                                     rounded-lg text-xs font-medium transition-all"
                          title="Delete homework"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-3.5 h-3.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── PAGINATION ──────────────────────────────────────────────────── */}
          {/*
            WHY only show pagination when not filtering:
              Client-side search filters the CURRENT page's data only.
              Showing page 2/3 while filtering is confusing — it implies
              only the current page is searched, not all records.
              Hide pagination during search to avoid that confusion.
          */}
          {!searchTerm && statusFilter === "all" && totalPages > 1 && (
            <div
              className="flex items-center justify-between px-5 py-4 
                            border-t border-slate-100 bg-slate-50/40"
            >
              <p className="text-xs text-slate-500">
                Page{" "}
                <span className="font-semibold text-slate-700">
                  {pageNumber}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {totalPages}
                </span>{" "}
                ·{" "}
                <span className="font-semibold text-slate-700">
                  {totalRecords}
                </span>{" "}
                total
              </p>

              <div className="flex items-center gap-1.5">
                {/* Previous page */}
                <button
                  onClick={() => dispatch(setPage(pageNumber - 1))}
                  disabled={pageNumber === 1}
                  className="px-3 py-1.5 text-xs font-medium bg-white border 
                             border-slate-200 rounded-lg text-slate-600 
                             hover:bg-slate-50 disabled:opacity-40 
                             disabled:cursor-not-allowed transition"
                >
                  ← Prev
                </button>

                {/* Page numbers */}
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // WHY show only nearby pages:
                  //   Showing 50 page buttons is useless. Show first, last,
                  //   and pages near the current one. Classic pagination UX.
                  const isNearby = Math.abs(page - pageNumber) <= 1;
                  const isEdge = page === 1 || page === totalPages;
                  if (!isNearby && !isEdge) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => dispatch(setPage(page))}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg 
                                  border transition ${
                                    page === pageNumber
                                      ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                  }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {/* Next page */}
                <button
                  onClick={() => dispatch(setPage(pageNumber + 1))}
                  disabled={pageNumber === totalPages}
                  className="px-3 py-1.5 text-xs font-medium bg-white border 
                             border-slate-200 rounded-lg text-slate-600 
                             hover:bg-slate-50 disabled:opacity-40 
                             disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODALS ───────────────────────────────────────────────────────── */}

      {/*
        HomeworkForm — handles both CREATE and EDIT:
          isOpen      → controls visibility
          onClose     → called when user cancels
          homework    → null = create mode, object = edit mode
          onRefresh   → re-fetches the list after successful save
      */}
      <HomeworkForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        homework={selectedHomework}
        onRefresh={handleRefresh}
      />

      {/*
        DeleteConfirmModal — reused from your existing DeleteConfirmModel.jsx
        Props:
          isOpen      → show/hide
          onClose     → cancel button
          onConfirm   → confirm delete
          teacherName → reuses "teacherName" prop as the item label (displays homework title)
          deleting    → shows spinner while delete is in progress
      */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setHomeworkToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        teacherName={homeworkToDelete?.title} // reuses the "name" prop to show homework title
        deleting={deleting}
      />
    </div>
  );
};

export default HomeworkPage;
