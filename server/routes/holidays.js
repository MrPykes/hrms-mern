const express = require('express');
const router = express.Router();
const Holiday = require('../models/Holiday');

// Get all holidays
router.get('/', async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    const formatted = holidays.map((h) => ({
      id: h._id,
      name: h.name,
      date: h.date,
      type: h.type,
      manualOverride: !!h.manualOverride,
    }));
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching holidays:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create holiday
router.post('/', async (req, res) => {
  try {
    const { name, date, type, manualOverride } = req.body;
    const holiday = new Holiday({ name, date: new Date(date), type, manualOverride: !!manualOverride });
    await holiday.save();
    res.status(201).json({ id: holiday._id, name: holiday.name, date: holiday.date, type: holiday.type, manualOverride: holiday.manualOverride });
  } catch (err) {
    console.error('Error creating holiday:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete holiday
router.delete('/:id', async (req, res) => {
  try {
    const h = await Holiday.findByIdAndDelete(req.params.id);
    if (!h) return res.status(404).json({ message: 'Holiday not found' });
    res.json({ message: 'Holiday deleted' });
  } catch (err) {
    console.error('Error deleting holiday:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
