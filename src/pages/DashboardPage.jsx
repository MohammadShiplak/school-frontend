// src/pages/DashboardPage.jsx
const DashboardPage = () => {
  return (
    <div>
      {/* ── Page Title ── */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Students", count: "120", icon: "👨‍🎓", color: "bg-blue-500" },
          { label: "Teachers", count: "24", icon: "👨‍🏫", color: "bg-green-500" },
          { label: "Classes", count: "12", icon: "🏫", color: "bg-yellow-500" },
          { label: "Courses", count: "8", icon: "🎓", color: "bg-purple-500" },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl shadow-sm p-6 
                       flex items-center gap-4"
          >
            <div
              className={`${card.color} text-white text-2xl 
                             w-12 h-12 rounded-lg flex items-center 
                             justify-center`}
            >
              {card.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{card.count}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Welcome Card ── */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          👋 Welcome to School Management System
        </h2>
        <p className="text-gray-500 text-sm">
          Use the sidebar to navigate between sections. More features coming
          soon!
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
