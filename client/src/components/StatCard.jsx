import React from "react";

const colorClasses = {
  blue: "bg-blue-50 text-blue-600 border-blue-200",
  green: "bg-green-50 text-green-600 border-green-200",
  yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
  red: "bg-red-50 text-red-600 border-red-200",
  purple: "bg-purple-50 text-purple-600 border-purple-200",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
};

const iconBgClasses = {
  blue: "bg-blue-100",
  green: "bg-green-100",
  yellow: "bg-yellow-100",
  red: "bg-red-100",
  purple: "bg-purple-100",
  indigo: "bg-indigo-100",
};

export default function StatCard({
  title,
  value,
  icon,
  color = "blue",
  subtitle,
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border p-6 ${colorClasses[color]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1 text-gray-800">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${iconBgClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
