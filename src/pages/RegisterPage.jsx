import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  registerUser,
  resetRegister,
  selectRegisterLoading,
  selectRegisterError,
  selectRegisterSuccess,
} from "../features/auth/authSlice";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    email: "",
    role: "Student",
    isActive: true,
  });

  // ✅ NEW: Separate state for the image
  // ❓ Why separate from formData?
  // formData holds simple text strings that React can easily re-render.
  // A File object is binary data — it doesn't fit in a plain JS object cleanly.
  // Keeping it separate makes the code cleaner and easier to understand.
  const [profileImage, setProfileImage] = useState(null);

  // ✅ NEW: Preview URL for showing the selected image BEFORE uploading
  // ❓ How does preview work?
  // URL.createObjectURL(file) creates a TEMPORARY browser URL like
  // "blob:http://localhost:5173/abc123-..."
  // This lets us show the image in an <img> tag instantly, without uploading.
  const [imagePreview, setImagePreview] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loading = useSelector(selectRegisterLoading);
  const error = useSelector(selectRegisterError);
  const success = useSelector(selectRegisterSuccess);

  // Clean up when leaving this page
  useEffect(() => {
    return () => {
      dispatch(resetRegister());
      // ✅ IMPORTANT: Clean up the blob URL to free browser memory
      // ❓ Why? The browser keeps blob URLs in memory until you revoke them.
      // If the user navigates away without uploading, we should free that memory.
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [dispatch]);

  // Redirect to login on successful registration
  useEffect(() => {
    if (success) {
      dispatch(resetRegister());
      navigate("/login");
    }
  }, [success, dispatch, navigate]);

  // Handle regular text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ NEW: Handle file input change
  const handleImageChange = (e) => {
    // e.target.files is a FileList (array-like)
    // [0] gets the first (and only) selected file
    const file = e.target.files[0];

    if (!file) return; // user pressed "cancel" in the file picker

    // ── Validate on the frontend too ───────────────────────────────────────
    // ❓ Why validate on frontend if we also validate on backend?
    // Frontend validation gives INSTANT feedback without a server round-trip.
    // It's a UX improvement, not a security measure. Always validate on backend.
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a valid image file (JPG, PNG, GIF, WebP)");
      return;
    }

    // ── 5MB size limit ──────────────────────────────────────────────────────
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert("Image must be smaller than 5MB");
      return;
    }

    // Save the File object for later submission
    setProfileImage(file);

    // Create a preview URL and save it for the <img> tag
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // ✅ NEW: Remove selected image
  const handleRemoveImage = () => {
    setProfileImage(null);
    // Revoke the old preview URL to free memory
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass both form text data AND the image file to the thunk
    dispatch(registerUser({ ...formData, profileImage }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-sky-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md p-8 sm:p-10 relative z-10">
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
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Create Account
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Register a new EduPulse school account.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl px-4 py-3.5 mb-6 flex items-center gap-2.5">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ✅ NEW: Profile Image Upload Section */}
          {/* 
            ❓ Why this UI pattern (click zone + hidden input)?
            HTML's native <input type="file"> looks ugly and can't be styled easily.
            Instead, we:
            1. Hide the actual input with "hidden" class
            2. Create a beautiful custom "click zone"
            3. When the user clicks the zone, we programmatically click the hidden input
            This gives us full styling control while keeping the browser's native file picker.
          */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Profile Photo{" "}
              <span className="text-slate-400 normal-case font-normal">
                (optional)
              </span>
            </label>

            {/* Show preview if image selected, otherwise show upload zone */}
            {imagePreview ? (
              // ── PREVIEW STATE: Show the selected image ────────────────────
              <div className="relative flex flex-col items-center gap-3 p-4 border-2 border-indigo-200 rounded-xl bg-indigo-50/30">
                <div className="relative">
                  {/* 
                    ❓ The imagePreview is a "blob:" URL created by URL.createObjectURL().
                    The <img> src can be any valid URL — blob URLs work just fine.
                    This shows the image BEFORE it's uploaded to the server.
                  */}
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                  />
                  {/* Remove button overlaid on the image */}
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 
                               text-white rounded-full flex items-center justify-center 
                               text-xs transition shadow-sm"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  {profileImage?.name}
                </p>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Choose different photo
                </button>
              </div>
            ) : (
              // ── EMPTY STATE: Show the upload click zone ──────────────────
              <label
                htmlFor="profileImageInput"
                className="flex flex-col items-center justify-center gap-2 
                           w-full h-32 border-2 border-dashed border-slate-200 
                           rounded-xl cursor-pointer bg-slate-50/50 
                           hover:border-indigo-300 hover:bg-indigo-50/30 
                           transition-all duration-200 group"
              >
                {/* Camera icon */}
                <div
                  className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-indigo-100 
                                flex items-center justify-center transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">
                    Click to upload photo
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    PNG, JPG, WebP up to 5MB
                  </p>
                </div>
              </label>
            )}

            {/* 
              ✅ The actual hidden file input.
              id="profileImageInput" links it to the <label htmlFor="profileImageInput"> above.
              When the label is clicked, the browser opens the file picker for THIS input.
              accept="image/*" filters the file picker to show only image files.
            */}
            <input
              id="profileImageInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Username
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
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="johndoe"
                required
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50"
              />
            </div>
          </div>

          {/* Email */}
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
                placeholder="john@school.com"
                required
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Password
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
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-11 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 appearance-none cursor-pointer"
            >
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2.5 mt-3"
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
                <span>Registering...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
