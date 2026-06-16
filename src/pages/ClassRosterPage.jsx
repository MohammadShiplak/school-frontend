// src/pages/ClassRosterPage.jsx
// ─────────────────────────────────────────────────────────────────
// This page shows who is in a class, lets Admin enroll new students,
// and lets Admin remove students.
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudentsByClass,
  createEnrollment,
  removeEnrollment,
  selectEnrollmentsByClass,
  selectEnrollmentLoading,
  selectEnrollmentSubmitting,
  selectEnrollmentSubmitError,
  selectEnrollmentDeleting,
  clearEnrollmentError,
} from "../features/enrollment/enrollmentSlice";

// ─────────────────────────────────────────────────────────────────
// CAPACITY BAR
// WHY a visual bar: Instantly communicates "how full is this class"
// without reading numbers. A progress bar is more scannable.
// ─────────────────────────────────────────────────────────────────
const CapacityBar = ({ current, capacity }) => {
  if (!capacity) return null;

  const pct = Math.min((current / capacity) * 100, 100);

  // Color based on how full: green → amber → red
  const barColor =
    pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-amber-400" : "bg-emerald-500";

  const textColor =
    pct >= 100
      ? "text-red-600"
      : pct >= 75
        ? "text-amber-600"
        : "text-emerald-600";

  return (
    <div className="flex items-center gap-3">
      {/* Bar track */}
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        {/* Bar fill — width driven by percentage */}
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Numeric label */}
      <span className={`text-xs font-semibold tabular-nums ${textColor}`}>
        {current}/{capacity}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// ENROLL FORM (inline, no separate modal for simplicity)
// ─────────────────────────────────────────────────────────────────
const EnrollForm = ({ classId, onSuccess }) => {
  const dispatch = useDispatch();
  const submitting = useSelector(selectEnrollmentSubmitting);
  const submitError = useSelector(selectEnrollmentSubmitError);

  const [studentId, setStudentId] = useState("");

  const handleSubmit = async () => {
    if (!studentId) return;

    const result = await dispatch(
      createEnrollment({
        studentId: Number(studentId),
        classId: Number(classId),
      }),
    );

    if (createEnrollment.fulfilled.match(result)) {
      setStudentId(""); // clear the input on success
      onSuccess?.(); // optional callback (e.g., refresh)
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-800 mb-3">
        Enroll a Student
      </h3>

      {/* Error banner */}
      {submitError && (
        <div
          className="mb-3 px-4 py-2.5 bg-red-50 border border-red-100 
                        text-red-700 text-sm rounded-xl"
        >
          ⚠️ {submitError}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Enter Student ID"
          value={studentId}
          onChange={(e) => {
            // WHY clearEnrollmentError on change:
            //   Previous error becomes stale once user starts editing.
            //   Clear it so they see a fresh state.
            dispatch(clearEnrollmentError());
            setStudentId(e.target.value);
          }}
          className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2 
                     text-sm text-slate-800 placeholder:text-slate-400 
                     focus:outline-none focus:ring-2 focus:ring-indigo-500/20 
                     focus:border-indigo-500 transition"
        />
        <button
          onClick={handleSubmit}
          disabled={submitting || !studentId}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 
                     disabled:bg-indigo-300 text-white text-sm font-semibold 
                     rounded-xl transition flex items-center gap-2"
        >
          {submitting ? (
            <>
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
              Enrolling...
            </>
          ) : (
            "Enroll"
          )}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────
const ClassRosterPage = () => {
  const dispatch = useDispatch();

  // WHY hardcode classId = 1 for now:
  //   In production you'd get this from useParams() (React Router).
  //   Example: const { classId } = useParams();
  //   For learning, we start with a fixed value.
  const classId = 1;

  const enrollments = useSelector(selectEnrollmentsByClass(classId));
  const loading = useSelector(selectEnrollmentLoading);
  const deleting = useSelector(selectEnrollmentDeleting);

  // ── Derive capacity info from first enrollment (all have same class data)
  const capacity = enrollments[0]?.capacity ?? 0;
  const className = enrollments[0]?.className ?? `Class ${classId}`;
  const currentCount = enrollments.length;

  useEffect(() => {
    dispatch(fetchStudentsByClass(classId));
  }, [dispatch, classId]);

  const handleUnenroll = async (studentId) => {
    await dispatch(removeEnrollment({ studentId, classId }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-6">
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {className} — Class Roster
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage student enrollments for this class.
        </p>
      </div>

      {/* ── CAPACITY CARD ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-700">
            Capacity Status
          </span>
          {currentCount >= capacity && capacity > 0 && (
            <span
              className="text-xs font-bold text-red-600 bg-red-50 
                             border border-red-100 px-2.5 py-0.5 rounded-full"
            >
              🔴 Class Full
            </span>
          )}
        </div>
        <CapacityBar current={currentCount} capacity={capacity} />
      </div>

      {/* ── ENROLL FORM ─────────────────────────────────────────── */}
      <EnrollForm
        classId={classId}
        onSuccess={() => dispatch(fetchStudentsByClass(classId))}
      />

      {/* ── ROSTER TABLE ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-slate-500">No students enrolled yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th
                  className="text-left px-5 py-3.5 text-xs font-semibold 
                               text-slate-500 uppercase tracking-wide"
                >
                  Student
                </th>
                <th
                  className="text-left px-5 py-3.5 text-xs font-semibold 
                               text-slate-500 uppercase tracking-wide"
                >
                  Student ID
                </th>
                <th
                  className="text-left px-5 py-3.5 text-xs font-semibold 
                               text-slate-500 uppercase tracking-wide"
                >
                  Enrolled On
                </th>
                <th
                  className="text-right px-5 py-3.5 text-xs font-semibold 
                               text-slate-500 uppercase tracking-wide"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {enrollments.map((e) => (
                <tr
                  key={e.studentId}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  {/* Student name with avatar initial */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full bg-indigo-100 
                                      text-indigo-600 flex items-center justify-center 
                                      text-xs font-bold shrink-0"
                      >
                        {e.studentName?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <span className="font-medium text-slate-800">
                        {e.studentName}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-500">#{e.studentId}</td>

                  <td className="px-5 py-4 text-slate-500 text-xs">
                    {new Date(e.enrolledAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  {/* Remove button */}
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleUnenroll(e.studentId)}
                      disabled={deleting}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 
                                 bg-red-50 hover:bg-red-100 border border-red-100 
                                 text-red-600 text-xs font-medium rounded-lg 
                                 transition disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ClassRosterPage;
