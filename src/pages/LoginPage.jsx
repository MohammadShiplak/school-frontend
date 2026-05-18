import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  loginUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from "../features/auth/authSlice";

const LoginPage = () => {
  // ── Local form state ───────────────────────────────────────
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // ── Redux state ────────────────────────────────────────────
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  // ── If already logged in, skip login page ─────────────────
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // ── Handle input changes ───────────────────────────────────
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ── Handle form submit ─────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      loginUser({
        email: formData.email,
        password: formData.password,
      }),
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background shapes for depth */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-sky-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md p-8 sm:p-10 transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-7 h-7"
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
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            EduPulse Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Dynamic Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl px-4 py-3.5 mb-6 flex items-center gap-2.5 animate-fadeIn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 shrink-0 text-rose-500"
            >
              <path
                fillRule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.401 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Address Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
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
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 17.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@school.com"
                required
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <a
                href="#forgot"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
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
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-11 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
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
                      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
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
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Elegant Sign-In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:bg-indigo-400 disabled:scale-100 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2.5 mt-2 hover:-translate-y-0.5 disabled:pointer-events-none disabled:hover:translate-y-0"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer — Harmonized Link to Register and Security Info */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-5">
          <p className="text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors hover:underline"
            >
              Create one
            </Link>
          </p>
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 text-slate-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
            Secured Enterprise SSL Connection
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
