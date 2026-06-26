// ═══════════════════════════════════════════════════════════════
// FILE: src/components/classSubject/ClassSubjectManager.jsx
//
// WHAT THIS COMPONENT DOES:
//   Shows a panel (inside a modal or page section) where an admin can:
//   1. See which subjects are assigned to a specific class
//   2. Assign a new subject (by entering its ID)
//   3. Remove a subject from the class
//
// PROPS:
//   classId   (number) — which class we're managing subjects for
//   className (string) — display name shown in the header
//   onClose   (fn)     — called when the user dismisses this panel
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSubjectsByClass,
  assignSubject,
  removeSubject,
  clearSubmitError,
  clearSubjects,
  selectClassSubjects,
  selectClassSubjectLoading,
  selectClassSubjectError,
  selectClassSubjectSubmitting,
  selectClassSubjectSubmitError,
  selectClassSubjectDeleting,
} from "../../features/classSubject/classSubjectSlice";

// ── OUTSIDE COMPONENT: pure helper, no state ─────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// ────────────────────────────────────────────────────────────────
const ClassSubjectManager = ({
  classId,
  className,
  onClose,
  classOptions = [],
  onClassChange,
}) => {
  const dispatch = useDispatch();

  // ── READ REDUX STATE ──────────────────────────────────────────
  const subjects = useSelector(selectClassSubjects);
  const loading = useSelector(selectClassSubjectLoading);
  const error = useSelector(selectClassSubjectError);
  const submitting = useSelector(selectClassSubjectSubmitting);
  const submitError = useSelector(selectClassSubjectSubmitError);
  const deleting = useSelector(selectClassSubjectDeleting);

  // ── LOCAL STATE ───────────────────────────────────────────────
  const [subjectIdInput, setSubjectIdInput] = useState("");
  const [deletingSubjectId, setDeletingSubjectId] = useState(null);

  // ── FETCH ON MOUNT / GUARD AGAINST INVALID ID ──────────────────
  useEffect(() => {
    // FIX: If classId is 0, falsy, or negative, do not call the backend API
    if (!classId || Number(classId) <= 0) {
      return;
    }

    dispatch(fetchSubjectsByClass(classId));

    return () => {
      dispatch(clearSubjects()); // runs when component unmounts
    };
  }, [dispatch, classId]);

  // ── ASSIGN HANDLER ────────────────────────────────────────────
  const handleAssign = async () => {
    const classIdNumber = Number(classId);
    const subjectIdNumber = Number(subjectIdInput.trim());

    if (!Number.isInteger(classIdNumber) || classIdNumber <= 0) {
      console.error("Invalid classId:", classId);
      return;
    }

    if (!Number.isInteger(subjectIdNumber) || subjectIdNumber <= 0) {
      return;
    }

    const result = await dispatch(
      assignSubject({
        classId: classIdNumber,
        subjectId: subjectIdNumber,
      }),
    );

    if (assignSubject.fulfilled.match(result)) {
      setSubjectIdInput("");
      dispatch(clearSubmitError());
    }
  };

  // ── REMOVE HANDLER ────────────────────────────────────────────
  const handleRemove = async (subjectId) => {
    // Safeguard to prevent dispatching deletion requests if classId is broken
    if (!classId || Number(classId) <= 0) return;

    setDeletingSubjectId(subjectId);

    const result = await dispatch(removeSubject({ classId, subjectId }));

    if (removeSubject.fulfilled.match(result)) {
      setDeletingSubjectId(null);
    } else {
      setDeletingSubjectId(null);
    }
  };

  // ── KEYBOARD SHORTCUT ─────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAssign();
  };

  // ════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════
  return (
    // ── BACKDROP ─────────────────────────────────────────────────
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm
                 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      {/* ── MODAL CARD ─────────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-xl
                   max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              📚 Manage Subjects
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Class:{" "}
              <span className="font-semibold text-indigo-600">
                {className || "Unknown Class"}
              </span>
            </p>
            {classOptions.length > 0 && onClassChange && (
              <select
                value={Number(classId)}
                onChange={(e) => onClassChange(Number(e.target.value))}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {classOptions.map((item) => {
                  const id = Number(item.id ?? item.Id);
                  const name = item.name ?? item.Name ?? `Class ${id}`;

                  return (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-50
                       hover:text-slate-600 transition"
          >
            {/* X icon */}
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
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ── ASSIGN NEW SUBJECT FORM ──────────────────────────── */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/40">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
            Assign a Subject
          </p>

          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              placeholder="Enter Subject ID (e.g. 3)"
              value={subjectIdInput}
              onChange={(e) => setSubjectIdInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={submitting}
              className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2
                         text-sm text-slate-800 placeholder:text-slate-400
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                         focus:border-indigo-500 transition disabled:opacity-50"
            />

            <button
              onClick={handleAssign}
              disabled={submitting || !subjectIdInput}
              className="inline-flex items-center gap-1.5 px-4 py-2
                         bg-indigo-600 hover:bg-indigo-700
                         disabled:bg-indigo-400/70
                         text-white text-sm font-semibold rounded-xl
                         transition shadow-sm shadow-indigo-200
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              {submitting ? (
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              ) : (
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
              )}
              Assign
            </button>
          </div>

          {/* Error from assign attempt */}
          {submitError && (
            <div
              className="mt-2 flex items-start gap-2 text-xs text-red-600
                            bg-red-50 border border-red-100 rounded-xl px-3 py-2"
            >
              <span>⚠️</span>
              <span>{submitError}</span>
            </div>
          )}
        </div>

        {/* ── SUBJECTS LIST ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {/* Loading skeleton */}
          {loading && (
            <div className="p-5 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="h-8 bg-slate-100 rounded-xl flex-1" />
                  <div className="h-8 bg-slate-100 rounded-xl w-16" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="p-8 text-center">
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <button
                onClick={() => {
                  if (classId && Number(classId) > 0) {
                    dispatch(fetchSubjectsByClass(classId));
                  }
                }}
                className="mt-2 text-xs text-indigo-600 underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && subjects.length === 0 && (
            <div className="p-10 flex flex-col items-center gap-2 text-center">
              <div
                className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center
                              justify-center text-slate-400 text-2xl"
              >
                📭
              </div>
              <p className="text-sm font-semibold text-slate-700">
                No subjects assigned
              </p>
              <p className="text-xs text-slate-400">
                Use the form above to assign the first subject to this class.
              </p>
            </div>
          )}

          {/* Subject rows */}
          {!loading && !error && subjects.length > 0 && (
            <ul className="divide-y divide-slate-50">
              {subjects.map((cs) => {
                const isThisRowDeleting = deletingSubjectId === cs.subjectId;

                return (
                  <li
                    key={cs.subjectId}
                    className="flex items-center justify-between px-5 py-3.5
                               hover:bg-slate-50/50 transition-colors duration-100"
                  >
                    {/* Subject info */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl bg-violet-100 text-violet-600
                                      flex items-center justify-center
                                      text-xs font-bold shrink-0"
                      >
                        {cs.subjectName?.[0]?.toUpperCase() ?? "?"}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {cs.subjectName}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          ID: {cs.subjectId} · Assigned{" "}
                          {formatDate(cs.assignedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(cs.subjectId)}
                      disabled={isThisRowDeleting || deleting}
                      title="Remove subject from class"
                      className="inline-flex items-center gap-1 px-3 py-1.5
                                 bg-white hover:bg-red-50 border border-slate-200
                                 hover:border-red-200 text-slate-500 hover:text-red-600
                                 disabled:opacity-40 disabled:cursor-not-allowed
                                 rounded-lg text-xs font-medium transition-all"
                    >
                      {isThisRowDeleting ? (
                        <svg
                          className="animate-spin h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                      ) : (
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
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107
                               1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244
                               2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456
                               0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114
                               1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916
                               c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32
                               0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667
                               48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      )}
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── FOOTER ─────────────────────────────────────────────── */}
        <div
          className="p-4 border-t border-slate-100 bg-slate-50/40
                        flex items-center justify-between"
        >
          <p className="text-xs text-slate-400">
            {subjects.length} subject{subjects.length !== 1 ? "s" : ""} assigned
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600
                       hover:bg-slate-100 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassSubjectManager;
