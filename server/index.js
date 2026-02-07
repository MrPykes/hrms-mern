require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const payrollRoutes = require("./routes/payroll");
const financeRoutes = require("./routes/finance");
const employeesRoutes = require("./routes/employees");
const attendanceRoutes = require("./routes/attendance");
const leavesRoutes = require("./routes/leaves");
const expensesRoutes = require("./routes/expenses");
const incomeRoutes = require("./routes/income");
const settingsRoutes = require("./routes/settings");
const holidaysRoutes = require("./routes/holidays");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/api/ping", (req, res) => res.json({ message: "pong" }));

app.use("/api/auth", authRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leavesRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/holidays", holidaysRoutes);

// Dashboard stats endpoint
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const Employee = require("./models/Employee");
    const Attendance = require("./models/Attendance");
    const Leave = require("./models/Leave");
    const Expense = require("./models/Expense");
    const Income = require("./models/Income");
    const Payroll = require("./models/Payroll");

    const totalEmployees = await Employee.countDocuments({
      "employment.status": "active",
    });
    const totalAttendance = await Attendance.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: "pending" });
    const totalExpenses = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalIncome = await Income.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalPayroll = await Payroll.aggregate([
      { $group: { _id: null, total: { $sum: "$netPay" } } },
    ]);

    res.json({
      totalEmployees,
      totalAttendance,
      pendingLeaves,
      totalExpenses: totalExpenses[0]?.total || 0,
      totalIncome: totalIncome[0]?.total || 0,
      totalPayroll: totalPayroll[0]?.total || 0,
      netProfit: (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0),
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Internal helper for testing: return any employee id
app.get("/__internal/find-employee", async (req, res) => {
  try {
    const Employee = require("./models/Employee");
    const emp = await Employee.findOne();
    if (!emp) return res.status(404).json({ message: "no employee" });
    return res.json({ employeeId: emp._id });
  } catch (e) {
    return res.status(500).json({ message: "error" });
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "client", "dist")));
  app.get("*", (req, res) =>
    res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html")),
  );
}

if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
} else {
  console.warn("No MONGO_URI provided — running with local DB disabled");
}

require("./cron/payrollCron");

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
