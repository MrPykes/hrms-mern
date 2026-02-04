const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB for seeding");

  // Use the test Admin user created earlier
  const userId = "698227c85804634b6bc47579";

  let emp = await Employee.findOne({ user: userId });
  if (!emp) {
    emp = await Employee.create({
      user: userId,
      personal: { address: "Test Address" },
      employment: {
        type: "regular",
        hireDate: new Date("2025-01-01"),
        status: "active",
      },
      statutory: {
        sss: "000-0000000-0",
        philhealth: "00-000000000-0",
        pagibig: "0000000000",
        tin: "000-000-000",
      },
      salary: { payType: "monthly", basic: 20000 },
    });
    console.log("Created employee", emp._id.toString());
  } else {
    emp.salary = { payType: "monthly", basic: 20000 };
    emp.employment.status = "active";
    await emp.save();
    console.log("Found existing employee", emp._id.toString());
  }

  // Create attendance entries for period 2026-01-16 to 2026-01-31 (bi-weekly)
  const start = new Date("2026-01-16");
  const end = new Date("2026-01-31");
  const days = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    // skip Sundays (weekend)
    const day = new Date(d);
    if (day.getDay() === 0) continue;
    days.push(new Date(day));
  }

  for (const day of days) {
    const dateOnly = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const existing = await Attendance.findOne({
      employee: emp._id,
      date: dateOnly,
    });
    if (existing) continue;
    // create sample clockIn 9:05 (late 5 mins), clockOut 18:00, overtime for some days
    const clockIn = new Date(dateOnly);
    clockIn.setHours(9, 5);
    const clockOut = new Date(dateOnly);
    clockOut.setHours(18, 0);
    const overtimeMinutes = Math.random() > 0.7 ? 60 : 0;
    const overtimeApproved = overtimeMinutes > 0;
    const lateMinutes = 5;
    await Attendance.create({
      employee: emp._id,
      date: dateOnly,
      clockIn,
      clockOut,
      lateMinutes,
      overtimeMinutes,
      overtimeApproved,
    });
  }
  console.log("Attendance seeded for period");

  await mongoose.disconnect();
  console.log("Seeding complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
