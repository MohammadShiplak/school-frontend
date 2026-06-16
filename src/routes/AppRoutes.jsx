import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardPage from "../pages/DashboardPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardLayout from "../components/DashboardLayout";
import StudentsPage from "../pages/StudentsPage";
import TeacherForm from "../components/teachers/TeacherForm";
import TeacherPage from "../pages/TeachersPage";
import AttendancePage from "../pages/AttendancePage";
import HomeworkPage from "../pages/HomeworkPage";
import AttendanceAlertPage from "../pages/AttendanceAlertPage";
import CourseProgressPage from "../pages/CourseProgressPage";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} /> {/* ← add this */}
      <Route element={<ProtectedRoute />}>
        <Route path="/alerts" element={<AttendanceAlertPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/dashboard" element={<DashboardLayout />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/teachers" element={<TeacherPage />} />
        <Route path="/homework" element={<HomeworkPage />} />
        <Route path="/progress" element={<CourseProgressPage />} />
      </Route>{" "}
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
};

export default AppRoutes;
