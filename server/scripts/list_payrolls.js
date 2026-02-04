const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Payroll = require("../models/Payroll");
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const p = await Payroll.find().sort({ createdAt: -1 }).limit(10).lean();
  console.log(p);
  await mongoose.disconnect();
})();
