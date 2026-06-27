// src/pages/DepartmentsPage.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDepartments,
  fetchDepartmentStats,
  createDepartment,
  editDepartment,
  removeDepartment,
  clearSubmitError,
  clearSelectedStats,
  selectDepartments,
  selectDepartmentsLoading,
  selectDepartmentsError,
  selectDepartmentsSubmitting,
  selectDepartmentsSubmitError,
  selectDepartmentsDeleting,
  selectDepartmentStats,
  selectDepartmentStatsLoading,
  selectDepartmentStatsError,
} from "../features/departments/departmentSlice";

// ═══════════════════════════════════════════════════════════════
// REUSABLE COMPONENTS — defined OUTSIDE DepartmentsPage
// ─────────────────────────────────────────────────────────────
// WHY outside the parent component?
//   If defined INSIDE, React creates a brand-new component definition
//   on every render → React sees a different component type → unmounts
//   and remounts it → the input loses focus while typing.
//   Always define helper components outside their parent.
// ═══════════════════════════════════════════════════════════════

// ── Stat Card — used inside the Statistics Modal ──────────────
// Props: icon (emoji), label (string), value (number), color (tailwind class)
const StatCard = ({ icon, label, value, color }) => (
  <div
    className={`flex flex-col items-center justify-center p-5 rounded-2xl border ${color}`}
  >
    <span className="text-3xl mb-2">{icon}</span>
    <span className="text-2xl font-bold text-slate-800">{value ?? "—"}</span>
    <span className="text-xs font-medium text-slate-500 mt-1">{label}</span>
  </div>
);

// ── Empty state placeholder ───────────────────────────────────
const EmptyState = () => (
  <div className="py-20 flex flex-col items-center gap-3 text-center">
    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">
      🏢
    </div>
    <p className="text-sm font-semibold text-slate-700">No departments yet</p>
    <p className="text-xs text-slate-400">
      Add your first department using the button above.
    </p>
  </div>
);

// ── Loading skeleton rows ─────────────────────────────────────
const SkeletonRows = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-6 py-4">
          <div className="h-4 bg-slate-100 rounded-full w-8" />
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-slate-100 rounded-full w-32" />
        </td>
        <td className="px-6 py-4">
          <div className="flex gap-2">
            <div className="h-8 bg-slate-100 rounded-xl w-16" />
            <div className="h-8 bg-slate-100 rounded-xl w-16" />
            <div className="h-8 bg-slate-100 rounded-xl w-16" />
          </div>
        </td>
      </tr>
    ))}
  </>
);

// ═══════════════════════════════════════════════════════════════
// DEPARTMENT FORM MODAL (Add / Edit)
// ─────────────────────────────────────────────────────────────
// WHY a separate inner component for the form (not inline JSX)?
//   The form has its own local state (formData), its own useEffect,
//   and its own submit handler. Keeping it separate makes DepartmentsPage
//   easier to read. Each component does ONE thing.
// ═══════════════════════════════════════════════════════════════
const DepartmentForm = ({ isOpen, onClose, department, onRefresh }) => {
  const dispatch = useDispatch();
  const submitting = useSelector(selectDepartmentsSubmitting);
  const submitError = useSelector(selectDepartmentsSubmitError);

  // ── Local form state ──────────────────────────────────────────
  // WHY local useState (not Redux state)?
  //   This data is temporary — only needed while the form is open.
  //   It's not shared with any other component.
  //   Rule of thumb: Is this needed outside this component? No → useState.
  const [name, setName] = useState("");

  // ── Populate on edit / clear on create ───────────────────────
  // WHY [department, isOpen] as deps?
  //   When the modal opens with a department to edit, fill the field.
  //   When it opens for create (department = null), clear it.
  //   isOpen in deps ensures reset happens every time the modal reopens.
  useEffect(() => {
    if (isOpen) {
      setName(department ? department.name : "");
      dispatch(clearSubmitError());
    }
  }, [department, isOpen, dispatch]);

  const handleClose = () => {
    setName("");
    onClose();
  };

  const handleSubmit = async (e) => {
    // WHY e.preventDefault()?
    //   HTML forms reload the page on submit by default (legacy browser behavior).
    //   preventDefault() stops that. We handle submission with Axios instead.
    e.preventDefault();

    const payload = { name };

    if (department) {
      // EDIT MODE
      const result = await dispatch(
        editDepartment({ id: department.id, departmentData: payload }),
      );
      if (editDepartment.fulfilled.match(result)) {
        handleClose();
        onRefresh();
      }
    } else {
      // CREATE MODE
      const result = await dispatch(createDepartment(payload));
      if (createDepartment.fulfilled.match(result)) {
        handleClose();
        onRefresh();
      }
    }
  };

  if (!isOpen) return null;

  return (
    // ── BACKDROP ─────────────────────────────────────────────────
    // Clicking outside the card closes the modal
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={handleClose}
    >
      {/* ── MODAL CARD ─────────────────────────────────────────── */}
      {/* e.stopPropagation() prevents clicks inside from bubbling to the backdrop */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            {department ? "✏️ Edit Department" : "🏢 Add Department"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Error banner */}
          {submitError && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">
              ⚠️ {submitError}
            </div>
          )}

          {/* Name field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Computer Science"
              required
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2
                         text-sm text-slate-800 placeholder:text-slate-400
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                         focus:border-indigo-500 transition duration-150"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700
                         disabled:bg-indigo-400/70 text-white rounded-xl transition
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
                  Saving...
                </>
              ) : department ? (
                "Save Changes"
              ) : (
                "Add Department"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// DELETE CONFIRM MODAL
// ═══════════════════════════════════════════════════════════════
const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  departmentName,
  deleting,
}) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Delete Department
        </h3>
        <p className="text-sm text-slate-500 px-2 mb-5">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800">{departmentName}</span>
          ? This action is permanent and cannot be undone.
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl transition flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
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
                Deleting...
              </>
            ) : (
              "Yes, Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// STATISTICS MODAL
// ─────────────────────────────────────────────────────────────
// WHY a separate modal (not inline on the page)?
//   Stats are loaded async — they need a loading state while the API call runs.
//   A modal lets us show a spinner while statsLoading is true,
//   then reveal the data. Inline would make the whole page "reload" visually.
// ═══════════════════════════════════════════════════════════════
const StatsModal = ({ isOpen, onClose }) => {
  const stats = useSelector(selectDepartmentStats);
  const loading = useSelector(selectDepartmentStatsLoading);
  const error = useSelector(selectDepartmentStatsError);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              📊 Department Statistics
            </h2>
            {stats && (
              <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                {stats.departmentName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          {/* ── Loading state ──────────────────────────────────── */}
          {loading && (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-slate-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          )}

          {/* ── Error state ────────────────────────────────────── */}
          {!loading && error && (
            <div className="py-8 text-center">
              <p className="text-sm text-red-600 font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* ── Stats grid ─────────────────────────────────────── */}
          {/* WHY a 2×2 grid?
               Four metrics, balanced layout, easy to scan at a glance.
               Each card has a unique color so they're visually distinct. */}
          {!loading && !error && stats && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon="👨‍🏫"
                  label="Teachers"
                  value={stats.totalTeachers}
                  color="bg-indigo-50 border-indigo-100"
                />
                <StatCard
                  icon="📚"
                  label="Subjects"
                  value={stats.totalSubjects}
                  color="bg-violet-50 border-violet-100"
                />
                <StatCard
                  icon="🎓"
                  label="Students"
                  value={stats.totalStudents}
                  color="bg-emerald-50 border-emerald-100"
                />
                <StatCard
                  icon="🏫"
                  label="Classes"
                  value={stats.totalClasses}
                  color="bg-amber-50 border-amber-100"
                />
              </div>

              {/* Summary line */}
              <p className="mt-4 text-center text-xs text-slate-400">
                {stats.departmentName} has{" "}
                <span className="font-semibold text-slate-600">
                  {stats.totalTeachers} teachers
                </span>{" "}
                managing{" "}
                <span className="font-semibold text-slate-600">
                  {stats.totalSubjects} subjects
                </span>{" "}
                across{" "}
                <span className="font-semibold text-slate-600">
                  {stats.totalClasses} classes
                </span>{" "}
                for{" "}
                <span className="font-semibold text-slate-600">
                  {stats.totalStudents} students
                </span>
                .
              </p>
            </>
          )}
        </div>

        <div className="px-5 pb-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════
const DepartmentsPage = () => {
  const dispatch = useDispatch();

  // ── Read Redux state ──────────────────────────────────────────
  const departments = useSelector(selectDepartments);
  const loading = useSelector(selectDepartmentsLoading);
  const error = useSelector(selectDepartmentsError);
  const deleting = useSelector(selectDepartmentsDeleting);

  // ── Local UI state ────────────────────────────────────────────
  // WHY local state for modal open/close and selected item?
  //   Modal visibility is purely UI concern — no other component cares.
  //   Putting it in Redux would be overkill. Local useState is correct here.
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null); // for edit
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [statsOpen, setStatsOpen] = useState(false);

  // ── Fetch departments on page load ────────────────────────────
  // WHY useEffect with []?
  //   The empty array [] means "run this once when the component mounts."
  //   We want to load departments as soon as the user visits this page.
  //   Without this, the page would always show empty until the user does something.
  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  // ── Handlers ──────────────────────────────────────────────────

  // Open the form for ADD (no department selected = create mode)
  const handleAddClick = () => {
    setSelectedDepartment(null);
    setFormOpen(true);
  };

  // Open the form for EDIT (with a department = edit mode)
  const handleEditClick = (dept) => {
    setSelectedDepartment(dept);
    setFormOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (dept) => {
    setDepartmentToDelete(dept);
    setDeleteOpen(true);
  };

  // Actually delete after confirmation
  const handleConfirmDelete = async () => {
    if (!departmentToDelete) return;
    const result = await dispatch(removeDepartment(departmentToDelete.id));
    if (removeDepartment.fulfilled.match(result)) {
      setDeleteOpen(false);
      setDepartmentToDelete(null);
    }
  };

  // Open the statistics modal and fetch data for this department
  // WHY dispatch fetchDepartmentStats here (not in StatsModal)?
  //   The page knows which department was clicked.
  //   StatsModal only knows how to DISPLAY stats from Redux.
  //   Triggering the fetch in the handler keeps data flow top-down and clear.
  const handleStatsClick = (dept) => {
    dispatch(clearSelectedStats()); // clear previous dept's stats
    dispatch(fetchDepartmentStats(dept.id)); // fetch this dept's stats
    setStatsOpen(true);
  };

  const handleCloseStats = () => {
    setStatsOpen(false);
    dispatch(clearSelectedStats());
  };

  // Re-fetch the list after an add/edit (callback passed to DepartmentForm)
  const handleRefresh = () => {
    dispatch(fetchDepartments());
  };

  // ════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Departments
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {departments.length} department{departments.length !== 1 ? "s" : ""}{" "}
            · Click{" "}
            <span className="font-medium text-indigo-600">📊 Stats</span> to
            view metrics
          </p>
        </div>

        {/* Add button */}
        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600
                     hover:bg-indigo-700 text-white text-sm font-semibold
                     rounded-xl shadow-sm shadow-indigo-200 transition-all
                     focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
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
          Add Department
        </button>
      </div>

      {/* ── Error Banner ──────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          <span>⚠️</span> {error}
          <button
            onClick={() => dispatch(fetchDepartments())}
            className="ml-auto text-xs underline underline-offset-2 hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Table Card ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-16">
                ID
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Name
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {/* ── Loading skeleton ──────────────────────────── */}
            {loading && <SkeletonRows />}

            {/* ── Empty state ───────────────────────────────── */}
            {!loading && departments.length === 0 && (
              <tr>
                <td colSpan={3}>
                  <EmptyState />
                </td>
              </tr>
            )}

            {/* ── Department rows ───────────────────────────── */}
            {!loading &&
              departments.map((dept) => (
                <tr
                  key={dept.id}
                  className="hover:bg-slate-50/50 transition-colors duration-100"
                >
                  {/* ID */}
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-slate-400">
                      #{dept.id}
                    </span>
                  </td>

                  {/* Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar initial */}
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {dept.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <span className="text-sm font-semibold text-slate-800">
                        {dept.name}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* Stats button — the new feature ✨ */}
                      <button
                        onClick={() => handleStatsClick(dept)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5
                                   bg-violet-50 hover:bg-violet-100 border border-violet-100
                                   text-violet-700 text-xs font-medium rounded-lg transition"
                        title="View statistics"
                      >
                        📊 Stats
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => handleEditClick(dept)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5
                                   bg-indigo-50 hover:bg-indigo-100 border border-indigo-100
                                   text-indigo-700 text-xs font-medium rounded-lg transition"
                        title="Edit department"
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
                        onClick={() => handleDeleteClick(dept)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5
                                   bg-red-50 hover:bg-red-100 border border-red-100
                                   text-red-600 text-xs font-medium rounded-lg transition"
                        title="Delete department"
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

      {/* ── Modals ────────────────────────────────────────────── */}
      {/* WHY render all three modals at the bottom (not inline in the table row)?
           Modals use fixed positioning — they escape the table layout entirely.
           Placing them at the bottom of the component tree keeps the table clean
           and avoids z-index conflicts with table cells. */}

      <DepartmentForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        department={selectedDepartment}
        onRefresh={handleRefresh}
      />

      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDepartmentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        departmentName={departmentToDelete?.name}
        deleting={deleting}
      />

      <StatsModal isOpen={statsOpen} onClose={handleCloseStats} />
    </div>
  );
};

export default DepartmentsPage;
