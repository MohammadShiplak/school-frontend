// src/pages/StudentsPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudents,
  removeStudent,
  setPage,
  selectStudent,
  selectStudentsLoading,
  selectStudentError,
  selectDeleting,
  selectStudentsMeta,
} from "../features/students/studentSlice";
import StudentForm from "../components/students/StudentForm";
import DeleteConfirmModal from "../components/students/DeleteConfirmModel";
export const StudentsPage = () => {
  const dispatch = useDispatch();

  const students = useSelector(selectStudent);
  const meta = useSelector(selectStudentsMeta);
  const loading = useSelector(selectStudentsLoading);
  const error = useSelector(selectStudentError);
  const deleting = useSelector(selectDeleting);

  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const refreshStudents = useCallback(() => {
    dispatch(
      fetchStudents({
        pageNumber: meta.pageNumber,
        pageSize: meta.pageSize,
      }),
    );
  }, [dispatch, meta.pageNumber, meta.pageSize]);

  useEffect(() => {
    refreshStudents();
  }, [refreshStudents, meta.pageNumber]);

  const handleAdd = () => {
    setSelectedStudent(null);
    setShowForm(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setShowForm(true);
  };

  const handleDeleteClick = (student) => {
    setSelectedStudent(student);
    setShowDelete(true);
  };

  const handleDeleteConfirm = async () => {
    const result = await dispatch(removeStudent(selectedStudent.id));
    if (removeStudent.fulfilled.match(result)) {
      setShowDelete(false);
      setSelectedStudent(null);
      refreshStudents();
    }
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Students Core Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {meta.totalRecords || 0} active student files registered
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm shadow-indigo-100"
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
          Add Student
        </button>
      </div>

      {/* Global Fetch Errors */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3 flex gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 text-red-500 shrink-0"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 1 0 2Z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Main Table Card Layout */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/70 border-b border-slate-100">
              <tr>
                {[
                  "#",
                  "Name",
                  "Email",
                  "Phone",
                  "Gender",
                  "Date of Birth",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-3.5 bg-slate-100 rounded-md w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !students || students.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-14 text-slate-400 bg-white"
                  >
                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                      🎓
                    </div>
                    <p className="text-sm font-medium text-slate-800">
                      No students found
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Click &quot;Add Student&quot; to initialize a registry
                      profile.
                    </p>
                  </td>
                </tr>
              ) : (
                Array.isArray(students) &&
                students.map((student, index) => {
                  if (!student) return null;
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">
                        {(meta.pageNumber - 1) * meta.pageSize + index + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {student.firstName?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span className="font-semibold text-slate-800">
                            {student.firstName} {student.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        {student.email}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 font-mono">
                        {student.phone}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
                            student.gender === "Male"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-pink-50 text-pink-600"
                          }`}
                        >
                          {student.gender}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 font-mono">
                        {student.dateOfBirth?.slice(0, 10)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEdit(student)}
                            className="p-1 px-2.5 text-xs font-semibold bg-slate-50 border border-slate-100 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-100 rounded-lg transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(student)}
                            className="p-1 px-2.5 text-xs font-semibold bg-slate-50 border border-slate-100 text-slate-500 hover:text-red-600 hover:bg-red-50/50 hover:border-red-100 rounded-lg transition"
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

        {/* Clean Minimalist Pagination Toolbar */}
        {!loading && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50/40 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-400">
              Page {meta.pageNumber} of {meta.totalPages}
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => handlePageChange(meta.pageNumber - 1)}
                disabled={meta.pageNumber === 1}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Prev
              </button>
              <button
                onClick={() => handlePageChange(meta.pageNumber + 1)}
                disabled={meta.pageNumber === meta.totalPages}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mounting Form and Confirmation Overlay Portals */}
      <StudentForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        student={selectedStudent}
        onRefresh={refreshStudents}
      />
      <DeleteConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDeleteConfirm}
        studentName={
          selectedStudent
            ? `${selectedStudent.firstName} ${selectedStudent.lastName}`
            : ""
        }
        deleting={deleting}
      />
    </div>
  );
};

export default StudentsPage;
