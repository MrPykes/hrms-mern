const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");

// Get all expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });

    const formatted = expenses.map((expense) => ({
      id: expense._id,
      date: new Date(expense.date).toLocaleDateString("en-US"),
      category: expense.category || "Other",
      description: expense.description || "",
      amount: expense.amount,
      paidBy: expense.status === "paid" ? "Bank Transfer" : "Petty Cash",
      status: expense.status,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get expense summary
router.get("/summary", async (req, res) => {
  try {
    const expenses = await Expense.find();

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = {};

    expenses.forEach((e) => {
      const cat = e.category || "Other";
      byCategory[cat] = (byCategory[cat] || 0) + e.amount;
    });

    res.json({
      total,
      byCategory,
      count: expenses.length,
    });
  } catch (error) {
    console.error("Error fetching expense summary:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create expense
router.post("/", async (req, res) => {
  try {
    const { date, category, description, amount, paidBy } = req.body;

    const expense = new Expense({
      date: new Date(date),
      category,
      description,
      amount: parseFloat(amount),
      status: paidBy === "Bank Transfer" ? "paid" : "pending",
    });
    await expense.save();

    res.status(201).json({
      id: expense._id,
      date: new Date(expense.date).toLocaleDateString("en-US"),
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      paidBy,
      status: expense.status,
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update expense
router.put("/:id", async (req, res) => {
  try {
    const { date, category, description, amount, paidBy } = req.body;

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    expense.date = new Date(date);
    expense.category = category;
    expense.description = description;
    expense.amount = parseFloat(amount);
    expense.status = paidBy === "Bank Transfer" ? "paid" : "pending";
    await expense.save();

    res.json({
      id: expense._id,
      date: new Date(expense.date).toLocaleDateString("en-US"),
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      paidBy,
      status: expense.status,
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete expense
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
