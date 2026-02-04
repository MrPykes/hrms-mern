import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import Modal from "../components/Modal";
import { leavesApi, employeesApi } from "../services/api";
import { leaveTypes } from "../data/mockData";

export default function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    leaveType: "Vacation Leave",
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leavesData, balancesData, employeesData] = await Promise.all([
        leavesApi.getAll(),
        leavesApi.getBalances(),
        employeesApi.getAll(),
      ]);
      setLeaves(leavesData);
      setLeaveBalances(balancesData);
      setEmployees(employeesData.filter((e) => e.status === "Active"));
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const [month, day, year] = dateStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const resetForm = () => {
    setFormData({
      employeeId: "",
      employeeName: "",
      leaveType: "Vacation Leave",
      startDate: "",
      endDate: "",
      reason: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "employeeId") {
      const emp = employees.find((e) => e.id === value);
      setFormData((prev) => ({
        ...prev,
        employeeId: value,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddLeave = async () => {
    try {
      setSaving(true);
      const newLeave = await leavesApi.create(formData);
      setLeaves([newLeave, ...leaves]);
      setShowRequestModal(false);
      resetForm();
    } catch (err) {
      alert("Error requesting leave: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (leave) => {
    try {
      const updated = await leavesApi.updateStatus(leave.id, "Approved");
      setLeaves(leaves.map((l) => (l.id === leave.id ? updated : l)));
    } catch (err) {
      alert("Error approving leave: " + err.message);
    }
  };

  const handleReject = async (leave) => {
    try {
      const updated = await leavesApi.updateStatus(leave.id, "Rejected");
      setLeaves(leaves.map((l) => (l.id === leave.id ? updated : l)));
    } catch (err) {
      alert("Error rejecting leave: " + err.message);
    }
  };

  const handleEditClick = (leave) => {
    setSelectedLeave(leave);
    setFormData({
      employeeId: leave.employeeId,
      employeeName: leave.employeeName,
      leaveType: leave.leaveType,
      startDate: formatDateForInput(leave.startDate),
      endDate: formatDateForInput(leave.endDate),
      reason: leave.reason,
    });
    setShowEditModal(true);
  };

  const handleUpdateLeave = async () => {
    try {
      setSaving(true);
      const updated = await leavesApi.update(selectedLeave.id, formData);
      setLeaves(leaves.map((l) => (l.id === selectedLeave.id ? updated : l)));
      setShowEditModal(false);
      setSelectedLeave(null);
      resetForm();
    } catch (err) {
      alert("Error updating leave: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (leave) => {
    setSelectedLeave(leave);
    setShowDeleteModal(true);
  };

  const handleDeleteLeave = async () => {
    try {
      setSaving(true);
      await leavesApi.delete(selectedLeave.id);
      setLeaves(leaves.filter((l) => l.id !== selectedLeave.id));
      setShowDeleteModal(false);
      setSelectedLeave(null);
    } catch (err) {
      alert("Error deleting leave: " + err.message);
    } finally {
      setSaving(false);
    }
  };

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
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.status === "Pending" && (
            <>
              <button
                onClick={() => handleApprove(row)}
                className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(row)}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Reject
              </button>
            </>
          )}
          <button
            onClick={() => handleEditClick(row)}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const LeaveForm = ({ onSubmit, submitText }) => (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Employee
        </label>
        <select
          name="employeeId"
          value={formData.employeeId}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Leave Type
        </label>
        <select
          name="leaveType"
          value={formData.leaveType}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
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
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason
        </label>
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleInputChange}
          required
          rows={3}
          placeholder="Enter reason for leave..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => {
            setShowRequestModal(false);
            setShowEditModal(false);
            resetForm();
          }}
          disabled={saving}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {saving ? "Saving..." : submitText}
        </button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
          <p className="text-gray-500 mt-1">Manage employee leave requests</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowRequestModal(true);
          }}
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

      {leaveBalances.length > 0 && (
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
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Leave Requests
          </h3>
        </div>
        <Table columns={columns} data={filteredLeaves} />
      </div>

      <Modal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false);
          resetForm();
        }}
        title="Request Leave"
        size="md"
      >
        <LeaveForm onSubmit={handleAddLeave} submitText="Submit Request" />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Leave Request"
        size="md"
      >
        <LeaveForm onSubmit={handleUpdateLeave} submitText="Update Request" />
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Leave Request"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this leave request for{" "}
            <span className="font-semibold">{selectedLeave?.employeeName}</span>
            ?
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={saving}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteLeave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {saving && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {saving ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
