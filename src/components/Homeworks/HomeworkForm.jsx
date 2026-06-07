// src/components/homework/HomeworkForm.jsx
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createHomework,
  editHomework,
  removeHomeworkFile,
  clearSubmitError,
  selectHomeworkSubmitting,
  selectHomeworkSubmitError,
} from "../../features/homework/homeworkSlice";

// ── REUSABLE INPUT COMPONENT ─────────────────────────────────────
// Defined OUTSIDE the parent to prevent remounting on every render.
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

// ── FILE SIZE FORMATTER HELPER ───────────────────────────────────
// WHY outside the component: pure function, no need for component context.
// Converts bytes to human-readable: 1048576 → "1.0 MB"
const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ── ALLOWED FILE TYPES (mirrors backend) ────────────────────────
// WHY mirror the backend:
//   We validate client-side for INSTANT feedback (no round trip to server).
//   The backend ALSO validates (source of truth).
//   Client-side = UX convenience. Server-side = security.
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const ALLOWED_EXTENSIONS = ".pdf,.doc,.docx,.png,.jpg,.jpeg,.ppt,.pptx";
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// ── EMPTY FORM STATE ──────────────────────────────────────────────
const emptyForm = {
  teacherId: "",
  classId: "",
  subjectId: "",
  title: "",
  description: "",
  dueDate: "",
  status: 1,
  // WHY null (not "") for file:
  //   null = "no file" (clear distinction).
  //   "" = empty string (wrong for a file object).
  assignmentFile: null,
};

// ── THE FORM COMPONENT ────────────────────────────────────────────
const HomeworkForm = ({ isOpen, onClose, homework, onRefresh }) => {
  const dispatch = useDispatch();
  const submitting = useSelector(selectHomeworkSubmitting);
  const submitError = useSelector(selectHomeworkSubmitError);

  const [formData, setFormData] = useState(emptyForm);

  // ── File preview state ──────────────────────────────────────────
  // WHY separate state for file info:
  //   The form's assignmentFile holds the actual File object (binary data).
  //   fileInfo holds display info: { name, size } — just for showing in the UI.
  //   Keeping them separate makes the UI logic cleaner.
  const [fileInfo, setFileInfo] = useState(null);

  // ── Validation error for file ────────────────────────────────────
  const [fileError, setFileError] = useState("");

  // ── Ref to the hidden file input ─────────────────────────────────
  // WHY useRef for file input:
  //   We style the file input by HIDING the default ugly browser input
  //   and triggering it programmatically from a nice custom button.
  //   useRef gives us direct DOM access: fileInputRef.current.click()
  //   This is one of the legitimate uses of useRef in React.
  const fileInputRef = useRef(null);

  // ── Populate form on edit ─────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      if (homework) {
        // EDIT MODE
        setFormData({
          teacherId: homework.teacherId || "",
          classId: homework.classId || "",
          subjectId: homework.subjectId || "",
          title: homework.title || "",
          description: homework.description || "",
          dueDate: homework.dueDate ? homework.dueDate.slice(0, 16) : "",
          status: homework.status || 1,
          // WHY null for file in edit mode:
          //   In edit mode, we don't pre-fill the file input — browsers don't
          //   allow that for security reasons (you can't pre-set file inputs).
          //   The existing file (if any) is shown separately via fileInfo.
          assignmentFile: null,
        });

        // Show existing file info if there is one
        // WHY set fileInfo from homework.fileName:
        //   We show the current file's name so the teacher knows what's attached.
        //   If they don't pick a new file, the old one stays.
        if (homework.fileName) {
          setFileInfo({
            name: homework.fileName,
            size: null,
            isExisting: true,
          });
        } else {
          setFileInfo(null);
        }
      } else {
        // CREATE MODE
        setFormData(emptyForm);
        setFileInfo(null);
      }
      setFileError("");
      dispatch(clearSubmitError());
    }
  }, [homework, isOpen, dispatch]);

  // ── Handle text/select input changes ─────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Handle file input change ─────────────────────────────────────
  // This function runs when the user selects a file.
  //
  // e.target.files is a FileList (array-like).
  // We take the first file: e.target.files[0].
  //
  // WHY validate here (client-side):
  //   Immediate feedback — no need to wait for server response.
  //   If file is wrong type, show error NOW before they even submit.
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return; // User cancelled — no file selected

    // ── Client-side validation ────────────────────────────────────
    // Check MIME type (what the OS says the file is)
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError(
        "Invalid file type. Allowed: PDF, Word, PowerPoint, Images.",
      );
      setFormData((prev) => ({ ...prev, assignmentFile: null }));
      setFileInfo(null);
      return;
    }

    // Check size
    if (file.size > MAX_SIZE) {
      setFileError(
        `File too large (${formatFileSize(file.size)}). Max: 10 MB.`,
      );
      setFormData((prev) => ({ ...prev, assignmentFile: null }));
      setFileInfo(null);
      return;
    }

    // ── All good: store file + show preview ───────────────────────
    setFileError("");
    // Store the actual File object in form state
    setFormData((prev) => ({ ...prev, assignmentFile: file }));
    // Set display info: name and size (for the preview UI)
    setFileInfo({ name: file.name, size: file.size, isExisting: false });
  };

  // ── Remove selected file ─────────────────────────────────────────
  // WHY: Teacher changed their mind — they want to clear the selection.
  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, assignmentFile: null }));
    setFileInfo(null);
    setFileError("");
    // Reset the actual file input DOM element
    // WHY: Without this, the file input still shows the old filename.
    // Clearing .value resets the input visually.
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ── Delete existing file from server ─────────────────────────────
  const handleDeleteExistingFile = async () => {
    if (!homework?.id) return;

    const result = await dispatch(removeHomeworkFile(homework.id));
    if (removeHomeworkFile.fulfilled.match(result)) {
      setFileInfo(null);
      // Update the homework prop would need a refresh — just clear UI
    }
  };

  const handleClose = () => {
    setFormData(emptyForm);
    setFileInfo(null);
    setFileError("");
    onClose();
  };

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build payload — numbers converted from strings
    const payload = {
      ...formData,
      teacherId: Number(formData.teacherId),
      classId: formData.classId ? Number(formData.classId) : null,
      subjectId: formData.subjectId ? Number(formData.subjectId) : null,
      status: Number(formData.status),
      // assignmentFile is already null or a File object — no conversion needed
    };

    if (homework) {
      const result = await dispatch(
        editHomework({ id: homework.id, homeworkData: payload }),
      );
      if (editHomework.fulfilled.match(result)) {
        handleClose();
        onRefresh();
      }
    } else {
      const result = await dispatch(createHomework(payload));
      if (createHomework.fulfilled.match(result)) {
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
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 space-y-4"
          // WHY NOT encType="multipart/form-data" here:
          //   In React, we don't use native HTML form submission.
          //   We use Axios which handles FormData encoding automatically.
          //   encType on the <form> tag only affects native browser submission.
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
          <InputField
            label="Teacher ID"
            name="teacherId"
            type="number"
            placeholder="e.g. 1"
            value={formData.teacherId}
            onChange={handleChange}
          />

          {/* CLASS & SUBJECT */}
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
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 
                         text-sm text-slate-800 placeholder:text-slate-400 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/20 
                         focus:border-indigo-500 transition duration-150 resize-none"
            />
          </div>

          {/* DUE DATE */}
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

          {/* ── FILE UPLOAD SECTION ─────────────────────────────────── */}
          <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Assignment File{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>

            {/* File preview — shows when a file is selected or exists */}
            {fileInfo ? (
              <div
                className="flex items-center gap-3 p-3 bg-indigo-50 
                              border border-indigo-100 rounded-xl"
              >
                {/* File type icon */}
                <div
                  className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center 
                                justify-center text-indigo-600 shrink-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 002.112 2.13"
                    />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Truncate long file names */}
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {fileInfo.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {fileInfo.isExisting
                      ? "Current file"
                      : formatFileSize(fileInfo.size)}
                  </p>
                </div>

                {/* Remove / Replace buttons */}
                <div className="flex gap-1.5">
                  {/* Change file button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs px-2.5 py-1 bg-white border border-indigo-200 
                               text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                  >
                    Replace
                  </button>

                  {/* Remove file button */}
                  <button
                    type="button"
                    onClick={
                      fileInfo.isExisting
                        ? handleDeleteExistingFile
                        : handleRemoveFile
                    }
                    className="text-xs px-2.5 py-1 bg-white border border-red-100 
                               text-red-500 rounded-lg hover:bg-red-50 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              // ── Upload Button (shown when no file selected) ─────────────
              // WHY a custom button instead of native <input type="file">:
              //   Native file inputs look different in every browser.
              //   They're ugly and can't be styled with CSS.
              //   Solution: HIDE the input and trigger it with a nice custom button.
              //   The real input is still there (hidden) — accessibility is preserved.
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 
                           p-5 border-2 border-dashed border-slate-200 rounded-xl 
                           text-slate-500 hover:border-indigo-300 hover:text-indigo-500 
                           hover:bg-indigo-50/30 transition-all duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Click to upload assignment file
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    PDF, Word, PowerPoint, Images • Max 10 MB
                  </p>
                </div>
              </button>
            )}

            {/* The actual (hidden) file input ─────────────────────────────
                WHY hidden: We style the button above instead.
                WHY ref={fileInputRef}: We call .click() on it programmatically.
                WHY accept: Restricts the file browser to only show allowed types.
                            Note: User can still select other types manually,
                            so we STILL validate in handleFileChange.
                WHY onChange={handleFileChange}: Fires when user picks a file. */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_EXTENSIONS}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* File validation error */}
            {fileError && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <span>⚠️</span> {fileError}
              </p>
            )}
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
              disabled={submitting || !!fileError}
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
                  {formData.assignmentFile ? "Uploading..." : "Saving..."}
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
