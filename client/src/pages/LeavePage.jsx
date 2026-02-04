import React, { useState } from "react";
import Table from "../components/Table";
import Modal from "../components/Modal";
import { leaves, leaveBalances, leaveTypes } from "../data/mockData";

export default function Leave() {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  const filteredLeaves = leaves.filter((leave) => {
    return !selectedStatus || leave.status === selectedStatus;
  });

  const columns = [
    {
      header: "Employee",
      accessor: "employeeName",
      render: (value) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
            {value
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <span className="font-medium text-gray-800">{value}</span>
        </div>
      ),
    },
    {
      header: "Leave Type",
      accessor: "leaveType",
      render: (value) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            value === "Vacation Leave"
              ? "bg-blue-100 text-blue-700"
              : value === "Sick Leave"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      header: "Date Range",
      accessor: "startDate",
      render: (_, row) => `${row.startDate} - ${row.endDate}`,
    },
    { header: "Days", accessor: "days" },
    { header: "Reason", accessor: "reason" },
    {
      header: "Status",
      accessor: "status",
      render: (value) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            value === "Approved"
              ? "bg-green-100 text-green-700"
              : value === "Pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "id",
      render: (_, row) =>
        row.status === "Pending" ? (
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              Approve
            </button>
            <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              Reject
            </button>
          </div>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
          <p className="text-gray-500 mt-1">Manage employee leave requests</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Request Leave
        </button>
      </div>

      {/* Leave Balances */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Leave Balances
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-500">
                  Employee
                </th>
                <th className="text-center py-2 text-sm font-medium text-gray-500">
                  Vacation Leave
                </th>
                <th className="text-center py-2 text-sm font-medium text-gray-500">
                  Sick Leave
                </th>
                <th className="text-center py-2 text-sm font-medium text-gray-500">
                  Emergency Leave
                </th>
              </tr>
            </thead>
            <tbody>
              {leaveBalances.map((balance) => (
                <tr
                  key={balance.employeeId}
                  className="border-b border-gray-100"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                        {balance.employeeName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="font-medium text-gray-800">
                        {balance.employeeName}
                      </span>
                    </div>
                  </td>
                  <td className="text-center py-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {balance.vacationLeave} days
                    </span>
                  </td>
                  <td className="text-center py-3">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      {balance.sickLeave} days
                    </span>
                  </td>
                  <td className="text-center py-3">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      {balance.emergencyLeave} days
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Leave Requests
          </h3>
        </div>
        <Table columns={columns} data={filteredLeaves} />
      </div>

      {/* Request Leave Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Request Leave"
        size="md"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              {leaveTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter reason for leave..."
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowRequestModal(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setShowRequestModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
