import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardPage from "../pages/DashboardPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardLayout from "../components/DashboardLayout";
import StudentsPage from "../pages/StudentsPage";
import TeacherForm from "../components/teachers/TeacherForm";
import TeacherPage from "../pages/TeachersPage";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/teachers" element={<TeacherPage />} />
      </Route>{" "}
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
};

export default AppRoutes;
