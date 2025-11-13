// src/app/(protected)/dashboard/admin/page.tsx
// Admin dashboard home page with blue and golden theme
export default function AdminDashboard() {
  return (
    <>
      {/* Dashboard Overview */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your platform.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Total Users",
            value: "1,234",
            change: "+12%",
            icon: "👥",
            gradient: "from-blue-500 to-blue-600",
          },
          {
            title: "Active Courses",
            value: "24",
            change: "+3",
            icon: "📚",
            gradient: "from-amber-500 to-amber-600",
          },
          {
            title: "Total Revenue",
            value: "₹12,345",
            change: "-3%",
            icon: "💰",
            gradient: "from-blue-600 to-indigo-600",
          },
          {
            title: "Pending Certificates",
            value: "18",
            change: null,
            icon: "🏆",
            gradient: "from-yellow-500 to-amber-600",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center text-2xl shadow-sm`}>
                {card.icon}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              {card.title}
            </h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
            {card.change !== null && (
              <div className="flex items-center">
                <span
                  className={`text-sm font-medium ${
                    card.change.startsWith("+")
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {card.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
        <div className="space-y-3">
          {[
            {
              action: "New enrollment in KP Astrology Course",
              time: "5 minutes ago",
              type: "enrollment",
              color: "blue",
            },
            {
              action: "Certificate request submitted",
              time: "1 hour ago",
              type: "certificate",
              color: "amber",
            },
            {
              action: "New blog post published",
              time: "2 hours ago",
              type: "blog",
              color: "indigo",
            },
            {
              action: "Payment received - ₹4,999",
              time: "3 hours ago",
              type: "payment",
              color: "emerald",
            },
          ].map((act, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-4 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 border border-gray-100"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    act.color === "blue"
                      ? "bg-blue-100"
                      : act.color === "amber"
                      ? "bg-amber-100"
                      : act.color === "indigo"
                      ? "bg-indigo-100"
                      : "bg-emerald-100"
                  }`}
                >
                  <span className="text-lg">
                    {act.type === "enrollment"
                      ? "📝"
                      : act.type === "certificate"
                      ? "🎓"
                      : act.type === "blog"
                      ? "✍️"
                      : "💳"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {act.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{act.time}</p>
                </div>
              </div>
              <span
                className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                  act.color === "blue"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : act.color === "amber"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : act.color === "indigo"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {act.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}