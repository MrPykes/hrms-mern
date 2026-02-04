import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { employeesApi } from "../../services/api";

export default function EmployeeProfile() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const data = await employeesApi.getById(id);
      setEmployee(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching employee:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800">
          {error || "Employee not found"}
        </h2>
        <Link
          to="/employees"
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          Back to Employees
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/employees"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Employee Profile
            </h1>
            <p className="text-gray-500">
              View and manage employee information
            </p>
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Link to="/employees" className="text-white">
            Back to List
          </Link>
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl">
            {employee.firstName?.[0]}
            {employee.lastName?.[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-gray-600">{employee.position}</p>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  employee.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {employee.status || "Active"}
              </span>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  employee.employmentType === "Regular" ||
                  employee.employmentType === "regular"
                    ? "bg-blue-100 text-blue-700"
                    : employee.employmentType === "Probationary" ||
                        employee.employmentType === "probationary"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-purple-100 text-purple-700"
                }`}
              >
                {employee.employmentType || "Regular"}
              </span>
              <span className="text-sm text-gray-500">
                <span className="font-medium">Department:</span>{" "}
                {employee.department}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Personal Information
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">First Name</label>
                <p className="font-medium text-gray-800">
                  {employee.firstName}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Last Name</label>
                <p className="font-medium text-gray-800">{employee.lastName}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email Address</label>
              <p className="font-medium text-gray-800">{employee.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Phone Number</label>
              <p className="font-medium text-gray-800">
                {employee.phone || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Address</label>
              <p className="font-medium text-gray-800">
                {employee.address || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Birth Date</label>
              <p className="font-medium text-gray-800">
                {employee.birthDate || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Job Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Job Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Position</label>
              <p className="font-medium text-gray-800">{employee.position}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Department</label>
              <p className="font-medium text-gray-800">{employee.department}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Employment Type</label>
              <p className="font-medium text-gray-800">
                {employee.employmentType}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Hire Date</label>
              <p className="font-medium text-gray-800">
                {employee.hireDate || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <p className="font-medium text-gray-800">
                {employee.status || "Active"}
              </p>
            </div>
          </div>
        </div>

        {/* Salary Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-600"
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
            Salary Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Basic Salary</label>
              <p className="font-medium text-gray-800 text-xl">
                {formatCurrency(employee.salary)}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Allowances</label>
              <p className="font-medium text-gray-800">
                {formatCurrency(employee.allowances)}
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <label className="text-sm text-gray-500">
                Total Monthly Compensation
              </label>
              <p className="font-bold text-gray-800 text-xl">
                {formatCurrency(
                  (employee.salary || 0) + (employee.allowances || 0),
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Government IDs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
              />
            </svg>
            Government IDs
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">SSS Number</label>
              <p className="font-medium text-gray-800 font-mono">
                {employee.sss || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">PhilHealth Number</label>
              <p className="font-medium text-gray-800 font-mono">
                {employee.philhealth || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Pag-IBIG Number</label>
              <p className="font-medium text-gray-800 font-mono">
                {employee.pagibig || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">TIN</label>
              <p className="font-medium text-gray-800 font-mono">
                {employee.tin || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
