// ═══════════════════════════════════════════════════════════════
// FILE: src/api/classSubjectAPI.js
//
// WHY A SEPARATE API FILE?
//   This file is the only place that knows about:
//   - The backend URL (/api/ClassSubject)
//   - Which HTTP method to use (GET, POST, DELETE)
//   - What parameters to send
//
//   Components and Redux slices CALL these functions.
//   They don't write URLs themselves.
//
//   WHY is that better?
//   If the URL changes (e.g. /api/ClassSubject → /api/class-subject),
//   you fix it in ONE place (here), not in every component.
//   This is the Single Responsibility Principle applied to API calls.
//
// PATTERN: Same as homeworkAPI.js, teachersAPI.js in your project.
// ═══════════════════════════════════════════════════════════════

import axiosInstance from "./axiosInstance";
// ↑ WHY axiosInstance (not raw axios)?
//   axiosInstance has a request interceptor that AUTOMATICALLY attaches
//   the JWT token from localStorage to every request.
//   You wrote this in axiosInstance.js. It's the central point for auth.
//   Raw axios doesn't have that — you'd need to manually attach the token every time.

// ── GET: All subjects for a given class ─────────────────────────
// Example: getSubjectsByClass(1) → GET /api/ClassSubject/class/1
// Returns: List<ClassSubjectReadDTO>
export const getSubjectsByClass = (classId) => {
  return axiosInstance.get(`/api/ClassSubject/class/${classId}`);
};

// ── GET: All classes that teach a given subject ─────────────────
// Example: getClassesBySubject(2) → GET /api/ClassSubject/subject/2
// Returns: List<ClassSubjectReadDTO>
export const getClassesBySubject = (subjectId) => {
  return axiosInstance.get(`/api/ClassSubject/subject/${subjectId}`);
};

// ── POST: Assign a subject to a class ───────────────────────────
// Example: assignSubjectToClass({ classId: 1, subjectId: 3 })
//       → POST /api/ClassSubject
//          Body: { "classId": 1, "subjectId": 3 }
// Returns: ClassSubjectReadDTO (the created assignment with names)
//
// WHY no manual Content-Type header?
//   Axios automatically sets Content-Type: application/json when you pass
//   a JS object as the second argument to .post().
//   You'd only need to set it manually for multipart/form-data (like homework files).
export const assignSubjectToClass = (assignmentData) => {
  return axiosInstance.post("/api/ClassSubject", assignmentData);
};

// ── DELETE: Remove a subject from a class ───────────────────────
// Example: removeSubjectFromClass(1, 3)
//       → DELETE /api/ClassSubject/1/3
//
// WHY no request body?
//   The backend identifies what to delete from the URL: /1/3 = classId=1, subjectId=3.
//   DELETE requests conventionally put the identifier in the URL, not the body.
export const removeSubjectFromClass = (classId, subjectId) => {
  return axiosInstance.delete(`/api/ClassSubject/${classId}/${subjectId}`);
};
