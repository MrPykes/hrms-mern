import React, { useState } from "react";
import Table from "../components/Table";
import Modal from "../components/Modal";
import { payroll } from "../data/mockData";

export default function Payroll() {
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
    { header: "Period", accessor: "period" },
    {
      header: "Basic Salary",
      accessor: "basicSalary",
      render: (value) => formatCurrency(value),
    },
    {
      header: "Allowances",
      accessor: "allowances",
      render: (value) => formatCurrency(value),
    },
    {
      header: "Deductions",
      accessor: "totalDeductions",
      render: (value) => (
        <span className="text-red-600">{formatCurrency(value)}</span>
      ),
    },
    {
      header: "Net Pay",
      accessor: "netPay",
      render: (value) => (
        <span className="font-bold text-green-600">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            value === "Paid"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
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
        <button
          onClick={() => {
            setSelectedPayroll(row);
            setShowPayslipModal(true);
          }}
          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          View Payslip
        </button>
      ),
    },
  ];

  const totalPayroll = payroll.reduce((sum, p) => sum + p.netPay, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payroll</h1>
          <p className="text-gray-500 mt-1">
            Manage employee payroll and payslips
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Generate Payroll
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Payroll</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(totalPayroll)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total SSS</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(payroll.reduce((sum, p) => sum + p.sss, 0))}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total PhilHealth</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(payroll.reduce((sum, p) => sum + p.philhealth, 0))}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Pag-IBIG</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(payroll.reduce((sum, p) => sum + p.pagibig, 0))}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table columns={columns} data={payroll} />
      </div>

      {/* Payslip Modal */}
      <Modal
        isOpen={showPayslipModal}
        onClose={() => setShowPayslipModal(false)}
        title="Payslip"
        size="lg"
      >
        {selectedPayroll && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center border-b border-gray-200 pb-4">
              <h2 className="text-xl font-bold text-gray-800">
                TechSolutions Philippines Inc.
              </h2>
              <p className="text-sm text-gray-500">
                Unit 1205, Tower 1, Ayala North Exchange, Makati City
              </p>
              <p className="text-lg font-semibold text-blue-600 mt-2">
                PAYSLIP
              </p>
              <p className="text-sm text-gray-500">{selectedPayroll.period}</p>
            </div>

            {/* Employee Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-xs text-gray-500">Employee Name</label>
                <p className="font-semibold text-gray-800">
                  {selectedPayroll.employeeName}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Pay Period</label>
                <p className="font-semibold text-gray-800">
                  {selectedPayroll.period}
                </p>
              </div>
            </div>

            {/* Earnings */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Earnings</h4>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Basic Salary</span>
                  <span className="font-medium">
                    {formatCurrency(selectedPayroll.basicSalary)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Allowances</span>
                  <span className="font-medium">
                    {formatCurrency(selectedPayroll.allowances)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Overtime</span>
                  <span className="font-medium">
                    {formatCurrency(selectedPayroll.overtime)}
                  </span>
                </div>
                <div className="flex justify-between py-2 bg-gray-50 px-2 rounded">
                  <span className="font-semibold text-gray-800">Gross Pay</span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(selectedPayroll.grossPay)}
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Deductions</h4>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">SSS</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(selectedPayroll.sss)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">PhilHealth</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(selectedPayroll.philhealth)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Pag-IBIG</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(selectedPayroll.pagibig)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Withholding Tax</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(selectedPayroll.withholdingTax)}
                  </span>
                </div>
                <div className="flex justify-between py-2 bg-red-50 px-2 rounded">
                  <span className="font-semibold text-gray-800">
                    Total Deductions
                  </span>
                  <span className="font-bold text-red-600">
                    -{formatCurrency(selectedPayroll.totalDeductions)}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Pay */}
            <div className="flex justify-between py-4 bg-green-50 px-4 rounded-lg">
              <span className="text-lg font-bold text-gray-800">Net Pay</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(selectedPayroll.netPay)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setShowPayslipModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Download PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
