const express = require("express");
const router = express.Router();
const Income = require("../models/Income");

// Get all income records
router.get("/", async (req, res) => {
  try {
    const incomes = await Income.find().sort({ date: -1 });

    const formatted = incomes.map((income) => ({
      id: income._id,
      date: new Date(income.date).toLocaleDateString("en-US"),
      source: income.source || "Other",
      description: income.description || "",
      amount: income.amount,
      status: income.status,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching income:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get income summary
router.get("/summary", async (req, res) => {
  try {
    const incomes = await Income.find();

    const total = incomes.reduce((sum, i) => sum + i.amount, 0);
    const bySource = {};

    incomes.forEach((i) => {
      const source = i.source || "Other";
      bySource[source] = (bySource[source] || 0) + i.amount;
    });

    res.json({
      total,
      bySource,
      count: incomes.length,
    });
  } catch (error) {
    console.error("Error fetching income summary:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create income
router.post("/", async (req, res) => {
  try {
    const { date, source, description, amount, clientName, dateFrom, dateTo, account, status } = req.body;

    const income = new Income({
      date: date ? new Date(date) : undefined,
      source,
      description,
      amount: parseFloat(amount),
      clientName,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      account,
      status,
    });
    await income.save();

    res.status(201).json({
      id: income._id,
      date: new Date(income.date).toLocaleDateString("en-US"),
      source: income.source,
      description: income.description,
      amount: income.amount,
      clientName: income.clientName,
      dateFrom: income.dateFrom,
      dateTo: income.dateTo,
      account: income.account,
      status: income.status,
    });
  } catch (error) {
    console.error("Error creating income:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update income
router.put("/:id", async (req, res) => {
  try {
    const { date, source, description, amount, clientName, dateFrom, dateTo, account, status } = req.body;

    const income = await Income.findById(req.params.id);
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    income.date = date ? new Date(date) : income.date;
    income.source = source;
    income.description = description;
    income.amount = parseFloat(amount);
    income.clientName = clientName;
    income.dateFrom = dateFrom ? new Date(dateFrom) : undefined;
    income.dateTo = dateTo ? new Date(dateTo) : undefined;
    income.account = account;
    income.status = status;
    await income.save();

    res.json({
      id: income._id,
      date: new Date(income.date).toLocaleDateString("en-US"),
      source: income.source,
      description: income.description,
      amount: income.amount,
      clientName: income.clientName,
      dateFrom: income.dateFrom,
      dateTo: income.dateTo,
      account: income.account,
      status: income.status,
    });
  } catch (error) {
    console.error("Error updating income:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete income
router.delete("/:id", async (req, res) => {
  try {
    const income = await Income.findByIdAndDelete(req.params.id);
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }
    res.json({ message: "Income deleted successfully" });
  } catch (error) {
    console.error("Error deleting income:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
