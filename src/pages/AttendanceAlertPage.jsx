import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAlerts,
  resolveAlertThunk,
  selectAlerts,
  selectAlertsLoading,
  selectAlertsError,
  selectAlertsResolving,
} from "../features/attendanceAlert/attendanceAlertSlice";

// ── STATUS BADGE ───────────────────────────────────────────────
// WHY outside the page component: pure display, no state, no re-render risk.
const AlertStatusBadge = ({ status }) => {
  // status from API: 1=Active, 2=Resolved, 3=Dismissed
  const config = {
    1: { label: "Active", classes: "bg-red-50 text-red-700 border-red-100" },
    2: {
      label: "Resolved",
      classes: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    3: {
      label: "Dismissed",
      classes: "bg-slate-100 text-slate-500 border-slate-200",
    },
  };
  const c = config[status] ?? config[1];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.classes}`}
    >
      {c.label}
    </span>
  );
};

// ── RESOLVE MODAL ──────────────────────────────────────────────
// WHY a separate modal component:
//   The resolve action needs user input (status + notes).
//   A modal is the right UX pattern for a focused action.
//   Defined OUTSIDE the parent to prevent remounting on re-renders.
const ResolveModal = ({ isOpen, alert, onClose, onConfirm, resolving }) => {
  const [status, setStatus] = useState(2); // 2 = Resolved
  const [notes, setNotes] = useState("");

  // Reset form when modal opens with a new alert
  useEffect(() => {
    if (isOpen) {
      setStatus(2);
      setNotes("");
    }
  }, [isOpen, alert]);

  if (!isOpen || !alert) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-amber-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Resolve Alert
            </h3>
            <p className="text-xs text-slate-500">{alert.studentName}</p>
          </div>
        </div>

        {/* Alert summary */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-sm text-red-700">
          🚨 {alert.consecutiveAbsences} consecutive absences detected on{" "}
          {new Date(alert.alertDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>

        {/* Resolution type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Resolution Type
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(Number(e.target.value))}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500/20 
                       focus:border-indigo-500 transition bg-white"
          >
            {/* WHY value={2} and value={3}: these match AlertStatus enum integers */}
            <option value={2}>
              ✅ Resolved — Contacted parent, issue handled
            </option>
            <option value={3}>
              ❌ Dismissed — False positive / already handled
            </option>
          </select>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Called mother on +962 79 XXX XXXX — student was ill, doctor's note provided."
            rows={3}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm
                       text-slate-800 placeholder:text-slate-400 resize-none
                       focus:outline-none focus:ring-2 focus:ring-indigo-500/20 
                       focus:border-indigo-500 transition"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 
                       border border-slate-200 hover:bg-slate-50 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ status, notes })}
            disabled={resolving}
            className="flex-1 px-4 py-2 text-sm font-medium bg-indigo-600 
                       hover:bg-indigo-700 disabled:bg-indigo-400/70 
                       text-white rounded-xl transition flex items-center justify-center gap-2"
          >
            {resolving ? (
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
                Saving...
              </>
            ) : (
              "Confirm Resolution"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── MAIN PAGE ──────────────────────────────────────────────────
const AttendanceAlertPage = () => {
  const dispatch = useDispatch();
  const alerts = useSelector(selectAlerts);
  const loading = useSelector(selectAlertsLoading);
  const error = useSelector(selectAlertsError);
  const resolving = useSelector(selectAlertsResolving);

  // Filter: "all" shows everything, "active" shows only unresolved
  const [filter, setFilter] = useState("all"); // "all" | "active"

  // Resolve modal state
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Fetch alerts when page loads
  useEffect(() => {
    dispatch(fetchAlerts());
  }, [dispatch]);

  // Client-side filter
  const displayed =
    filter === "active" ? alerts.filter((a) => a.status === 1) : alerts;

  // Open the resolve modal for a specific alert
  const handleResolveClick = (alert) => {
    setSelectedAlert(alert);
    setIsResolveOpen(true);
  };

  // Submit the resolution
  const handleConfirmResolve = async (resolveData) => {
    if (!selectedAlert) return;
    const result = await dispatch(
      resolveAlertThunk({ alertId: selectedAlert.id, resolveData }),
    );
    if (resolveAlertThunk.fulfilled.match(result)) {
      setIsResolveOpen(false);
      setSelectedAlert(null);
    }
  };

  // Active alert count for the summary card
  const activeCount = alerts.filter((a) => a.status === 1).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-6">
      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            🚨 Attendance Alerts
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Students with 3+ consecutive absences
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchAlerts())}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border 
                     border-slate-200 rounded-xl text-sm font-medium text-slate-600 
                     hover:bg-slate-50 transition"
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

      {/* ── SUMMARY CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active alerts card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <span className="text-lg">🚨</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{activeCount}</p>
              <p className="text-xs text-slate-500 font-medium">
                Active Alerts
              </p>
            </div>
          </div>
        </div>

        {/* Resolved card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <span className="text-lg">✅</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">
                {alerts.filter((a) => a.status === 2).length}
              </p>
              <p className="text-xs text-slate-500 font-medium">Resolved</p>
            </div>
          </div>
        </div>

        {/* Total card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">
                {alerts.length}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Total All Time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ───────────────────────────────────────────── */}
      <div className="flex gap-2">
        {["all", "active"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
              filter === f
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f === "all" ? "All Alerts" : "🔴 Active Only"}
          </button>
        ))}
      </div>

      {/* ── LOADING ───────────────────────────────────────────────── */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading alerts...</p>
        </div>
      )}

      {/* ── ERROR ─────────────────────────────────────────────────── */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* ── EMPTY STATE ───────────────────────────────────────────── */}
      {!loading && !error && displayed.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-base font-semibold text-slate-700">No alerts!</p>
          <p className="text-sm text-slate-400 mt-1">
            {filter === "active"
              ? "All active alerts have been resolved."
              : "No students have triggered consecutive absence alerts."}
          </p>
        </div>
      )}

      {/* ── ALERTS TABLE ─────────────────────────────────────────── */}
      {!loading && !error && displayed.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Student
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Absences
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Alert Date
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Notes
                  </th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayed.map((alert) => (
                  <tr
                    key={alert.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Student */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">
                          {alert.studentName?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span className="font-semibold text-slate-800">
                          {alert.studentName ?? "Unknown Student"}
                        </span>
                      </div>
                    </td>

                    {/* Consecutive absences */}
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded-lg text-xs font-bold">
                        🚨 {alert.consecutiveAbsences} days
                      </span>
                    </td>

                    {/* Alert date */}
                    <td className="px-4 py-4 text-slate-600 text-sm">
                      {new Date(alert.alertDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-4">
                      <AlertStatusBadge status={alert.status} />
                    </td>

                    {/* Notes */}
                    <td className="px-4 py-4">
                      {alert.notes ? (
                        <span
                          className="text-xs text-slate-500 max-w-[180px] truncate block"
                          title={alert.notes}
                        >
                          {alert.notes}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300 italic">—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      {/* Only show Resolve button for Active alerts */}
                      {alert.status === 1 ? (
                        <button
                          onClick={() => handleResolveClick(alert)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 
                                     bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 
                                     text-indigo-700 rounded-lg text-xs font-medium transition"
                        >
                          ✅ Resolve
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300 italic">
                          Closed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── RESOLVE MODAL ────────────────────────────────────────── */}
      <ResolveModal
        isOpen={isResolveOpen}
        alert={selectedAlert}
        onClose={() => {
          setIsResolveOpen(false);
          setSelectedAlert(null);
        }}
        onConfirm={handleConfirmResolve}
        resolving={resolving}
      />
    </div>
  );
};

export default AttendanceAlertPage;
