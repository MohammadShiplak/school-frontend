// src/components/Sidebar.jsx

import { NavLink } from "react-router-dom";

// ── Pure SVG Icons Asset Definition ──────────────────────────
const DashboardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    />
  </svg>
);

const StudentsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.26 10.174c-.04-.228-.06-.46-.06-.694 0-2.171 2.261-3.93 5.05-3.93 2.79 0 5.05 1.759 5.05 3.93 0 .234-.02.466-.06.694m-9.98 0a5.958 5.958 0 0 0-.506 2.32c0 3.327 3.064 6.022 6.845 6.022 3.782 0 6.846-2.695 6.846-6.022 0-.825-.19-1.607-.53-2.32m-12.63 0h12.63"
    />
  </svg>
);

const TeachersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
    />
  </svg>
);

const ClassesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766A4.125 4.125 0 0 1 9.74 16.75c.616 1.13 1.516 2.063 2.61 2.697m3.176-3.07a11.954 11.954 0 0 0 3.14-1.29m-3.14 1.29a11.968 11.968 0 0 1-3.141 1.29m3.141-1.29H15M1.875 19.006A10.079 10.079 0 0 1 6 18.75m0 0a10.079 10.079 0 0 1 4.125.256m-4.125-.256V18.75a9 9 0 1 1 12.015-8.549M12 3.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
    />
  </svg>
);

const SubjectsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
    />
  </svg>
);

const CoursesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Zm0 0V6a2.25 2.25 0 0 1 2.25-2.25h1.5a2.25 2.25 0 0 1 2.25 2.25v14.25"
    />
  </svg>
);

const DepartmentsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 16.5h1.5M13.5 16.5H15"
    />
  </svg>
);

const AccessCardsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z"
    />
  </svg>
);
const AttendanceIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
    />
  </svg>
);
// ── Static Item Definitions ──────────────────────────────────
const navItems = [
  { path: "/dashboard", label: "Dashboard", Icon: DashboardIcon },
  { path: "/students", label: "Students", Icon: StudentsIcon },
  { path: "/teachers", label: "Teachers", Icon: TeachersIcon },
  { path: "/classes", label: "Classes", Icon: ClassesIcon },
  { path: "/subjects", label: "Subjects", Icon: SubjectsIcon },
  { path: "/courses", label: "Courses", Icon: CoursesIcon },
  { path: "/departments", label: "Departments", Icon: DepartmentsIcon },
  { path: "/accesscards", label: "Access Cards", Icon: AccessCardsIcon },
  { path: "/attendance", label: "Attendance", Icon: AttendanceIcon },
];

/**
 * Clean, production-ready Navigation Sidebar designed for the EduPulse dashboard grid setup.
 * Supports fluid state expansion configurations toggled by outer window controls.
 */
export const Sidebar = ({ isOpen }) => {
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 md:relative z-30
        h-full bg-white text-slate-700
        flex flex-col border-r border-slate-100
        transition-all duration-300 ease-in-out select-none
        ${isOpen ? "w-64" : "w-20"}
      `}
    >
      {/* Brand Header */}
      <div
        className={`h-16 flex items-center gap-3 px-5 border-b border-slate-100/80 ${!isOpen && "justify-center"}`}
      >
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100 text-white shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.263 15.541A1.75 1.75 0 0 1 3.5 14H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h.5a1.75 1.75 0 0 1 1.637 1.132l1.312 3.565A1.75 1.75 0 0 1 8.086 14H12m-7.737 1.541A1.746 1.746 0 0 0 5.5 16h13a1.745 1.745 0 0 0 1.237-.459m-15.474 0a1.745 1.745 0 0 1-.263-1.541l1.312-3.565A1.75 1.75 0 0 1 6.95 9H17.05a1.75 1.75 0 0 1 1.637 1.132l1.312 3.565a1.75 1.75 0 0 1-1.637 2.303H4.263Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
            />
          </svg>
        </div>
        {isOpen && (
          <span className="font-bold text-base tracking-tight text-slate-900 animate-fadeIn">
            EduPulse
          </span>
        )}
      </div>

      {/* Navigation Container */}
      <nav className="flex-1 py-4 overflow-y-auto px-3 space-y-0.5 custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={!isOpen ? item.label : undefined}
            className={({ isActive }) => `
              group flex items-center gap-3 px-3.5 py-2.5 rounded-xl
              text-sm font-medium transition-all duration-200 relative
              ${!isOpen ? "justify-center" : ""}
              ${
                isActive
                  ? "bg-indigo-50 text-indigo-600 font-semibold"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/70"
              }
            `}
          >
            {({ isActive }) => (
              <>
                {/* Visual Active Track bar indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-600 rounded-r-full" />
                )}

                <span
                  className={`shrink-0 transition-colors duration-200 ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}
                >
                  <item.Icon />
                </span>

                {isOpen && (
                  <span className="tracking-wide whitespace-nowrap overflow-hidden text-ellipsis animate-fadeIn">
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Details */}
      <div className="border-t border-slate-100 p-4 h-14 flex items-center justify-center">
        {isOpen ? (
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 animate-fadeIn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-3.5 h-3.5 text-emerald-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 00 2.25 2.25Z"
              />
            </svg>
            Secured Portal
          </div>
        ) : (
          <div
            className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"
            title="Secured Portal Connection Active"
          />
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
