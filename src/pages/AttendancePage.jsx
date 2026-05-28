// src/pages/AttendancePage.jsx
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAttendances,
  fetchAttendanceByDate,
  fetchAttendanceByStudent,
  removeAttendance,
  selectAttendances,
  selectAttendanceLoading,
  selectAttendanceError,
  selectAttendanceDeleting,
} from "../features/attendance/attendanceSlice";
import AttendanceForm from "../components/attendance/AttendanceForm";
import DeleteConfirmModal from "../components/students/DeleteConfirmModel";

// ─────────────────────────────────────────────────────────────
// WHY define STATUS_CONFIG outside the component?
// Same reason as AttendanceForm — it never changes.
// This object maps status values/strings to badge styles.
// We use it to render colored badges in the table.
// ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Present: {
    label: "Present",
    classes: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  },
  Absent: {
    label: "Absent",
    classes: "bg-red-50 text-red-700 border border-red-100",
  },
  Late: {
    label: "Late",
    classes: "bg-amber-50 text-amber-700 border border-amber-100",
  },
  Excused: {
    label: "Excused",
    classes: "bg-blue-50 text-blue-700 border border-blue-100",
  },
};

// ─────────────────────────────────────────────────────────────
// WHY a separate StatusBadge component?
// We use this in every row of the table.
// Keeping it separate makes the table JSX cleaner.
// It also handles BOTH string ("Present") and
// number (1) status values from the API.
// ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  // WHY this logic?
  // If backend returns number → convert to string first
  // If backend returns string → use directly
  const statusMap = { 1: "Present", 2: "Absent", 3: "Late", 4: "Excused" };
  const statusKey = typeof status === "number" ? statusMap[status] : status;

  const config = STATUS_CONFIG[statusKey] ?? {
    label: statusKey,
    classes: "bg-slate-50 text-slate-600 border border-slate-100",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[11px]
                      font-semibold ${config.classes}`}
    >
      {config.label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────
const AttendancePage = () => {
  const dispatch = useDispatch();

  // ── Read from Redux store ─────────────────────────────────
  const attendances = useSelector(selectAttendances);
  const loading = useSelector(selectAttendanceLoading);
  const error = useSelector(selectAttendanceError);
  const deleting = useSelector(selectAttendanceDeleting);

  // ── Local UI state ────────────────────────────────────────
  // WHY local state for these?
  // Modal open/close, selected record, and filter values
  // are only needed by THIS component — no other component
  // cares about them. So local useState is the right choice.
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // ── Filter state ──────────────────────────────────────────
  // WHY two separate filter states?
  // The user can filter by EITHER date OR studentId.
  // Having them separate makes it easy to clear one
  // without affecting the other.
  const [filterDate, setFilterDate] = useState("");
  const [filterStudentId, setFilterStudentId] = useState("");

  // ── Fetch all on mount ────────────────────────────────────
  // WHY useCallback?
  // useCallback memoizes this function — it won't be
  // recreated on every render.
  // WHY pass it to useEffect dependency array?
  // So the effect re-runs if the function changes.
  const loadAll = useCallback(() => {
    dispatch(fetchAttendances());
  }, [dispatch]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Filter Handlers ───────────────────────────────────────

  // Filter by date
  // WHY clear studentId filter first?
  // We only want ONE filter active at a time.
  // Having both would confuse the user.
  const handleFilterByDate = (e) => {
    const date = e.target.value;
    setFilterDate(date);
    setFilterStudentId(""); // clear other filter

    if (date) {
      dispatch(fetchAttendanceByDate(date));
    } else {
      // If date is cleared → reload all
      loadAll();
    }
  };

  // Filter by student ID
  const handleFilterByStudent = (e) => {
    const id = e.target.value;
    setFilterStudentId(id);
    setFilterDate(""); // clear other filter

    if (id) {
      dispatch(fetchAttendanceByStudent(id));
    } else {
      loadAll();
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilterDate("");
    setFilterStudentId("");
    loadAll();
  };

  // ── Modal Handlers ────────────────────────────────────────
  const handleAdd = () => {
    setSelectedRecord(null); // null = add mode
    setShowForm(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record); // record = edit mode
    setShowForm(true);
  };

  const handleDeleteClick = (record) => {
    setSelectedRecord(record);
    setShowDelete(true);
  };

  const handleDeleteConfirm = async () => {
    const result = await dispatch(removeAttendance(selectedRecord.id));
    if (removeAttendance.fulfilled.match(result)) {
      setShowDelete(false);
      setSelectedRecord(null);
    }
  };

  // ── Format date for display ───────────────────────────────
  // WHY a helper function?
  // "2026-05-24T16:15:26.39" is ugly to display.
  // We want "May 24, 2026" instead.
  // Putting this logic here keeps the JSX clean.
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ── Page Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Attendance Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {attendances.length} records found
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 bg-indigo-600
                     hover:bg-indigo-700 text-white px-4 py-2.5
                     rounded-xl text-xs font-semibold transition
                     shadow-sm shadow-indigo-100"
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
          Mark Attendance
        </button>
      </div>

      {/* ── Filter Bar ───────────────────────────────────── */}
      {/* WHY a filter bar?
          Attendance grows fast — a school with 100 students
          gets 100 records per day. Filters are essential. */}
      <div
        className="bg-white rounded-xl border border-slate-100
                      shadow-sm p-4 flex flex-wrap items-end gap-4"
      >
        {/* Filter by Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500">
            Filter by Date
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={handleFilterByDate}
            className="border border-slate-200 rounded-xl px-3 py-2
                       text-sm text-slate-800 focus:outline-none
                       focus:ring-2 focus:ring-indigo-500/20
                       focus:border-indigo-500 transition"
          />
        </div>

        {/* Filter by Student ID */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500">
            Filter by Student ID
          </label>
          <input
            type="number"
            placeholder="e.g. 5"
            value={filterStudentId}
            onChange={handleFilterByStudent}
            className="border border-slate-200 rounded-xl px-3 py-2
                       text-sm text-slate-800 w-36 focus:outline-none
                       focus:ring-2 focus:ring-indigo-500/20
                       focus:border-indigo-500 transition"
          />
        </div>

        {/* Clear Filters Button */}
        {/* WHY only show when a filter is active?
            No point showing "Clear" when nothing is filtered.
            This is called conditional rendering. */}
        {(filterDate || filterStudentId) && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-xs font-semibold text-slate-600
                       border border-slate-200 rounded-xl hover:bg-slate-50
                       transition self-end"
          >
            ✕ Clear Filters
          </button>
        )}

        {/* Active Filter Indicator */}
        {filterDate && (
          <span className="self-end text-xs text-indigo-600 font-medium">
            📅 Showing: {formatDate(filterDate)}
          </span>
        )}
        {filterStudentId && (
          <span className="self-end text-xs text-indigo-600 font-medium">
            👤 Showing: Student #{filterStudentId}
          </span>
        )}
      </div>

      {/* ── Error Message ─────────────────────────────────── */}
      {error && (
        <div
          className="bg-red-50 border border-red-100 text-red-700
                        text-sm rounded-xl px-4 py-3 flex gap-2"
        >
          ⚠️ {error}
        </div>
      )}

      {/* ── Main Table ───────────────────────────────────── */}
      <div
        className="bg-white rounded-xl border border-slate-100
                      shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            {/* Table Headers */}
            <thead className="bg-slate-50/70 border-b border-slate-100">
              <tr>
                {["#", "Student", "Date", "Status", "Notes", "Actions"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-[11px] font-bold
                                 text-slate-400 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {/* ── Loading Skeleton ─────────────────────── */}
              {/* WHY skeleton rows instead of a spinner?
                  Skeleton loaders show the TABLE STRUCTURE
                  while loading — less jarring than a spinner
                  that makes the whole table disappear. */}
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-3.5 bg-slate-100 rounded-md w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : attendances.length === 0 ? (
                // ── Empty State ───────────────────────────
                <tr>
                  <td colSpan={6} className="text-center py-14 text-slate-400">
                    <div className="text-3xl mb-2">📋</div>
                    <p className="text-sm font-medium text-slate-800">
                      No attendance records found
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Click "Mark Attendance" to add the first record
                    </p>
                  </td>
                </tr>
              ) : (
                // ── Data Rows ─────────────────────────────
                attendances.map((record, index) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Row number */}
                    <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">
                      {index + 1}
                    </td>

                    {/* Student Name + Avatar */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        {/* WHY avatar initials?
                            Visual anchor — easier to scan
                            a list with visual indicators. */}
                        <div
                          className="w-7 h-7 rounded-full bg-indigo-50
                                        border border-indigo-100 text-indigo-600
                                        flex items-center justify-center
                                        font-bold text-xs shrink-0"
                        >
                          {record.studentName?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">
                            {record.studentName ?? "Unknown"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            ID: {record.studentId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-xs text-slate-600 font-mono">
                      {formatDate(record.date)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={record.status} />
                    </td>

                    {/* Notes */}
                    {/* WHY truncate?
                        Notes can be long. We truncate to keep
                        the row height consistent. User can
                        click Edit to see the full note. */}
                    <td
                      className="px-4 py-3.5 text-xs text-slate-500
                                   max-w-[180px] truncate"
                    >
                      {record.notes || "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEdit(record)}
                          className="px-2.5 py-1 text-xs font-semibold
                                     bg-slate-50 border border-slate-100
                                     text-slate-600 hover:text-indigo-600
                                     hover:bg-indigo-50/50
                                     hover:border-indigo-100
                                     rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(record)}
                          className="px-2.5 py-1 text-xs font-semibold
                                     bg-slate-50 border border-slate-100
                                     text-slate-500 hover:text-red-600
                                     hover:bg-red-50/50
                                     hover:border-red-100
                                     rounded-lg transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────── */}
      <AttendanceForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        record={selectedRecord}
        onRefresh={loadAll}
      />
      <DeleteConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDeleteConfirm}
        teacherName={selectedRecord?.studentName ?? ""}
        deleting={deleting}
      />
    </div>
  );
};

export default AttendancePage;
