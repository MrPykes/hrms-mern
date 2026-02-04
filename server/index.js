require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const payrollRoutes = require("./routes/payroll");
const financeRoutes = require("./routes/finance");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/api/ping", (req, res) => res.json({ message: "pong" }));

app.use("/api/auth", authRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/finance", financeRoutes);

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
    res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"))
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
