// ═══════════════════════════════════════════════════════════════
//  HomeworkForm.jsx
//  ─────────────────────────────────────────────────────────────
//  A modal form for CREATING and EDITING homework assignments.
//  Used by both teachers and admins.
//
//  WHY one form for both create and edit:
//   The only difference is:
//   - Edit: form is pre-filled with existing data
//   - Create: form starts empty
//   - The submit handler calls different thunks
//   Using one component avoids duplicating UI code.
//   The `homework` prop drives which mode we're in (null = create).
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createHomework,
  editHomework,
  clearSubmitError,
  selectHomeworkSubmitting,
  selectHomeworkSubmitError,
} from "../../features/homework/homeworkSlice";
// ⚠️ Adjust path to match your project: src/features/homework/homeworkSlice.js

// ── REUSABLE INPUT COMPONENT ─────────────────────────────────────
// WHY extract InputField:
//   Every field needs the same label + input + styling pattern.
//   Extracting it removes repetition and makes the form easier to read.
//   Defined OUTSIDE the parent component to avoid re-creating it on every render.
//
// WHY outside not inside:
//   If defined inside HomeworkForm, React creates a new component definition
//   on every render → React unmounts/remounts it → loses focus.
//   Always define helper components outside their parent.
const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = true,
}) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 
                 text-sm text-slate-800 placeholder:text-slate-400 
                 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 
                 focus:border-indigo-500 transition duration-150"
    />
  </div>
);

// ── EMPTY FORM STATE ─────────────────────────────────────────────
// WHY a constant outside the component:
//   When we reset the form (after submit / on close), we need the initial values.
//   Defining it outside means it's created ONCE, not on every render.
const emptyForm = {
  teacherId: "",
  classId: "",
  subjectId: "",
  title: "",
  description: "",
  dueDate: "",
  status: 1, // 1 = Active (matches your enum: HomeworkStatus.Active = 1)
};

// ── THE FORM COMPONENT ────────────────────────────────────────────
// Props explained:
//   isOpen    = boolean — controls visibility (modal pattern)
//   onClose   = function — called when user cancels or form submits
//   homework  = HomeworkDTO | null — null = create mode, object = edit mode
//   onRefresh = function — called after success to re-fetch the list
const HomeworkForm = ({ isOpen, onClose, homework, onRefresh }) => {
  const dispatch = useDispatch();
  const submitting = useSelector(selectHomeworkSubmitting);
  const submitError = useSelector(selectHomeworkSubmitError);

  // ── LOCAL FORM STATE ────────────────────────────────────────────
  // WHY local state (useState) instead of Redux state:
  //   Form data is TEMPORARY — it only matters while the form is open.
  //   Storing it in Redux would be overkill: it's not shared between components.
  //   Rule of thumb: Is this data needed OUTSIDE this component? No → local state.
  const [formData, setFormData] = useState(emptyForm);

  // ── POPULATE FORM ON EDIT ────────────────────────────────────────
  // WHY useEffect with [homework, isOpen] dependency:
  //   When the form OPENS with a homework to edit, fill the fields.
  //   When the form OPENS for create (homework = null), clear the fields.
  //   We watch isOpen too: if the user closes and reopens, we reset properly.
  useEffect(() => {
    if (isOpen) {
      if (homework) {
        // EDIT MODE: pre-fill with existing data
        setFormData({
          teacherId: homework.teacherId || "",
          classId: homework.classId || "",
          subjectId: homework.subjectId || "",
          title: homework.title || "",
          description: homework.description || "",
          // WHY slice(0, 16): HTML datetime-local input expects "YYYY-MM-DDTHH:MM"
          //   but the API returns "2026-06-15T00:00:00" (full ISO string).
          //   Slicing to 16 chars gives exactly what the input needs.
          dueDate: homework.dueDate ? homework.dueDate.slice(0, 16) : "",
          status: homework.status || 1,
        });
      } else {
        // CREATE MODE: blank form
        setFormData(emptyForm);
      }
      // Clear old errors whenever the form opens
      dispatch(clearSubmitError());
    }
  }, [homework, isOpen, dispatch]);

  // ── HANDLE INPUT CHANGE ──────────────────────────────────────────
  // WHY one generic handler instead of one per field:
  //   The `name` attribute on each input matches the formData key.
  //   e.target.name = "title" → updates formData.title.
  //   This SCALES: adding a new field = add the input, no new handler needed.
  //
  //   [name]: value — this is COMPUTED PROPERTY SYNTAX.
  //   It's equivalent to: const newData = {...prev}; newData[name] = value;
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setFormData(emptyForm);
    onClose();
  };

  // ── FORM SUBMIT ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    // WHY e.preventDefault():
    //   HTML forms by default RELOAD the page on submit (legacy browser behavior).
    //   preventDefault() stops that. We handle the submit with JavaScript instead.

    // Build the payload — convert string IDs to numbers (HTML inputs always return strings)
    // WHY Number():
    //   The API expects integers (int TeacherId), but HTML inputs give strings.
    //   Number("5") → 5, Number("") → 0, Number("abc") → NaN
    //   We use || null to convert empty strings to null for nullable FK fields.
    const payload = {
      ...formData,
      teacherId: Number(formData.teacherId),
      classId: formData.classId ? Number(formData.classId) : null,
      subjectId: formData.subjectId ? Number(formData.subjectId) : null,
      status: Number(formData.status),
    };

    if (homework) {
      // EDIT MODE
      const result = await dispatch(
        editHomework({ id: homework.id, homeworkData: payload }),
      );
      // WHY check .fulfilled.match():
      //   dispatch() returns the thunk action object.
      //   .fulfilled.match(result) = true only if the API call succeeded.
      //   If it failed, the submitError in Redux state will show the error — no redirect.
      if (editHomework.fulfilled.match(result)) {
        handleClose();
        onRefresh();
      }
    } else {
      // CREATE MODE
      const result = await dispatch(createHomework(payload));
      if (createHomework.fulfilled.match(result)) {
        handleClose();
        onRefresh();
      }
    }
  };

  // ── EARLY RETURN ─────────────────────────────────────────────────
  // WHY return null when not open:
  //   The modal is not in the DOM at all when closed.
  //   ALTERNATIVE: keep it in DOM but hide with CSS (display:none).
  //   Returning null is CLEANER — no hidden DOM elements, no stale state risk.
  if (!isOpen) return null;

  return (
    // ── BACKDROP ────────────────────────────────────────────────────
    // The dark overlay behind the modal.
    // onClick on backdrop = close the modal when clicking outside.
    // WHY backdrop-blur-sm: Modern SaaS blur effect (matches your existing modals).
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm 
                 flex items-center justify-center z-50 px-4"
      onClick={handleClose}
    >
      {/* ── MODAL CARD ─────────────────────────────────────────── */}
      {/* e.stopPropagation() prevents clicks INSIDE from closing the modal */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg 
                   max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            {homework ? "✏️ Edit Homework" : "📚 Assign New Homework"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 
                       hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        {/* FORM BODY */}
        {/* overflow-y-auto: if form is taller than screen, scroll just the body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 space-y-4"
        >
          {/* ERROR BANNER */}
          {submitError && (
            <div
              className="bg-red-50 border border-red-100 text-red-700 
                            text-sm rounded-xl px-4 py-3"
            >
              ⚠️ {submitError}
            </div>
          )}

          {/* TEACHER ID */}
          {/* WHY show TeacherId as a number input in this simple version:
               In production, you'd replace this with a <select> dropdown
               that loads all teachers from the API. But for a first version,
               a number input works and lets you focus on the architecture. */}
          <InputField
            label="Teacher ID"
            name="teacherId"
            type="number"
            placeholder="e.g. 1"
            value={formData.teacherId}
            onChange={handleChange}
          />

          {/* OPTIONAL: CLASS & SUBJECT */}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Class ID (optional)"
              name="classId"
              type="number"
              placeholder="e.g. 2"
              value={formData.classId}
              onChange={handleChange}
              required={false}
            />
            <InputField
              label="Subject ID (optional)"
              name="subjectId"
              type="number"
              placeholder="e.g. 3"
              value={formData.subjectId}
              onChange={handleChange}
              required={false}
            />
          </div>

          {/* TITLE */}
          <InputField
            label="Homework Title"
            name="title"
            placeholder="e.g. Chapter 5 Exercises"
            value={formData.title}
            onChange={handleChange}
          />

          {/* DESCRIPTION */}
          <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description (optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed instructions for students..."
              rows={4}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 
                         text-sm text-slate-800 placeholder:text-slate-400 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/20 
                         focus:border-indigo-500 transition duration-150 resize-none"
            />
          </div>

          {/* DUE DATE */}
          {/* WHY datetime-local: Allows picking both date AND time.
               If you only want a date, use type="date" and send "YYYY-MM-DDT00:00:00". */}
          <InputField
            label="Due Date & Time"
            name="dueDate"
            type="datetime-local"
            value={formData.dueDate}
            onChange={handleChange}
          />

          {/* STATUS */}
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
                         focus:border-indigo-500 transition"
            >
              <option value={1}>Active</option>
              <option value={2}>Archived</option>
            </select>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 mt-6">
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
                         text-white rounded-xl transition flex items-center gap-2 shadow-sm"
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
              ) : homework ? (
                "Save Changes"
              ) : (
                "Assign Homework"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HomeworkForm;
