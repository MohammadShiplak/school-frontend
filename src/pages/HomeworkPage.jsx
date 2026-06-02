// ═══════════════════════════════════════════════════════════════
//  HomeworkPage.jsx
//  ─────────────────────────────────────────────────────────────
//  The main page that displays all homework in a table with
//  pagination, and handles Add / Edit / Delete actions.
//
//  This follows the EXACT same pattern as your StudentsPage.jsx
//  and TeachersPage.jsx — always maintain consistency!
//
//  ARCHITECTURE: Page Component (smart) → Form Component (dumb-ish)
//   - Page: knows about Redux, fetches data, manages modal state
//   - Form: knows about form fields, dispatches actions
//   - DeleteModal: pure UI, gets callbacks from Page
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
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

// ⚠️ Adjust paths to match YOUR project: src/features/homework/...
import HomeworkForm from "../components/Homeworks/HomeworkForm";

import DeleteConfirmModal from "../components/students/DeleteConfirmModel";
// WHY reuse DeleteConfirmModal: It's a generic "are you sure?" dialog.
// It takes `onConfirm`, `onClose`, `teacherName` (we'll pass homework title), `deleting`.
// Reusing it avoids creating duplicate UI components.

// ── STATUS BADGE HELPER ───────────────────────────────────────────
// WHY a helper function:
//   The Status column needs different colors for Active vs Archived.
//   A function keeps this logic out of the JSX (cleaner template).
//   ALTERNATIVE: a lookup object: { 1: "bg-green-50...", 2: "bg-slate-50..." }
//   Both work — the function approach is more readable for conditionals.
const getStatusBadge = (status) => {
  // status is the enum integer from the API (1 = Active, 2 = Archived)
  if (status === 1) {
    return (
      <span
        className="px-2 py-0.5 rounded-full text-[11px] font-semibold 
                       bg-green-50 text-green-700"
      >
        Active
      </span>
    );
  }
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[11px] font-semibold 
                     bg-slate-100 text-slate-500"
    >
      Archived
    </span>
  );
};

// ── DATE FORMATTER ────────────────────────────────────────────────
// WHY: The API returns "2026-06-15T14:00:00" — ugly in a table.
//      We format it to "Jun 15, 2026 14:00" — human readable.
//      ALTERNATIVE: Use date-fns or dayjs libraries for more power.
//      For this use case, built-in Intl.DateTimeFormat is sufficient.
const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ── THE PAGE COMPONENT ────────────────────────────────────────────
export const HomeworkPage = () => {
  const dispatch = useDispatch();

  // WHY useSelector for each piece of state separately:
  //   If you select the whole state (state.homework), the component
  //   re-renders whenever ANY part of state.homework changes.
  //   Selecting specific values means the component only re-renders
  //   when THAT specific value changes. Better performance.
  const homeworks = useSelector(selectHomeworks);
  const meta = useSelector(selectHomeworkMeta);
  const loading = useSelector(selectHomeworkLoading);
  const error = useSelector(selectHomeworkError);
  const deleting = useSelector(selectHomeworkDeleting);

  // ── LOCAL UI STATE ────────────────────────────────────────────────
  // WHY local state for modal visibility and selected item:
  //   These are EPHEMERAL UI states — only needed by this component.
  //   No other component cares if the form modal is open.
  //   Rule: UI state → local state. Shared data → Redux state.
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState(null);
  // selected = the HomeworkDTO being edited/deleted (null = nothing selected)

  // ── FETCH DATA ────────────────────────────────────────────────────
  // WHY useCallback:
  //   refreshHomework is a function. If defined without useCallback,
  //   React creates a NEW function object on every render.
  //   useEffect depends on refreshHomework — a new reference would
  //   trigger an infinite loop: render → new function → useEffect → fetch → render...
  //   useCallback memoizes the function, only recreating it when
  //   [dispatch, meta.pageNumber, meta.pageSize] actually change.
  const refreshHomework = useCallback(() => {
    dispatch(
      fetchHomework({
        pageNumber: meta.pageNumber,
        pageSize: meta.pageSize,
      }),
    );
  }, [dispatch, meta.pageNumber, meta.pageSize]);

  // WHY useEffect:
  //   Side effects (API calls) can't happen during render.
  //   useEffect runs AFTER render completes.
  //   Dependencies [meta.pageNumber]: re-fetch when the page changes.
  useEffect(() => {
    refreshHomework();
  }, [refreshHomework, meta.pageNumber]);

  // ── ACTION HANDLERS ───────────────────────────────────────────────
  const handleAdd = () => {
    setSelected(null); // no pre-filled data = create mode
    setShowForm(true);
  };

  const handleEdit = (hw) => {
    setSelected(hw); // pre-fill form with this homework
    setShowForm(true);
  };

  const handleDeleteClick = (hw) => {
    setSelected(hw);
    setShowDelete(true);
  };

  const handleDeleteConfirm = async () => {
    const result = await dispatch(removeHomework(selected.id));
    if (removeHomework.fulfilled.match(result)) {
      setShowDelete(false);
      setSelected(null);
      refreshHomework();
    }
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
    // This updates pageNumber in Redux → triggers the useEffect → re-fetches
  };

  // ── RENDER ────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ── PAGE HEADER ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Homework Assignments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {meta.totalRecords || 0} assignments on record
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 bg-indigo-600 
                     hover:bg-indigo-700 text-white px-4 py-2.5 
                     rounded-xl text-xs font-semibold transition shadow-sm"
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

      {/* ── ERROR BANNER ─────────────────────────────────────────── */}
      {error && (
        <div
          className="bg-red-50 border border-red-100 text-red-700 
                        text-sm rounded-xl px-4 py-3"
        >
          ⚠️ {error}
        </div>
      )}

      {/* ── TABLE CARD ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            {/* TABLE HEADER */}
            <thead className="bg-slate-50/70 border-b border-slate-100">
              <tr>
                {[
                  "#",
                  "Title",
                  "Description",
                  "Teacher",
                  "Class",
                  "Subject",
                  "Due Date",
                  "Status",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-[11px] font-bold 
                                 text-slate-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {/* ── LOADING SKELETON ─────────────────────────────── */}
              {/* WHY skeleton instead of spinner:
                   Skeleton shows WHERE data will appear — less jarring than a spinner.
                   Users know the layout before the data arrives. */}
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-3.5 bg-slate-100 rounded-md w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !homeworks || homeworks.length === 0 ? (
                /* ── EMPTY STATE ──────────────────────────────────── */
                <tr>
                  <td colSpan={8} className="text-center py-14">
                    <div className="text-3xl mb-2">📚</div>
                    <p className="text-sm font-medium text-slate-800">
                      No homework assignments yet
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Click "Assign Homework" to create the first assignment.
                    </p>
                  </td>
                </tr>
              ) : (
                /* ── DATA ROWS ────────────────────────────────────── */
                homeworks.map((hw, index) => {
                  if (!hw) return null;
                  return (
                    <tr
                      key={hw.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Row number */}
                      <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">
                        {(meta.pageNumber - 1) * meta.pageSize + index + 1}
                      </td>

                      {/* Title with icon */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg bg-indigo-50 border 
                                          border-indigo-100 text-indigo-600 flex 
                                          items-center justify-center text-xs shrink-0"
                          >
                            📋
                          </div>
                          <span
                            className="font-semibold text-slate-800 max-w-[160px] 
                                           truncate"
                            title={hw.title}
                          >
                            {hw.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="font-semibold text-slate-800 max-w-[160px] 
                                           truncate"
                            title={hw.description}
                          >
                            {hw.description}
                          </span>
                        </div>
                      </td>

                      {/* Teacher Name — from the DTO's denormalized field */}
                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        {hw.teacherName || "—"}
                      </td>

                      {/* Class Name */}
                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        {hw.className || (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Subject Name */}
                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        {hw.subjectName || (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Due Date — formatted with our helper */}
                      <td className="px-4 py-3.5 text-xs text-slate-600 font-mono whitespace-nowrap">
                        {formatDateTime(hw.dueDate)}
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3.5">
                        {getStatusBadge(hw.status)}
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEdit(hw)}
                            className="px-2.5 py-1 text-xs font-semibold bg-slate-50 
                                       border border-slate-100 text-slate-600 
                                       hover:text-indigo-600 hover:bg-indigo-50/50 
                                       hover:border-indigo-100 rounded-lg transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(hw)}
                            className="px-2.5 py-1 text-xs font-semibold bg-slate-50 
                                       border border-slate-100 text-slate-500 
                                       hover:text-red-600 hover:bg-red-50/50 
                                       hover:border-red-100 rounded-lg transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ────────────────────────────────────────── */}
        {!loading && meta.totalPages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3 
                          bg-slate-50/40 border-t border-slate-100"
          >
            <p className="text-xs font-medium text-slate-400">
              Page {meta.pageNumber} of {meta.totalPages} ({meta.totalRecords}{" "}
              total)
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => handlePageChange(meta.pageNumber - 1)}
                disabled={meta.pageNumber === 1}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 
                           border border-slate-200 rounded-lg bg-white 
                           hover:bg-slate-50 disabled:opacity-40 
                           disabled:cursor-not-allowed transition"
              >
                Prev
              </button>
              <button
                onClick={() => handlePageChange(meta.pageNumber + 1)}
                disabled={meta.pageNumber === meta.totalPages}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 
                           border border-slate-200 rounded-lg bg-white 
                           hover:bg-slate-50 disabled:opacity-40 
                           disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MODALS ───────────────────────────────────────────────── */}
      {/* WHY render modals at the bottom of the page, not inside the table:
           Modals need to escape the table's overflow:hidden container.
           Placing them at the root level ensures they cover the full viewport.
           They use fixed positioning so their DOM position doesn't matter. */}
      <HomeworkForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        homework={selected}
        onRefresh={refreshHomework}
      />

      <DeleteConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDeleteConfirm}
        teacherName={selected?.title ?? ""}
        // WHY teacherName prop: DeleteConfirmModal uses `teacherName` in its message.
        // We pass the homework title — the modal just displays whatever string it gets.
        deleting={deleting}
      />
    </div>
  );
};

export default HomeworkPage;
