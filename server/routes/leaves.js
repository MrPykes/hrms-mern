const express = require("express");
const router = express.Router();
const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const Setting = require("../models/Setting");

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

    // Dynamic calculation per current year.
    // Policy: annual entitlements (per year) and prorate based on employment start within the year.
    // Load policy from settings if available
    const defaultPolicy = { annualVacation: 15, annualSick: 15, annualEmergency: 3 };
    const policySetting = await Setting.findOne({ key: 'leavePolicy' });
    const policy = policySetting ? policySetting.value : defaultPolicy;
    const ANNUAL_VACATION = policy.annualVacation ?? defaultPolicy.annualVacation;
    const ANNUAL_SICK = policy.annualSick ?? defaultPolicy.annualSick;
    const ANNUAL_EMERGENCY = policy.annualEmergency ?? defaultPolicy.annualEmergency;

    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    // fetch approved leaves for the current year only to compute used days in the year
    const approvedLeaves = await Leave.find({ status: "approved" });

    // helper to compute overlap days between two date ranges (inclusive)
    const daysOverlap = (aStart, aEnd, bStart, bEnd) => {
      const start = aStart > bStart ? aStart : bStart;
      const end = aEnd < bEnd ? aEnd : bEnd;
      if (end < start) return 0;
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return diff;
    };

    // aggregate used days per employee for current year
    const usedThisYear = {};
    approvedLeaves.forEach((leave) => {
      const empId = leave.employee.toString();
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      const overlapDays = daysOverlap(leaveStart, leaveEnd, yearStart, yearEnd);
      if (overlapDays <= 0) return; // no days this year
      if (!usedThisYear[empId]) usedThisYear[empId] = { vacation: 0, sick: 0, emergency: 0 };
      if (leave.type === "Vacation") usedThisYear[empId].vacation += overlapDays;
      if (leave.type === "Sick") usedThisYear[empId].sick += overlapDays;
      if (leave.type === "Unpaid") usedThisYear[empId].emergency += overlapDays;
    });

    const balances = employees.map((emp) => {
      const hire = emp.employment?.hireDate ? new Date(emp.employment.hireDate) : null;
      // determine start date for entitlement this year (either hire date or year start)
      const entitlementStart = hire && hire > yearStart ? hire : yearStart;
      // if hire is in future, no entitlement
      if (hire && hire > now) {
        return {
          employeeId: emp._id,
          employeeName: emp.user?.name || "Unknown",
          vacationLeave: 0,
          sickLeave: 0,
          emergencyLeave: 0,
        };
      }

      // months employed in current year (approx using days/30)
      const daysEmployedThisYear = Math.max(0, Math.ceil((now - entitlementStart) / (1000 * 60 * 60 * 24)) + 1);
      const monthsEmployedThisYear = Math.min(12, daysEmployedThisYear / 30);

      const entitlementVacation = (ANNUAL_VACATION * monthsEmployedThisYear) / 12;
      const entitlementSick = (ANNUAL_SICK * monthsEmployedThisYear) / 12;
      const entitlementEmergency = (ANNUAL_EMERGENCY * monthsEmployedThisYear) / 12;

      const used = usedThisYear[emp._id.toString()] || { vacation: 0, sick: 0, emergency: 0 };

      const availVacation = Math.max(0, Math.round((entitlementVacation - used.vacation) * 10) / 10);
      const availSick = Math.max(0, Math.round((entitlementSick - used.sick) * 10) / 10);
      const availEmergency = Math.max(0, Math.round((entitlementEmergency - used.emergency) * 10) / 10);

      return {
        employeeId: emp._id,
        employeeName: emp.user?.name || "Unknown",
        vacationLeave: availVacation,
        sickLeave: availSick,
        emergencyLeave: availEmergency,
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
