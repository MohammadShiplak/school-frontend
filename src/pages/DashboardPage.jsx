// ═══════════════════════════════════════════════════════════════
// FILE: src/pages/DashboardPage.jsx
//
// WHAT THIS PAGE DOES:
//   Fetches dashboard stats on mount, then renders:
//   - 6 stat cards (students, teachers, departments, etc.)
//   - 3 attendance cards (present, absent, late for TODAY)
//   - 2 homework cards (active, archived)
//   - Recent homework activity list
//
// COMPONENT DESIGN DECISIONS:
//   WHY one big page (not many small files for each card)?
//     For a learning project, one file is easier to follow.
//     In a production app, you'd break it into:
//     - StatCard.jsx
//     - AttendanceWidget.jsx
//     - RecentHomeworkList.jsx
//     Each extracted when they become complex or reused elsewhere.
//
//   WHY NOT extract StatCard inside this file?
//     We DEFINE StatCard OUTSIDE the DashboardPage component.
//     WHY: If defined INSIDE, React creates a NEW component type
//     on every render → remounts → bad performance.
//     KEY RULE: Always define helper components OUTSIDE their parent.
//     (This is Key Learning #11 from your project!)
// ═══════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardStats,
  selectDashboardStats,
  selectDashboardLoading,
  selectDashboardError,
} from "../features/Dashboard/DashboardSlice";

// ════════════════════════════════════════════════════════════════
// HELPER COMPONENTS — defined OUTSIDE DashboardPage
// ════════════════════════════════════════════════════════════════

// ── Stat Card ──────────────────────────────────────────────────
// Renders one metric card: icon + label + value
//
// Props:
//   label  (string) — "Total Students"
//   value  (number) — 10
//   icon   (JSX)    — SVG icon
//   color  (string) — Tailwind color class for the icon background
//   trend  (string) — optional: "+5 this month" (decorative)
const StatCard = ({ label, value, icon, color, trend }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow duration-200">
    {/* Icon container */}
    <div
      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}
    >
      {icon}
    </div>

    {/* Text content */}
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      {/* WHY ?? "—"?
          If value is 0, we still want to show 0.
          But if value is null/undefined (not yet loaded), show "—".
          ?? checks for null/undefined only (not 0). */}
      <p className="text-2xl font-bold text-slate-900 mt-0.5">{value ?? "—"}</p>
      {trend && (
        <p className="text-xs text-emerald-600 font-medium mt-1">{trend}</p>
      )}
    </div>
  </div>
);

// ── Section Header ────────────────────────────────────────────
// Reusable title + description for each dashboard section
const SectionHeader = ({ title, description }) => (
  <div className="mb-4">
    <h3 className="text-base font-bold text-slate-800">{title}</h3>
    {description && (
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
    )}
  </div>
);

// ── Skeleton Card (Loading State) ─────────────────────────────
// WHY a skeleton instead of a spinner?
//   Skeletons show the SHAPE of content while it loads.
//   This reduces "layout shift" — the page doesn't jump when data arrives.
//   They feel faster because the user sees structure immediately.
//   Modern UX pattern used by LinkedIn, YouTube, Facebook.
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4 animate-pulse">
    <div className="w-11 h-11 rounded-xl bg-slate-100 shrink-0" />
    <div className="flex-1 space-y-2 pt-1">
      <div className="h-3 bg-slate-100 rounded-full w-2/3" />
      <div className="h-6 bg-slate-100 rounded-full w-1/3" />
    </div>
  </div>
);

// ── Recent Homework Row ───────────────────────────────────────
// One row in the recent homework table
const HomeworkRow = ({ hw }) => {
  const isActive = hw.status === "Active";
  const dueDate = new Date(hw.dueDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50/60 transition-colors rounded-xl">
      {/* Status dot */}
      <div
        className={`w-2 h-2 rounded-full shrink-0 ${isActive ? "bg-emerald-500" : "bg-slate-300"}`}
      />

      {/* Homework info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {hw.title}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {hw.teacherName ?? "Unknown Teacher"} · {hw.className ?? "No Class"}
        </p>
      </div>

      {/* Due date + status badge */}
      <div className="text-right shrink-0">
        <p className="text-xs font-medium text-slate-600">Due {dueDate}</p>
        <span
          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {hw.status}
        </span>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// ICON DEFINITIONS — pure SVG, defined outside so they don't
// trigger re-renders. Pass as JSX props to StatCard.
// ════════════════════════════════════════════════════════════════
const iconClass = "w-5 h-5";

const Icons = {
  students: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={iconClass}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766A4.125 4.125 0 0 1 9.74 16.75c.616 1.13 1.516 2.063 2.61 2.697m3.176-3.07a11.954 11.954 0 0 0 3.14-1.29m-3.14 1.29a11.968 11.968 0 0 1-3.141 1.29m3.141-1.29H15M1.875 19.006A10.079 10.079 0 0 1 6 18.75m0 0a10.079 10.079 0 0 1 4.125.256m-4.125-.256V18.75a9 9 0 1 1 12.015-8.549M12 3.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
      />
    </svg>
  ),
  teachers: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={iconClass}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
      />
    </svg>
  ),
  departments: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={iconClass}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
      />
    </svg>
  ),
  courses: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={iconClass}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
      />
    </svg>
  ),
  classes: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={iconClass}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-1.342m-7.482 0L12 13.49m0 0 3.741-1.342m-3.74 1.342L12 13.49"
      />
    </svg>
  ),
  subjects: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={iconClass}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
      />
    </svg>
  ),
  present: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={iconClass}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  ),
  absent: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={iconClass}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  ),
  late: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={iconClass}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  ),
  homework: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={iconClass}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    </svg>
  ),
};

// ════════════════════════════════════════════════════════════════
// THE MAIN DASHBOARD PAGE COMPONENT
// ════════════════════════════════════════════════════════════════
const DashboardPage = () => {
  const dispatch = useDispatch();
  const stats = useSelector(selectDashboardStats);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);

  // ── Fetch on mount ───────────────────────────────────────────
  // WHY useEffect with empty dependency array []?
  //   [] means "run this ONCE when the component first mounts."
  //   Without [], it would run on EVERY render → infinite API calls.
  //
  // WHY dispatch inside useEffect (not directly in the component body)?
  //   Component body runs on every render.
  //   useEffect lets us control WHEN the side effect (API call) runs.
  //   API calls are "side effects" — they interact with the outside world.
  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // ── Error state ───────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 text-2xl">
          ⚠️
        </div>
        <p className="text-sm font-semibold text-slate-700">{error}</p>
        <button
          onClick={() => dispatch(fetchDashboardStats())}
          className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── Computed values (safe to access even while loading) ───────
  // WHY optional chaining (stats?.totalStudents)?
  //   When loading = true, stats = null.
  //   stats?.totalStudents = undefined (safe, no crash).
  //   StatCard renders "—" for undefined values (via the ?? "—" in StatCard).
  //   This pattern avoids having to check "if (stats)" in every line.
  const s = stats; // short alias

  return (
    <div className="space-y-10">
      {/* ════════════════════════════════════════════════════════
          SECTION 1: Overview Stats (6 cards)
      ════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          title="Overview"
          description="Total counts across the entire school system"
        />

        {/* WHY grid with responsive cols?
            On mobile: 1 column (grid-cols-1)
            On sm: 2 columns
            On lg: 3 columns
            This is "responsive design" with Tailwind's breakpoint prefixes. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            // Show 6 skeleton cards while loading
            [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard
                label="Total Students"
                value={s?.totalStudents}
                icon={Icons.students}
                color="bg-blue-50 text-blue-600"
              />
              <StatCard
                label="Total Teachers"
                value={s?.totalTeachers}
                icon={Icons.teachers}
                color="bg-violet-50 text-violet-600"
              />
              <StatCard
                label="Departments"
                value={s?.totalDepartments}
                icon={Icons.departments}
                color="bg-amber-50 text-amber-600"
              />
              <StatCard
                label="Courses"
                value={s?.totalCourses}
                icon={Icons.courses}
                color="bg-emerald-50 text-emerald-600"
              />
              <StatCard
                label="Classes"
                value={s?.totalClasses}
                icon={Icons.classes}
                color="bg-indigo-50 text-indigo-600"
              />
              <StatCard
                label="Subjects"
                value={s?.totalSubjects}
                icon={Icons.subjects}
                color="bg-rose-50 text-rose-600"
              />
            </>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECTION 2: Today's Attendance
      ════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          title="Today's Attendance"
          description={`Attendance status for ${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {loading ? (
            [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard
                label="Present Today"
                value={s?.todayPresent}
                icon={Icons.present}
                color="bg-emerald-50 text-emerald-600"
              />
              <StatCard
                label="Absent Today"
                value={s?.todayAbsent}
                icon={Icons.absent}
                color="bg-red-50 text-red-500"
              />
              <StatCard
                label="Late Today"
                value={s?.todayLate}
                icon={Icons.late}
                color="bg-amber-50 text-amber-600"
              />
            </>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECTION 3: Homework Summary
      ════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          title="Homework Summary"
          description="Active vs. archived assignments across all classes"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loading ? (
            [...Array(2)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard
                label="Active Homework"
                value={s?.activeHomework}
                icon={Icons.homework}
                color="bg-indigo-50 text-indigo-600"
              />
              <StatCard
                label="Archived Homework"
                value={s?.archivedHomework}
                icon={Icons.homework}
                color="bg-slate-100 text-slate-500"
              />
            </>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECTION 4: Recent Homework Activity
      ════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          title="Recent Homework"
          description="The 5 most recently assigned homework items"
        />

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            // Loading skeleton for the list
            <div className="p-4 space-y-3 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-2 h-2 rounded-full bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-slate-100 rounded-full w-2/3" />
                    <div className="h-3 bg-slate-100 rounded-full w-1/3" />
                  </div>
                  <div className="w-16 h-5 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : !s?.recentHomework?.length ? (
            // Empty state
            <div className="py-12 text-center">
              <p className="text-2xl mb-2">📭</p>
              <p className="text-sm font-medium text-slate-600">
                No homework assigned yet
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Homework will appear here once teachers assign it.
              </p>
            </div>
          ) : (
            // The actual list
            <div className="p-2">
              {s.recentHomework.map((hw) => (
                <HomeworkRow key={hw.id} hw={hw} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
