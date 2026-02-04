const express = require("express");
const router = express.Router();
const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");

// Get all payroll records
router.get("/", async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate({
        path: "employee",
        populate: { path: "user", select: "name" },
      })
      .sort({ createdAt: -1 });

    const formatted = payrolls.map((p) => {
      const deductions = p.deductions || {};
      const contributions = p.contributions || {};

      return {
        id: p._id,
        employeeId: p.employee?._id,
        employeeName: p.employee?.user?.name || "Unknown",
        period:
          p.periodStart && p.periodEnd
            ? `${new Date(p.periodStart).toLocaleDateString("en-US", { month: "long", day: "numeric" })}-${new Date(p.periodEnd).getDate()}, ${new Date(p.periodEnd).getFullYear()}`
            : "N/A",
        basicSalary: p.basic || 0,
        allowances: deductions.allowances || 0,
        overtime: p.overtime || 0,
        grossPay: p.grossPay || 0,
        sss: contributions.sss || 0,
        philhealth: contributions.philhealth || 0,
        pagibig: contributions.pagibig || 0,
        withholdingTax: contributions.tax || 0,
        totalDeductions:
          (contributions.sss || 0) +
          (contributions.philhealth || 0) +
          (contributions.pagibig || 0) +
          (contributions.tax || 0),
        netPay: p.netPay || 0,
        status: p.status === "paid" ? "Paid" : "Pending",
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching payroll:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get payroll summary
router.get("/summary", async (req, res) => {
  try {
    const payrolls = await Payroll.find();

    let totalNetPay = 0;
    let totalSSS = 0;
    let totalPhilHealth = 0;
    let totalPagibig = 0;

    payrolls.forEach((p) => {
      totalNetPay += p.netPay || 0;
      const contributions = p.contributions || {};
      totalSSS += contributions.sss || 0;
      totalPhilHealth += contributions.philhealth || 0;
      totalPagibig += contributions.pagibig || 0;
    });

    res.json({
      totalNetPay,
      totalSSS,
      totalPhilHealth,
      totalPagibig,
      count: payrolls.length,
    });
  } catch (error) {
    console.error("Error fetching payroll summary:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create payroll
router.post("/", async (req, res) => {
  try {
    const {
      employeeId,
      period,
      basicSalary,
      allowances,
      overtime,
      sss,
      philhealth,
      pagibig,
      withholdingTax,
    } = req.body;

    const employee = await Employee.findById(employeeId).populate(
      "user",
      "name",
    );
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const basic = parseFloat(basicSalary) || 0;
    const allow = parseFloat(allowances) || 0;
    const ot = parseFloat(overtime) || 0;
    const grossPay = basic + allow + ot;

    const sssAmt = parseFloat(sss) || 0;
    const philhealthAmt = parseFloat(philhealth) || 0;
    const pagibigAmt = parseFloat(pagibig) || 0;
    const taxAmt = parseFloat(withholdingTax) || 0;
    const totalDeductions = sssAmt + philhealthAmt + pagibigAmt + taxAmt;
    const netPay = grossPay - totalDeductions;

    // Parse period string to dates
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), 15);

    const payroll = new Payroll({
      employee: employeeId,
      periodStart,
      periodEnd,
      basic,
      overtime: ot,
      deductions: { allowances: allow },
      contributions: {
        sss: sssAmt,
        philhealth: philhealthAmt,
        pagibig: pagibigAmt,
        tax: taxAmt,
      },
      grossPay,
      netPay,
      status: "draft",
    });
    await payroll.save();

    res.status(201).json({
      id: payroll._id,
      employeeId: employee._id,
      employeeName: employee.user?.name || "Unknown",
      period,
      basicSalary: basic,
      allowances: allow,
      overtime: ot,
      grossPay,
      sss: sssAmt,
      philhealth: philhealthAmt,
      pagibig: pagibigAmt,
      withholdingTax: taxAmt,
      totalDeductions,
      netPay,
      status: "Pending",
    });
  } catch (error) {
    console.error("Error creating payroll:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update payroll
router.put("/:id", async (req, res) => {
  try {
    const {
      period,
      basicSalary,
      allowances,
      overtime,
      sss,
      philhealth,
      pagibig,
      withholdingTax,
    } = req.body;

    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    const basic = parseFloat(basicSalary) || 0;
    const allow = parseFloat(allowances) || 0;
    const ot = parseFloat(overtime) || 0;
    const grossPay = basic + allow + ot;

    const sssAmt = parseFloat(sss) || 0;
    const philhealthAmt = parseFloat(philhealth) || 0;
    const pagibigAmt = parseFloat(pagibig) || 0;
    const taxAmt = parseFloat(withholdingTax) || 0;
    const totalDeductions = sssAmt + philhealthAmt + pagibigAmt + taxAmt;
    const netPay = grossPay - totalDeductions;

    payroll.basic = basic;
    payroll.overtime = ot;
    payroll.deductions = { allowances: allow };
    payroll.contributions = {
      sss: sssAmt,
      philhealth: philhealthAmt,
      pagibig: pagibigAmt,
      tax: taxAmt,
    };
    payroll.grossPay = grossPay;
    payroll.netPay = netPay;
    await payroll.save();

    await payroll.populate({
      path: "employee",
      populate: { path: "user", select: "name" },
    });

    res.json({
      id: payroll._id,
      employeeId: payroll.employee._id,
      employeeName: payroll.employee.user?.name || "Unknown",
      period,
      basicSalary: basic,
      allowances: allow,
      overtime: ot,
      grossPay,
      sss: sssAmt,
      philhealth: philhealthAmt,
      pagibig: pagibigAmt,
      withholdingTax: taxAmt,
      totalDeductions,
      netPay,
      status: payroll.status === "paid" ? "Paid" : "Pending",
    });
  } catch (error) {
    console.error("Error updating payroll:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Mark payroll as paid
router.patch("/:id/pay", async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    payroll.status = "paid";
    await payroll.save();

    res.json({ message: "Payroll marked as paid", id: payroll._id });
  } catch (error) {
    console.error("Error updating payroll status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete payroll
router.delete("/:id", async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }
    res.json({ message: "Payroll deleted successfully" });
  } catch (error) {
    console.error("Error deleting payroll:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
