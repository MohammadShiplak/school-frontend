import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createTeacher,
  editTeacher,
  clearSubmitError,
  selectTeacherSubmitting,
  selectSubmitError,
} from "../../features/teachers/teacherSlice";
import { formatDateForInput } from "../../utils/dateHelper";
// ── InputField outside component ─────────────────────────────
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
      required
      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 
                 text-sm text-slate-800 placeholder:text-slate-400 
                 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 
                 focus:border-indigo-500 transition duration-150"
    />
  </div>
);

const emptyForm = {
  name: "",
  specialization: "",
  hireDate: "",
};

export const TeacherForm = ({ isOpen, onClose, teacher, onRefresh }) => {
  const dispatch = useDispatch();
  const submitting = useSelector(selectTeacherSubmitting);
  const submitError = useSelector(selectSubmitError);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (isOpen) {
      if (teacher) {
        setFormData({
          name: teacher.name || "",
          specialization: teacher.specialization || "",
          hireDate: formatDateForInput(teacher.hireDate),
        });
      } else {
        setFormData(emptyForm);
      }
    }
  }, [teacher]);

  useEffect(() => {
    if (isOpen) {
      dispatch(clearSubmitError());
    }
  }, [isOpen, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setFormData(emptyForm);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (teacher) {
      const result = await dispatch(
        editTeacher({ id: teacher.id, teacherData: formData }),
      );
      if (editTeacher.fulfilled.match(result)) {
        handleClose();
        onRefresh();
      }
    } else {
      const result = await dispatch(createTeacher(formData));
      if (createTeacher.fulfilled.match(result)) {
        handleClose();
        onRefresh();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm 
                 flex items-center justify-center z-50 px-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg 
                   max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5 
                        border-b border-slate-100"
        >
          <h2 className="text-base font-bold text-slate-900">
            {teacher ? "✏️ Edit Teacher" : "➕ Add New Teacher"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 
                       hover:bg-slate-50 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 space-y-4"
        >
          {submitError && (
            <div
              className="bg-red-50 border border-red-100 
                            text-red-700 text-sm rounded-xl px-4 py-3"
            >
              ⚠️ {submitError}
            </div>
          )}

          {/* ✅ name="name" lowercase — matches formData.name */}
          <InputField
            label="Full Name"
            name="name"
            placeholder="Mohammad Shiplak"
            value={formData.name}
            onChange={handleChange}
          />

          {/* ✅ name="specialization" — matches formData.specialization */}
          <InputField
            label="Specialization"
            name="specialization"
            placeholder="e.g. Mathematics, Physics"
            value={formData.specialization}
            onChange={handleChange}
          />

          {/* ✅ name="hireDate" lowercase — matches formData.hireDate */}
          <InputField
            label="Hire Date"
            name="hireDate"
            type="date"
            value={formData.hireDate}
            onChange={handleChange}
          />

          {/* Buttons */}
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
              ) : teacher ? (
                "Save Changes"
              ) : (
                "Add Teacher"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;
