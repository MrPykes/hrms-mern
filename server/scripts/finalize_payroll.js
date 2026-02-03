require("dotenv").config();
const mongoose = require("mongoose");
const Payroll = require("../models/Payroll");

const mongoUri =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.DATABASE_URL ||
  process.env.MONGO_URL;
if (!mongoUri) {
  console.error(
    "No MongoDB URI found in environment (MONGODB_URI/MONGO_URI/DATABASE_URL/MONGO_URL)"
  );
  process.exit(1);
}

async function main() {
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const payrollId = process.argv[2] || "69822ebd266519c27713134c";
  const payslipPath =
    process.argv[3] || "tmp/payslip_69822ebd266519c27713134c.pdf";

  const updated = await Payroll.findByIdAndUpdate(
    payrollId,
    { status: "finalized", payslipPath },
    { new: true }
  ).lean();

  if (!updated) {
    console.error("Payroll not found:", payrollId);
    process.exit(2);
  }

  console.log("Payroll updated:");
  console.log(JSON.stringify(updated, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
