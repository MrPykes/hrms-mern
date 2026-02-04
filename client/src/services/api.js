const API_BASE = "http://localhost:5000/api";

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

// Dashboard
export const dashboardApi = {
  getStats: () => apiCall("/dashboard/stats"),
};

// Employees
export const employeesApi = {
  getAll: () => apiCall("/employees"),
  getById: (id) => apiCall(`/employees/${id}`),
  create: (data) => apiCall("/employees", { method: "POST", body: data }),
  update: (id, data) =>
    apiCall(`/employees/${id}`, { method: "PUT", body: data }),
  delete: (id) => apiCall(`/employees/${id}`, { method: "DELETE" }),
};

// Attendance
export const attendanceApi = {
  getAll: () => apiCall("/attendance"),
  create: (data) => apiCall("/attendance", { method: "POST", body: data }),
  update: (id, data) =>
    apiCall(`/attendance/${id}`, { method: "PUT", body: data }),
  delete: (id) => apiCall(`/attendance/${id}`, { method: "DELETE" }),
};

// Leaves
export const leavesApi = {
  getAll: () => apiCall("/leaves"),
  getBalances: () => apiCall("/leaves/balances"),
  create: (data) => apiCall("/leaves", { method: "POST", body: data }),
  update: (id, data) => apiCall(`/leaves/${id}`, { method: "PUT", body: data }),
  updateStatus: (id, status) =>
    apiCall(`/leaves/${id}/status`, { method: "PATCH", body: { status } }),
  delete: (id) => apiCall(`/leaves/${id}`, { method: "DELETE" }),
};

// Expenses
export const expensesApi = {
  getAll: () => apiCall("/expenses"),
  getSummary: () => apiCall("/expenses/summary"),
  create: (data) => apiCall("/expenses", { method: "POST", body: data }),
  update: (id, data) =>
    apiCall(`/expenses/${id}`, { method: "PUT", body: data }),
  delete: (id) => apiCall(`/expenses/${id}`, { method: "DELETE" }),
};

// Income
export const incomeApi = {
  getAll: () => apiCall("/income"),
  getSummary: () => apiCall("/income/summary"),
  create: (data) => apiCall("/income", { method: "POST", body: data }),
  update: (id, data) => apiCall(`/income/${id}`, { method: "PUT", body: data }),
  delete: (id) => apiCall(`/income/${id}`, { method: "DELETE" }),
};

// Payroll
export const payrollApi = {
  getAll: () => apiCall("/payroll"),
  getSummary: () => apiCall("/payroll/summary"),
  create: (data) => apiCall("/payroll", { method: "POST", body: data }),
  update: (id, data) =>
    apiCall(`/payroll/${id}`, { method: "PUT", body: data }),
  markPaid: (id) => apiCall(`/payroll/${id}/pay`, { method: "PATCH" }),
  delete: (id) => apiCall(`/payroll/${id}`, { method: "DELETE" }),
};
