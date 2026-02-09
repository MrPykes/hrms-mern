import React, { useState, useEffect } from "react";
import { companyInfo } from "../data/mockData";
import { settingsApi, holidaysApi } from "../services/api";
import { useToast } from "../components/Toast";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("company");

  const tabs = [
    { id: "company", name: "Company Information" },
    { id: "payroll", name: "Payroll Settings" },
    { id: "users", name: "User Management" },
    { id: "leaves", name: "Leave Balances" },
    { id: "holidays", name: "Holidays" },
  ];

  const { addToast } = useToast();
  const [leavePolicy, setLeavePolicy] = useState({
    annualVacation: 15,
    annualSick: 15,
    annualEmergency: 3,
  });

  useEffect(() => {
    (async () => {
      try {
        const policy = await settingsApi.getLeavePolicy();
        if (policy) setLeavePolicy(policy);
      } catch (err) {
        // ignore — keep defaults
      }
    })();
  }, []);

  // Holidays manager
  const [holidays, setHolidays] = useState([]);
  const [holidayForm, setHolidayForm] = useState({
    name: "",
    date: "",
    type: "regular",
    manualOverride: false,
  });
  const [loadingHolidays, setLoadingHolidays] = useState(false);

  const fetchHolidays = async () => {
    try {
      setLoadingHolidays(true);
      const data = await holidaysApi.getAll();
      setHolidays(data);
    } catch (err) {
      console.error("Error loading holidays:", err);
    } finally {
      setLoadingHolidays(false);
    }
  };

  useEffect(() => {
    if (activeTab === "holidays") fetchHolidays();
  }, [activeTab]);

  const createHoliday = async () => {
    try {
      await holidaysApi.create(holidayForm);
      setHolidayForm({
        name: "",
        date: "",
        type: "regular",
        manualOverride: false,
      });
      addToast("Holiday created", "success");
      fetchHolidays();
    } catch (err) {
      addToast("Error creating holiday: " + err.message, "error");
    }
  };

  const deleteHoliday = async (id) => {
    if (!confirm("Delete this holiday?")) return;
    try {
      await holidaysApi.delete(id);
      addToast("Holiday deleted", "success");
      fetchHolidays();
    } catch (err) {
      addToast("Error deleting holiday: " + err.message, "error");
    }
  };

  const users = [
    {
      id: 1,
      name: "Admin User",
      email: "admin@techsolutions.ph",
      role: "Admin",
      status: "Active",
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria.santos@company.com",
      role: "HR Manager",
      status: "Active",
    },
    {
      id: 3,
      name: "Pedro Reyes",
      email: "pedro.reyes@company.com",
      role: "Employee",
      status: "Active",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage system configuration and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Company Information Tab */}
          {activeTab === "company" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      defaultValue={companyInfo.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      TIN
                    </label>
                    <input
                      type="text"
                      defaultValue={companyInfo.tin}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      defaultValue={companyInfo.address}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      defaultValue={companyInfo.phone}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={companyInfo.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="text"
                      defaultValue={companyInfo.website}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Payroll Settings Tab */}
          {activeTab === "payroll" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Payroll Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pay Frequency
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="semi-monthly">
                        Semi-Monthly (15th & 30th)
                      </option>
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Bi-Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Overtime Rate Multiplier
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="1.25">1.25x (Standard)</option>
                      <option value="1.3">1.30x</option>
                      <option value="1.5">1.50x</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Government Contributions
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">
                        SSS (Social Security System)
                      </p>
                      <p className="text-sm text-gray-500">
                        Employee and employer contributions
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">PhilHealth</p>
                      <p className="text-sm text-gray-500">
                        National health insurance contribution
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Pag-IBIG Fund</p>
                      <p className="text-sm text-gray-500">
                        Home development mutual fund
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">
                        Withholding Tax
                      </p>
                      <p className="text-sm text-gray-500">
                        BIR withholding tax computation
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Leave Balances Tab */}
          {activeTab === "leaves" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Leave Balances Policy
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Vacation Days
                    </label>
                    <input
                      type="number"
                      value={leavePolicy.annualVacation}
                      onChange={(e) =>
                        setLeavePolicy((p) => ({
                          ...p,
                          annualVacation: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Sick Days
                    </label>
                    <input
                      type="number"
                      value={leavePolicy.annualSick}
                      onChange={(e) =>
                        setLeavePolicy((p) => ({
                          ...p,
                          annualSick: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Emergency Days
                    </label>
                    <input
                      type="number"
                      value={leavePolicy.annualEmergency}
                      onChange={(e) =>
                        setLeavePolicy((p) => ({
                          ...p,
                          annualEmergency: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    try {
                      await settingsApi.updateLeavePolicy(leavePolicy);
                      addToast("Leave policy saved", "success");
                    } catch (err) {
                      addToast(
                        "Error saving leave policy: " + err.message,
                        "error",
                      );
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Leave Policy
                </button>
              </div>
            </div>
          )}

          {/* Holidays Tab */}
          {activeTab === "holidays" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Holidays
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={holidayForm.name}
                      onChange={(e) =>
                        setHolidayForm((h) => ({ ...h, name: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={holidayForm.date}
                      onChange={(e) =>
                        setHolidayForm((h) => ({ ...h, date: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={holidayForm.type}
                      onChange={(e) =>
                        setHolidayForm((h) => ({ ...h, type: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="regular">Regular</option>
                      <option value="special">Special</option>
                      <option value="local">Local</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={holidayForm.manualOverride}
                      onChange={(e) =>
                        setHolidayForm((h) => ({
                          ...h,
                          manualOverride: e.target.checked,
                        }))
                      }
                      className="mr-2"
                    />
                    Manual Override
                  </label>
                  <div className="flex-1" />
                  <button
                    onClick={createHoliday}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Create Holiday
                  </button>
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-2">
                    Existing Holidays
                  </h4>
                  {loadingHolidays ? (
                    <div>Loading...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 text-sm font-medium text-gray-500">
                              Name
                            </th>
                            <th className="text-left py-2 text-sm font-medium text-gray-500">
                              Date
                            </th>
                            <th className="text-left py-2 text-sm font-medium text-gray-500">
                              Type
                            </th>
                            <th className="text-right py-2 text-sm font-medium text-gray-500">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {holidays.map((h) => (
                            <tr key={h.id} className="border-b border-gray-100">
                              <td className="py-3">{h.name}</td>
                              <td className="py-3">
                                {new Date(h.date).toLocaleDateString()}
                              </td>
                              <td className="py-3">{h.type}</td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => deleteHoliday(h.id)}
                                  className="px-3 py-1 bg-red-600 text-white rounded-lg"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* User Management Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  User Management
                </h3>
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                {user.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.role === "Admin"
                                ? "bg-purple-100 text-purple-700"
                                : user.role === "HR Manager"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              Edit
                            </button>
                            <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
