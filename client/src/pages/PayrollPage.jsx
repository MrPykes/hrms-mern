import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import Modal from "../components/Modal";
import { payrollApi, employeesApi } from "../services/api";

export default function Payroll() {
  const [payrollList, setPayrollList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: "",
    period: "",
    basicPay: "",
    overtime: "",
    deductions: "",
    status: "pending",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payrollData, employeeData] = await Promise.all([
        payrollApi.getAll(),
        employeesApi.getAll(),
      ]);
      setPayrollList(payrollData);
      setEmployees(employeeData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const resetForm = () => {
    setFormData({
      employeeId: "",
      period: "",
      basicPay: "",
      overtime: "",
      deductions: "",
      status: "pending",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPayroll = async () => {
    try {
      setSaving(true);
      const newPayroll = await payrollApi.create(formData);
      setPayrollList([newPayroll, ...payrollList]);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      alert("Error adding payroll: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (payroll) => {
    setSelectedPayroll(payroll);
    setFormData({
      employeeId: payroll.employeeId,
      period: payroll.period,
      basicPay: payroll.basicPay.toString(),
      overtime: payroll.overtime.toString(),
      deductions: payroll.deductions.toString(),
      status: payroll.status,
    });
    setShowEditModal(true);
  };

  const handleUpdatePayroll = async () => {
    try {
      setSaving(true);
      const updated = await payrollApi.update(selectedPayroll.id, formData);
      setPayrollList(
        payrollList.map((p) => (p.id === selectedPayroll.id ? updated : p)),
      );
      setShowEditModal(false);
      setSelectedPayroll(null);
      resetForm();
    } catch (err) {
      alert("Error updating payroll: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePayClick = (payroll) => {
    setSelectedPayroll(payroll);
    setShowPayModal(true);
  };

  const handleMarkPaid = async () => {
    try {
      setSaving(true);
      const updated = await payrollApi.markPaid(selectedPayroll.id);
      setPayrollList(
        payrollList.map((p) => (p.id === selectedPayroll.id ? updated : p)),
      );
      setShowPayModal(false);
      setSelectedPayroll(null);
    } catch (err) {
      alert("Error marking as paid: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (payroll) => {
    setSelectedPayroll(payroll);
    setShowDeleteModal(true);
  };

  const handleDeletePayroll = async () => {
    try {
      setSaving(true);
      await payrollApi.delete(selectedPayroll.id);
      setPayrollList(payrollList.filter((p) => p.id !== selectedPayroll.id));
      setShowDeleteModal(false);
      setSelectedPayroll(null);
    } catch (err) {
      alert("Error deleting payroll: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredPayroll = payrollList.filter((p) => {
    return !selectedStatus || p.status === selectedStatus;
  });

  const columns = [
    { header: "Employee", accessor: "employeeName" },
    { header: "Period", accessor: "period" },
    {
      header: "Basic Pay",
      accessor: "basicPay",
      render: (value) => formatCurrency(value),
    },
    {
      header: "Overtime",
      accessor: "overtime",
      render: (value) => (
        <span className="text-green-600">+{formatCurrency(value)}</span>
      ),
    },
    {
      header: "Deductions",
      accessor: "deductions",
      render: (value) => (
        <span className="text-red-600">-{formatCurrency(value)}</span>
      ),
    },
    {
      header: "Net Pay",
      accessor: "netPay",
      render: (value) => (
        <span className="font-bold text-blue-600">{formatCurrency(value)}</span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            value === "paid"
              ? "bg-green-100 text-green-700"
              : value === "processing"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700"
          }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "id",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.status === "pending" && (
            <button
              onClick={() => handlePayClick(row)}
              className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              Pay
            </button>
          )}
          <button
            onClick={() => handleEditClick(row)}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const totalPaid = payrollList
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.netPay, 0);
  const totalPending = payrollList
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.netPay, 0);
  const paidCount = payrollList.filter((p) => p.status === "paid").length;
  const pendingCount = payrollList.filter((p) => p.status === "pending").length;

  const PayrollForm = ({ onSubmit, submitText }) => (
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
              {emp.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Period
        </label>
        <input
          type="text"
          name="period"
          value={formData.period}
          onChange={handleInputChange}
          required
          placeholder="e.g., Feb 1-15, 2026"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Basic Pay (₱)
          </label>
          <input
            type="number"
            name="basicPay"
            value={formData.basicPay}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Overtime (₱)
          </label>
          <input
            type="number"
            name="overtime"
            value={formData.overtime}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deductions (₱)
          </label>
          <input
            type="number"
            name="deductions"
            value={formData.deductions}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="paid">Paid</option>
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => {
            setShowAddModal(false);
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
          <h1 className="text-2xl font-bold text-gray-800">
            Payroll Management
          </h1>
          <p className="text-gray-500 mt-1">
            Process and manage employee payroll
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
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
          Add Payroll
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPaid)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{paidCount} payrolls</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(totalPending)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {pendingCount} payrolls
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Records</p>
              <p className="text-2xl font-bold text-gray-800">
                {payrollList.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">This period</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Employees</p>
              <p className="text-2xl font-bold text-gray-800">
                {employees.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Active staff</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table columns={columns} data={filteredPayroll} />
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add Payroll"
        size="lg"
      >
        <PayrollForm onSubmit={handleAddPayroll} submitText="Add Payroll" />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Payroll"
        size="lg"
      >
        <PayrollForm
          onSubmit={handleUpdatePayroll}
          submitText="Update Payroll"
        />
      </Modal>

      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title="Mark as Paid"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Mark this payroll as{" "}
            <span className="font-semibold text-green-600">Paid</span>?
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Employee</p>
            <p className="font-medium">{selectedPayroll?.employeeName}</p>
            <p className="text-sm text-gray-500 mt-2">Net Pay</p>
            <p className="font-bold text-lg text-blue-600">
              {selectedPayroll && formatCurrency(selectedPayroll.netPay)}
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setShowPayModal(false)}
              disabled={saving}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleMarkPaid}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {saving ? "Processing..." : "Mark as Paid"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Payroll"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete payroll for{" "}
            <span className="font-semibold">
              {selectedPayroll?.employeeName}
            </span>
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
              onClick={handleDeletePayroll}
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
