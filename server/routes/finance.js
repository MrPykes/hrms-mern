const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const roles = require("../middlewares/roles");
const Expense = require("../models/Expense");
const Income = require("../models/Income");

router.use(auth);

router.post(
  "/expenses",
  roles(["Finance", "HR", "Admin"]),
  async (req, res) => {
    const doc = await Expense.create({ ...req.body, paidBy: req.user._id });
    res.json(doc);
  }
);

router.get("/expenses", roles(["Finance", "HR", "Admin"]), async (req, res) => {
  const q = req.query || {};
  const list = await Expense.find(q).sort({ date: -1 }).limit(200);
  res.json(list);
});

router.post(
  "/expenses/:id/approve",
  roles(["Finance", "Admin"]),
  async (req, res) => {
    const exp = await Expense.findById(req.params.id);
    if (!exp) return res.status(404).json({ message: "Not found" });
    exp.status = "approved";
    exp.approvedBy = req.user._id;
    await exp.save();
    res.json(exp);
  }
);

router.post("/income", roles(["Finance", "HR", "Admin"]), async (req, res) => {
  const doc = await Income.create({ ...req.body, receivedBy: req.user._id });
  res.json(doc);
});

router.get("/income", roles(["Finance", "HR", "Admin"]), async (req, res) => {
  const list = await Income.find(req.query || {})
    .sort({ date: -1 })
    .limit(200);
  res.json(list);
});

router.post(
  "/income/:id/approve",
  roles(["Finance", "Admin"]),
  async (req, res) => {
    const inc = await Income.findById(req.params.id);
    if (!inc) return res.status(404).json({ message: "Not found" });
    inc.status = "approved";
    inc.approvedBy = req.user._id;
    await inc.save();
    res.json(inc);
  }
);

module.exports = router;
