import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTeacher,
  removeTeacher,
  setPage,
  selectTeacher,
  selectTeacherLoading,
  selectTeacherError,
  selectDeleting,
  selectTeacherMeta,
} from "../features/teachers/teacherSlice";
import TeacherForm from "../components/teachers/TeacherForm";
import DeleteConfirmModal from "../components/students/DeleteConfirmModel";
import { formatDate } from "../utils/dateHelper";
export const TeacherPage = () => {
  const dispatch = useDispatch();
  const teachers = useSelector(selectTeacher);
  const meta = useSelector(selectTeacherMeta);
  const loading = useSelector(selectTeacherLoading);
  const error = useSelector(selectTeacherError);
  const deleting = useSelector(selectDeleting);

  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null); // ✅ renamed

  const refreshTeachers = useCallback(() => {
    dispatch(
      fetchTeacher({
        pageNumber: meta.pageNumber,
        pageSize: meta.pageSize,
      }),
    );
  }, [dispatch, meta.pageNumber, meta.pageSize]);

  useEffect(() => {
    refreshTeachers();
  }, [dispatch, meta.pageNumber]);

  const handleAdd = () => {
    setSelectedTeacher(null);
    setShowForm(true);
  };

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setShowForm(true);
  };

  const handleDeleteClick = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDelete(true);
  };

  const handleDeleteConfirm = async () => {
    const result = await dispatch(removeTeacher(selectedTeacher.id));
    if (removeTeacher.fulfilled.match(result)) {
      setShowDelete(false);
      setSelectedTeacher(null);
      refreshTeachers();
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
            Teachers Registry {/* ✅ fixed text */}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {meta.totalRecords || 0} teachers registered
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 bg-indigo-600 
                     hover:bg-indigo-700 text-white px-4 py-2.5 
                     rounded-xl text-xs font-semibold transition"
        >
          + Add Teacher {/* ✅ fixed text */}
        </button>
      </div>

      {error && (
        <div
          className="bg-red-50 border border-red-100 text-red-700 
                        text-sm rounded-xl px-4 py-3"
        >
          ⚠️ {error}
        </div>
      )}

      {/* Table */}
      <div
        className="bg-white rounded-xl border border-slate-100 
                      shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/70 border-b border-slate-100">
              <tr>
                {["#", "Name", "Specialization", "Hire Date", "Actions"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-[11px] font-bold 
                                 text-slate-400 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-3.5 bg-slate-100 rounded-md w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !teachers || teachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-14 text-slate-400">
                    <div className="text-3xl mb-2">👨‍🏫</div>
                    <p className="text-sm font-medium text-slate-800">
                      No teachers found
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Click "Add Teacher" to get started
                    </p>
                  </td>
                </tr>
              ) : (
                teachers.map((teacher, index) => {
                  if (!teacher) return null;
                  return (
                    <tr
                      key={teacher.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3.5 text-xs text-slate-400">
                        {(meta.pageNumber - 1) * meta.pageSize + index + 1}
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full bg-indigo-50 
                                          border border-indigo-100 text-indigo-600 
                                          flex items-center justify-center 
                                          font-bold text-xs shrink-0"
                          >
                            {teacher.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span className="text-sm font-medium text-slate-800">
                            {teacher.name}
                          </span>
                        </div>
                      </td>

                      {/* Specialization */}
                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        {teacher.specialization}
                      </td>

                      {/* ✅ Format date properly */}
                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        {formatDate(teacher.hireDate)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="px-2.5 py-1 text-xs font-semibold 
                                       bg-slate-50 border border-slate-100 
                                       text-slate-600 hover:text-indigo-600 
                                       hover:bg-indigo-50/50 rounded-lg transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(teacher)}
                            className="px-2.5 py-1 text-xs font-semibold 
                                       bg-slate-50 border border-slate-100 
                                       text-slate-500 hover:text-red-600 
                                       hover:bg-red-50/50 rounded-lg transition"
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

        {/* Pagination */}
        {!loading && meta.totalPages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3 
                          bg-slate-50/40 border-t border-slate-100"
          >
            <p className="text-xs font-medium text-slate-400">
              Page {meta.pageNumber} of {meta.totalPages}
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

      {/* Modals */}
      <TeacherForm
        isOpen={showForm}
        onClose={() => setShowForm(false)} 
        teacher={selectedTeacher} 
        onRefresh={refreshTeachers}
      />
      <DeleteConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDeleteConfirm}
        teacherName={
          selectedTeacher
            ? selectedTeacher.name // ✅ teachers have .name not .firstName
            : ""
        }
        deleting={deleting}
      />
    </div>
  );
};

export default TeacherPage;
