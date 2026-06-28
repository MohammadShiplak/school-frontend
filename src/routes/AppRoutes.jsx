import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../components/DashboardLayout";
import DashboardPage from "../pages/DashboardPage";
import StudentsPage from "../pages/StudentsPage";
import TeacherPage from "../pages/TeachersPage";
import AttendancePage from "../pages/AttendancePage";
import HomeworkPage from "../pages/HomeworkPage";
import AttendanceAlertPage from "../pages/AttendanceAlertPage";
import CourseProgressPage from "../pages/CourseProgressPage";
import ClassRosterPage from "../pages/ClassRosterPage";
import ClassSubjectPage from "../pages/ClassSubjectPage";
import DepartmentsPage from "../pages/DepartmentsPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/teachers" element={<TeacherPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/alerts" element={<AttendanceAlertPage />} />
          <Route path="/classes" element={<ClassRosterPage />} />
          <Route path="/subjects/:classId" element={<ClassSubjectPage />} />
          <Route path="/homework" element={<HomeworkPage />} />
          <Route path="/progress" element={<CourseProgressPage />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
