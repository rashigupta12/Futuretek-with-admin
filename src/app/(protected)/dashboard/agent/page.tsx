// src/app/(protected)/dashboard/admin/page.tsx
// Admin dashboard home page
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
            color: "blue",
          },
          {
            title: "Active Courses",
            value: "24",
            change: "+3",
            color: "purple",
          },
          {
            title: "Total Revenue",
            value: "₹12,345",
            change: "-3%",
            color: "green",
          },
          {
            title: "Pending Certificates",
            value: "18",
            change: null,
            color: "orange",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                {card.title}
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            {card.change !== null && (
              <p
                className={`text-sm mt-2 flex items-center ${
                  card.change.startsWith("+")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <span>{card.change}</span>
                <span className="text-gray-500 ml-1">from last month</span>
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[
            {
              action: "New enrollment in KP Astrology Course",
              time: "5 minutes ago",
              type: "enrollment",
            },
            {
              action: "Certificate request submitted",
              time: "1 hour ago",
              type: "certificate",
            },
            {
              action: "New blog post published",
              time: "2 hours ago",
              type: "blog",
            },
            {
              action: "Payment received - ₹4,999",
              time: "3 hours ago",
              type: "payment",
            },
          ].map((act, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b last:border-b-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {act.action}
                </p>
                <p className="text-xs text-gray-500 mt-1">{act.time}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  act.type === "enrollment"
                    ? "bg-blue-100 text-blue-700"
                    : act.type === "certificate"
                    ? "bg-orange-100 text-orange-700"
                    : act.type === "blog"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-green-100 text-green-700"
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
