const express = require("express");
const router = express.Router();
const Leave = require("../models/Leave");
const Employee = require("../models/Employee");

// Get all leave requests
router.get("/", async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate({
        path: "employee",
        populate: { path: "user", select: "name" },
      })
      .sort({ createdAt: -1 });

    const formatted = leaves.map((leave) => ({
      id: leave._id,
      employeeId: leave.employee?._id,
      employeeName: leave.employee?.user?.name || "Unknown",
      leaveType:
        leave.type === "Vacation"
          ? "Vacation Leave"
          : leave.type === "Sick"
            ? "Sick Leave"
            : leave.type === "Unpaid"
              ? "Emergency Leave"
              : leave.type,
      startDate: new Date(leave.startDate).toLocaleDateString("en-US"),
      endDate: new Date(leave.endDate).toLocaleDateString("en-US"),
      days: leave.days,
      reason: leave.reason,
      status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching leaves:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get leave balances for all employees
router.get("/balances", async (req, res) => {
  try {
    const employees = await Employee.find({
      "employment.status": "active",
    }).populate("user", "name");

    // Calculate used leaves per employee
    const leaves = await Leave.find({ status: "approved" });
    const usedLeaves = {};

    leaves.forEach((leave) => {
      const empId = leave.employee.toString();
      if (!usedLeaves[empId]) {
        usedLeaves[empId] = { vacation: 0, sick: 0, emergency: 0 };
      }
      if (leave.type === "Vacation") usedLeaves[empId].vacation += leave.days;
      if (leave.type === "Sick") usedLeaves[empId].sick += leave.days;
      if (leave.type === "Unpaid") usedLeaves[empId].emergency += leave.days;
    });

    const balances = employees.map((emp) => {
      const used = usedLeaves[emp._id.toString()] || {
        vacation: 0,
        sick: 0,
        emergency: 0,
      };
      return {
        employeeId: emp._id,
        employeeName: emp.user?.name || "Unknown",
        vacationLeave: Math.max(0, 15 - used.vacation),
        sickLeave: Math.max(0, 15 - used.sick),
        emergencyLeave: Math.max(0, 3 - used.emergency),
      };
    });

    res.json(balances);
  } catch (error) {
    console.error("Error fetching leave balances:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create leave request
router.post("/", async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    const employee = await Employee.findById(employeeId).populate(
      "user",
      "name",
    );
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const type =
      leaveType === "Vacation Leave"
        ? "Vacation"
        : leaveType === "Sick Leave"
          ? "Sick"
          : leaveType === "Emergency Leave"
            ? "Unpaid"
            : "Custom";

    const leave = new Leave({
      employee: employeeId,
      type,
      startDate: start,
      endDate: end,
      days,
      reason,
      status: "pending",
    });
    await leave.save();

    res.status(201).json({
      id: leave._id,
      employeeId: employee._id,
      employeeName: employee.user?.name || "Unknown",
      leaveType,
      startDate: start.toLocaleDateString("en-US"),
      endDate: end.toLocaleDateString("en-US"),
      days,
      reason,
      status: "Pending",
    });
  } catch (error) {
    console.error("Error creating leave:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update leave request
router.put("/:id", async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason, status } =
      req.body;

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const type =
      leaveType === "Vacation Leave"
        ? "Vacation"
        : leaveType === "Sick Leave"
          ? "Sick"
          : leaveType === "Emergency Leave"
            ? "Unpaid"
            : "Custom";

    leave.employee = employeeId;
    leave.type = type;
    leave.startDate = start;
    leave.endDate = end;
    leave.days = days;
    leave.reason = reason;
    if (status) {
      leave.status = status.toLowerCase();
    }
    await leave.save();

    await leave.populate({
      path: "employee",
      populate: { path: "user", select: "name" },
    });

    res.json({
      id: leave._id,
      employeeId: leave.employee._id,
      employeeName: leave.employee.user?.name || "Unknown",
      leaveType,
      startDate: start.toLocaleDateString("en-US"),
      endDate: end.toLocaleDateString("en-US"),
      days,
      reason,
      status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1),
    });
  } catch (error) {
    console.error("Error updating leave:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Approve/Reject leave
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    leave.status = status.toLowerCase();
    await leave.save();

    await leave.populate({
      path: "employee",
      populate: { path: "user", select: "name" },
    });

    res.json({
      id: leave._id,
      employeeId: leave.employee._id,
      employeeName: leave.employee.user?.name || "Unknown",
      leaveType:
        leave.type === "Vacation"
          ? "Vacation Leave"
          : leave.type === "Sick"
            ? "Sick Leave"
            : leave.type === "Unpaid"
              ? "Emergency Leave"
              : leave.type,
      startDate: new Date(leave.startDate).toLocaleDateString("en-US"),
      endDate: new Date(leave.endDate).toLocaleDateString("en-US"),
      days: leave.days,
      reason: leave.reason,
      status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1),
    });
  } catch (error) {
    console.error("Error updating leave status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete leave request
router.delete("/:id", async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    res.json({ message: "Leave request deleted successfully" });
  } catch (error) {
    console.error("Error deleting leave:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
