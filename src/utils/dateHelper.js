// src/utils/dateHelper.js

// ── Format date for display ───────────────────────────────────
// Input:  "2003-03-03T00:00:00" or "2003-03-03"
// Output: "3/3/2003"
export const formatDate = (dateString) => {
  // If no date or it's the default C# date → show "Not set"
  if (!dateString || dateString.startsWith("0001")) {
    return "Not set";
  }

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  // toLocaleDateString gives us "3/3/2003" format
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
};

// ── Format date for input field (type="date") ────────────────
// Input:  "2003-03-03T00:00:00"
// Output: "2003-03-03" (required by HTML date input)
export const formatDateForInput = (dateString) => {
  if (!dateString || dateString.startsWith("0001")) {
    return "";
  }
  return dateString.slice(0, 10);
};
