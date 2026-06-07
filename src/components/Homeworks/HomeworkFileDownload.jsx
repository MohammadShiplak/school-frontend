// ═══════════════════════════════════════════════════════════════
// FILE: src/components/homework/HomeworkFileDownload.jsx
//
// A reusable component to show a download button for homework files.
// Used in your HomeworkPage table rows.
// ═══════════════════════════════════════════════════════════════

// WHY a separate component for the download button:
//   The download logic (building the URL + triggering download) is
//   reusable and should not clutter the page component.
//   Separation of concerns — display vs data.

const HomeworkFileDownload = ({ filePath, fileName }) => {
  // If no file attached, show a subtle "no file" indicator
  if (!filePath) {
    return <span className="text-xs text-slate-400 italic">No file</span>;
  }

  // ── Build the download URL ─────────────────────────────────────────
  // filePath in DB: "homework-files/Chapter5_abc123.pdf"
  // We need: "https://localhost:7001/homework-files/Chapter5_abc123.pdf"
  //
  // WHY use VITE_API_URL and replace "/api":
  //   VITE_API_URL = "https://localhost:7001/api"
  //   Static files are served from the ROOT, not under /api.
  //   So we strip "/api": "https://localhost:7001"
  //   Then append filePath: "https://localhost:7001/homework-files/abc.pdf"
  //
  // Alternative: Add a separate VITE_STATIC_URL to your .env file.
  //   VITE_STATIC_URL=https://localhost:7001
  //   That's cleaner for production. For learning, the replace approach is fine.
  const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "";
  const fileUrl = `${baseUrl}/${filePath}`;

  return (
    // WHY <a> tag with download attribute instead of a button:
    //   Native <a> with href triggers a file download correctly.
    //   The 'download' attribute tells the browser to download instead of navigate.
    //   If the file is a PDF, without 'download' the browser might open it inline.
    //   With 'download={fileName}', the browser saves it with the original name.
    //
    // WHY target="_blank":
    //   Opens in a new tab as fallback (some browsers ignore 'download' for cross-origin).
    //
    // WHY rel="noopener noreferrer":
    //   Security best practice when using target="_blank".
    //   Prevents the new tab from having access to the original window.
    <a
      href={fileUrl}
      download={fileName || "assignment"}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 
                 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 
                 text-indigo-700 text-xs font-medium rounded-lg 
                 transition-all duration-150 group"
      title={`Download: ${fileName}`}
    >
      {/* Download icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>
      {/* Truncate long file names in the button */}
      <span className="max-w-[120px] truncate">{fileName || "Download"}</span>
    </a>
  );
};

export default HomeworkFileDownload;

// ═══════════════════════════════════════════════════════════════
// MIGRATION INSTRUCTIONS
// Run these commands in your backend project folder terminal:
//
//   1. Add the migration (creates the SQL script):
//      dotnet ef migrations add AddHomeworkFilePath
//
//   2. Apply the migration (updates the database):
//      dotnet ef database update
//
// WHY two steps:
//   'add' creates a C# file describing the change.
//   'update' executes the SQL against your SQL Server database.
//   Keeping them separate lets you REVIEW the migration before running it.
//
// WHAT the migration will do:
//   ALTER TABLE [Homeworks]
//   ADD [FilePath] nvarchar(500) NULL
//
// That's it — one nullable column added to the Homeworks table.
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// USAGE IN YOUR HomeworkPage.jsx (how to use HomeworkFileDownload):
//
// In your table row where you map homework items, add:
//
//   import HomeworkFileDownload from "../components/homework/HomeworkFileDownload";
//
//   // Inside your table row:
//   <td className="px-4 py-3">
//     <HomeworkFileDownload
//       filePath={hw.filePath}
//       fileName={hw.fileName}
//     />
//   </td>
//
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// PROGRAM.CS REMINDER
// Make sure you have UseStaticFiles() in your Program.cs!
// This is what allows the browser to access files in wwwroot.
//
// In Program.cs, after app is built:
//   app.UseStaticFiles(); // ← This line must exist!
//
// Without it, requests to /homework-files/abc.pdf return 404.
// With it, ASP.NET serves all files from wwwroot automatically.
// ═══════════════════════════════════════════════════════════════
