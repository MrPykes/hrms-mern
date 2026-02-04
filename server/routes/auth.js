const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing fields" });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "Email exists" });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash: hash,
    role: role || "Employee",
  });
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || "devsecret",
    { expiresIn: "7d" }
  );
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ message: "Invalid credentials" });
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || "devsecret",
    { expiresIn: "7d" }
  );
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

module.exports = router;
