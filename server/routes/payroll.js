const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const roles = require("../middlewares/roles");
const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");
const { computePayrollForEmployee } = require("../utils/payroll");
const { generatePayslipPDF } = require("../utils/pdf");

router.use(auth);

router.post(
  "/generate/:employeeId",
  roles(["HR", "Admin"]),
  async (req, res) => {
    const emp = await Employee.findById(req.params.employeeId).populate("user");
    if (!emp) return res.status(404).json({ message: "Employee not found" });
    const { periodStart, periodEnd } = req.body;
    const result = await computePayrollForEmployee(
      emp,
      new Date(periodStart),
      new Date(periodEnd)
    );
    const payroll = await Payroll.create({
      employee: emp._id,
      periodStart,
      periodEnd,
      ...result,
      status: "draft",
    });
    res.json(payroll);
  }
);

router.get(
  "/:id/payslip",
  roles(["HR", "Admin", "Employee"]),
  async (req, res) => {
    const p = await Payroll.findById(req.params.id).populate("employee");
    if (!p) return res.status(404).json({});
    const buffer = await generatePayslipPDF(p);
    res.setHeader("Content-Type", "application/pdf");
    res.send(buffer);
  }
);

module.exports = router;
