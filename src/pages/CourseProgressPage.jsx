// File: src/pages/CourseProgressPage.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  triggerCalculation,
  fetchStudentProgress,
  fetchCourseProgress,
  selectProgressList,
  selectProgressLoading,
  selectProgressError,
  selectCalculating,
  selectCalcError,
  clearProgress,
} from "../features/progress/progressSlice";

// ─────────────────────────────────────────────────────────────────
// PROGRESS BAR COMPONENT
// WHY outside the page: pure presentational, never changes.
// Defined outside = created once, not recreated on every render.
// ─────────────────────────────────────────────────────────────────
const ProgressBar = ({ value, color = "indigo" }) => {
  // Clamp between 0 and 100
  const pct = Math.min(100, Math.max(0, value));

  // Color map — Tailwind classes for each color variant
  const colorMap = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
  };

  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all duration-700 ease-out ${colorMap[color] ?? "bg-indigo-500"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// GRADE BADGE COMPONENT
// ─────────────────────────────────────────────────────────────────
const GradeBadge = ({ label }) => {
  // Derive color from grade letter
  const grade = label?.[0] ?? "F";
  const style =
    {
      A: "bg-emerald-50 text-emerald-700 border-emerald-200",
      B: "bg-blue-50 text-blue-700 border-blue-200",
      C: "bg-amber-50 text-amber-700 border-amber-200",
      D: "bg-orange-50 text-orange-700 border-orange-200",
      F: "bg-red-50 text-red-700 border-red-200",
    }[grade] ?? "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}
    >
      {label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────
// PROGRESS CARD — one card per student or course
// ─────────────────────────────────────────────────────────────────
const ProgressCard = ({ progress }) => {
  // Determine the color of the main progress bar
  const barColor =
    progress.overallProgress >= 80
      ? "emerald"
      : progress.overallProgress >= 60
        ? "blue"
        : progress.overallProgress >= 40
          ? "amber"
          : "red";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-slate-800 text-sm leading-tight">
            {progress.studentName}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{progress.courseName}</p>
        </div>
        <GradeBadge label={progress.gradeLabel} />
      </div>

      {/* OVERALL PROGRESS — the big number */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">
            Overall Progress
          </span>
          <span className="text-lg font-bold text-slate-900">
            {progress.overallProgress}%
          </span>
        </div>
        <ProgressBar value={progress.overallProgress} color={barColor} />
      </div>

      {/* BREAKDOWN — the 3 components */}
      {/* WHY show the breakdown?
           The student needs to know WHERE they lost points.
           "You're at 65% mainly because attendance is 40%"
           is more useful than just "You're at 65%". */}
      <div className="space-y-2.5 pt-1 border-t border-slate-50">
        {/* Homework */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              📚 Homework
              <span className="text-slate-300">(40% weight)</span>
            </span>
            <span className="font-semibold text-slate-700">
              {progress.homeworkScore}%
            </span>
          </div>
          <ProgressBar value={progress.homeworkScore} color="indigo" />
        </div>

        {/* Attendance */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              📋 Attendance
              <span className="text-slate-300">(30% weight)</span>
            </span>
            <span className="font-semibold text-slate-700">
              {progress.attendanceScore}%
            </span>
          </div>
          <ProgressBar value={progress.attendanceScore} color="emerald" />
        </div>

        {/* Exams */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              📝 Exams
              <span className="text-slate-300">(30% weight)</span>
            </span>
            <span className="font-semibold text-slate-700">
              {progress.examScore}%
            </span>
          </div>
          <ProgressBar value={progress.examScore} color="blue" />
        </div>
      </div>

      {/* Data source info */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-50">
        <div className="flex gap-3 text-xs text-slate-400">
          <span>{progress.totalHomeworks} assignments</span>
          <span>{progress.totalAttendanceDays} days</span>
          <span>{progress.totalExams} exams</span>
        </div>
        <span className="text-[10px] text-slate-300">
          {new Date(progress.calculatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// CALCULATE PANEL — the form to trigger a calculation
// ─────────────────────────────────────────────────────────────────
const CalculatePanel = () => {
  const dispatch = useDispatch();
  const calculating = useSelector(selectCalculating);
  const calcError = useSelector(selectCalcError);
  const lastCalc = useSelector((state) => state.progress.lastCalculated);

  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");

  const handleCalculate = () => {
    if (!studentId || !courseId) return;
    dispatch(
      triggerCalculation({
        studentId: Number(studentId),
        courseId: Number(courseId),
      }),
    );
  };

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="font-bold text-indigo-900 text-sm">
          ⚡ Calculate Progress
        </h3>
        <p className="text-xs text-indigo-600 mt-0.5">
          Enter a student ID and course ID to calculate their progress. This
          recalculates using the latest data.
        </p>
      </div>

      <div className="flex gap-3">
        <input
          type="number"
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="flex-1 border border-indigo-200 rounded-xl px-3.5 py-2 
                     text-sm bg-white focus:outline-none focus:ring-2 
                     focus:ring-indigo-400/20 focus:border-indigo-400"
        />
        <input
          type="number"
          placeholder="Course ID"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="flex-1 border border-indigo-200 rounded-xl px-3.5 py-2 
                     text-sm bg-white focus:outline-none focus:ring-2 
                     focus:ring-indigo-400/20 focus:border-indigo-400"
        />
        <button
          onClick={handleCalculate}
          disabled={calculating || !studentId || !courseId}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 
                     disabled:bg-indigo-300 text-white text-sm font-semibold 
                     rounded-xl transition flex items-center gap-2 shadow-sm"
        >
          {calculating ? (
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
              Calculating...
            </>
          ) : (
            "Calculate"
          )}
        </button>
      </div>

      {/* Error */}
      {calcError && (
        <p
          className="text-xs text-red-600 bg-red-50 border border-red-100 
                      rounded-xl px-3 py-2"
        >
          ⚠️ {calcError}
        </p>
      )}

      {/* Success result */}
      {lastCalc && !calcError && (
        <div
          className="bg-white border border-indigo-100 rounded-xl p-3 
                        flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-slate-700">
              ✅ {lastCalc.studentName} — {lastCalc.courseName}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Progress:{" "}
              <span className="font-bold text-indigo-600">
                {lastCalc.overallProgress}%
              </span>{" "}
              · {lastCalc.gradeLabel}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────
const CourseProgressPage = () => {
  const dispatch = useDispatch();
  const progressList = useSelector(selectProgressList);
  const loading = useSelector(selectProgressLoading);
  const error = useSelector(selectProgressError);

  // ── View mode toggle ─────────────────────────────────────────
  // "student" = search by student, "course" = search by course
  const [viewMode, setViewMode] = useState("student");
  const [searchId, setSearchId] = useState("");

  const handleSearch = () => {
    if (!searchId) return;
    if (viewMode === "student") {
      dispatch(fetchStudentProgress(Number(searchId)));
    } else {
      dispatch(fetchCourseProgress(Number(searchId)));
    }
  };

  const handleClear = () => {
    setSearchId("");
    dispatch(clearProgress());
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-6">
      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Course Progress
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Track student progress across homework, attendance, and exams.
        </p>
      </div>

      {/* ── CALCULATE PANEL ──────────────────────────────────── */}
      <CalculatePanel />

      {/* ── SEARCH BAR ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Toggle: Student vs Course */}
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            {["student", "course"].map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setViewMode(mode);
                  handleClear();
                }}
                className={`flex-1 px-4 py-2 text-sm font-medium capitalize transition
                  ${
                    viewMode === mode
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-500 hover:bg-slate-50"
                  }`}
              >
                By {mode}
              </button>
            ))}
          </div>

          {/* ID input */}
          <input
            type="number"
            placeholder={`Enter ${viewMode} ID...`}
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2 
                       text-sm focus:outline-none focus:ring-2 
                       focus:ring-indigo-500/20 focus:border-indigo-400"
          />

          <button
            onClick={handleSearch}
            disabled={!searchId || loading}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 
                       disabled:bg-slate-300 text-white text-sm font-semibold 
                       rounded-xl transition"
          >
            {loading ? "Loading..." : "View Progress"}
          </button>

          {progressList.length > 0 && (
            <button
              onClick={handleClear}
              className="px-4 py-2 border border-slate-200 rounded-xl 
                         text-sm text-slate-500 hover:bg-slate-50 transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── ERROR ────────────────────────────────────────────── */}
      {error && (
        <div
          className="bg-red-50 border border-red-100 text-red-700 
                        text-sm rounded-2xl px-5 py-4"
        >
          ⚠️ {error}
        </div>
      )}

      {/* ── RESULTS GRID ─────────────────────────────────────── */}
      {!loading && progressList.length > 0 && (
        <>
          <p className="text-xs text-slate-400 font-medium">
            {progressList.length} record{progressList.length !== 1 ? "s" : ""}{" "}
            found
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {progressList.map((p) => (
              <ProgressCard key={p.id} progress={p} />
            ))}
          </div>
        </>
      )}

      {/* ── EMPTY STATE ──────────────────────────────────────── */}
      {!loading && !error && progressList.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-20 gap-3 
                        bg-white rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="text-4xl">📊</div>
          <p className="text-sm font-semibold text-slate-700">
            No progress data yet
          </p>
          <p className="text-xs text-slate-400 text-center max-w-xs">
            First calculate progress for a student + course using the panel
            above, then search by student or course ID to view results.
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseProgressPage;
