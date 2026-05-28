// src/components/attendance/AttendanceForm.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createAttendance,
  editAttendance,
  clearSubmitError,
  selectAttendanceSubmitting,
  selectAttendanceSubmitError,
} from "../../features/attendance/attendanceSlice";

// ─────────────────────────────────────────────────────────────
// WHY define STATUS_OPTIONS outside the component?
// This array never changes — it's constant data.
// If it was inside the component, React would recreate
// this array on EVERY render — wasted memory.
// Outside = created once, reused forever.
// ─────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 1, label: "Present", color: "text-emerald-600" },
  { value: 2, label: "Absent", color: "text-red-600" },
  { value: 3, label: "Late", color: "text-amber-600" },
  { value: 4, label: "Excused", color: "text-blue-600" },
];

// ── Reusable InputField ───────────────────────────────────────
// WHY reusable? Same label+input pattern repeats 4 times.
// One component = one place to fix styling bugs.
const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
}) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-slate-200 rounded-xl px-3.5 py-2
                 text-sm text-slate-800 placeholder:text-slate-400
                 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                 focus:border-indigo-500 transition duration-150"
    />
  </div>
);

// ── Empty form default values ─────────────────────────────────
// WHY define this outside?
// We reset to this after submit or close.
// If it was inside, we'd have to rewrite it in two places.
const emptyForm = {
  studentId: "",
  date: "",
  status: 1, // WHY 1? Default to "Present" — most common case
  notes: "",
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// Props:
//   isOpen   → controls visibility
//   onClose  → called when user clicks Cancel or X
//   record   → if provided = edit mode, if null = add mode
//   onRefresh → called after success to reload the list
// ─────────────────────────────────────────────────────────────
const AttendanceForm = ({ isOpen, onClose, record, onRefresh }) => {
  const dispatch = useDispatch();
  const submitting = useSelector(selectAttendanceSubmitting);
  const submitError = useSelector(selectAttendanceSubmitError);

  const [formData, setFormData] = useState(emptyForm);

  // ── Populate form when opening ──────────────────────────────
  // WHY useEffect with [isOpen, record]?
  // Runs whenever the modal opens or the record changes.
  // If record exists → fill form with existing data (edit mode)
  // If record is null → clear form (add mode)
  useEffect(() => {
    if (isOpen) {
      if (record) {
        // ── Edit mode — fill with existing data ───────────────
        setFormData({
          studentId: record.studentId ?? "",
          // WHY slice(0,10)?
          // API returns "2026-05-24T16:15:26.39"
          // Date input needs "2026-05-24" (only 10 chars)
          date: record.date ? record.date.slice(0, 10) : "",
          // WHY check STATUS_OPTIONS?
          // If status comes back as string "Present" we find value 1
          // If it comes back as number 1 we use it directly
          status:
            typeof record.status === "string"
              ? (STATUS_OPTIONS.find((s) => s.label === record.status)?.value ??
                1)
              : (record.status ?? 1),
          notes: record.notes ?? "",
        });
      } else {
        // ── Add mode — clear form ─────────────────────────────
        setFormData(emptyForm);
      }
      // Clear previous submit errors when modal opens
      dispatch(clearSubmitError());
    }
  }, [isOpen, record, dispatch]);

  // ── Handle any input change ───────────────────────────────
  // WHY one handler for all fields?
  // e.target.name matches the "name" prop on each input.
  // [name]: value uses the variable as a dynamic object key.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Close and reset ───────────────────────────────────────
  const handleClose = () => {
    setFormData(emptyForm);
    onClose();
  };

  // ── Submit (Add or Edit) ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Build the payload ─────────────────────────────────────
    // WHY Number(formData.studentId)?
    // HTML inputs always return strings.
    // Your API expects studentId as an integer, not "5".
    // Number("5") = 5 ✅   Number("") = 0 ❌ (we handle that below)
    const payload = {
      studentId: Number(formData.studentId),
      date: formData.date,
      status: Number(formData.status), // same reason — convert to int
      notes: formData.notes,
    };

    if (record) {
      // ── Edit mode ─────────────────────────────────────────
      const result = await dispatch(
        editAttendance({ id: record.id, attendanceData: payload }),
      );
      if (editAttendance.fulfilled.match(result)) {
        handleClose();
        onRefresh();
      }
    } else {
      // ── Add mode ──────────────────────────────────────────
      const result = await dispatch(createAttendance(payload));
      if (createAttendance.fulfilled.match(result)) {
        handleClose();
        onRefresh();
      }
    }
  };

  // ── Don't render if closed ────────────────────────────────
  // WHY early return?
  // No point rendering a hidden modal — saves memory.
  if (!isOpen) return null;

  return (
    // ── Backdrop ──────────────────────────────────────────────
    // WHY onClick={handleClose} on backdrop?
    // Clicking outside the modal closes it — standard UX pattern.
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm
                 flex items-center justify-center z-50 px-4"
      onClick={handleClose}
    >
      {/* Modal Box */}
      {/* WHY stopPropagation? Clicking INSIDE the modal
          would bubble up to the backdrop and close it.
          stopPropagation stops the event from bubbling. */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg
                   max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between p-5
                        border-b border-slate-100"
        >
          <h2 className="text-base font-bold text-slate-900">
            {record ? "✏️ Edit Attendance" : "➕ Mark Attendance"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400
                       hover:bg-slate-50 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        {/* ── Form Body ──────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 space-y-4"
        >
          {/* Error Banner */}
          {submitError && (
            <div
              className="bg-red-50 border border-red-100
                            text-red-700 text-sm rounded-xl px-4 py-3"
            >
              ⚠️ {submitError}
            </div>
          )}

          {/* Student ID */}
          <InputField
            label="Student ID"
            name="studentId"
            type="number"
            placeholder="e.g. 5"
            value={formData.studentId}
            onChange={handleChange}
          />

          {/* Date */}
          <InputField
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
          />

          {/* Status Dropdown */}
          {/* WHY a custom dropdown instead of InputField?
              InputField renders <input> but we need <select>.
              They behave differently so we build it separately. */}
          <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2
                         text-sm text-slate-800 bg-white
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                         focus:border-indigo-500 transition duration-150"
            >
              {/* WHY map STATUS_OPTIONS?
                  Instead of hardcoding 4 <option> tags,
                  we loop over our constant array.
                  If we add a new status later, we only
                  update STATUS_OPTIONS — not the JSX. */}
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes
            </label>
            {/* WHY textarea instead of InputField?
                Notes can be long — textarea allows multiple lines.
                InputField only renders single-line <input>. */}
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes..."
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2
                         text-sm text-slate-800 placeholder:text-slate-400
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                         focus:border-indigo-500 transition duration-150 resize-none"
            />
          </div>

          {/* ── Action Buttons ──────────────────────────────── */}
          <div
            className="flex justify-end gap-2.5 pt-4
                          border-t border-slate-100 mt-6"
          >
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-600
                         hover:bg-slate-50 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-medium bg-indigo-600
                         hover:bg-indigo-700 disabled:bg-indigo-400/70
                         text-white rounded-xl transition
                         flex items-center gap-2 shadow-sm"
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
                  Processing...
                </>
              ) : record ? (
                "Save Changes"
              ) : (
                "Mark Attendance"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceForm;
