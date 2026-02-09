const express = require("express");
const router = express.Router();
const Setting = require("../models/Setting");

// Get all settings
router.get("/", async (req, res) => {
  try {
    const settings = await Setting.find();
    const formatted = settings.reduce(
      (acc, s) => ({ ...acc, [s.key]: s.value }),
      {},
    );
    res.json(formatted);
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get leave policy specifically
router.get("/leave", async (req, res) => {
  try {
    const s = await Setting.findOne({ key: "leavePolicy" });
    res.json(s ? s.value : null);
  } catch (err) {
    console.error("Error fetching leave policy:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update leave policy
router.put("/leave", async (req, res) => {
  try {
    const { annualVacation, annualSick, annualEmergency } = req.body;
    const policy = { annualVacation, annualSick, annualEmergency };
    const updated = await Setting.findOneAndUpdate(
      { key: "leavePolicy" },
      { value: policy },
      { upsert: true, new: true },
    );
    res.json(updated.value);
  } catch (err) {
    console.error("Error updating leave policy:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
