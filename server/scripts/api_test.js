require("dotenv").config();
const fs = require("fs");
const fetch = global.fetch || require("node-fetch");

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ODIyN2M4NTgwNDYzNGI2YmM0NzU3OSIsImlhdCI6MTc3MDEzNzU0NCwiZXhwIjoxNzcwNzQyMzQ0fQ.nb-fbKxji4jWPkEfZ9RM5ChvnblBcHvLTjcoI5ymawQ";
const base = "http://127.0.0.1:5000";

async function approveExpense(id) {
  const res = await fetch(`${base}/api/finance/expenses/${id}/approve`, {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
  });
  return res.text();
}
async function approveIncome(id) {
  const res = await fetch(`${base}/api/finance/income/${id}/approve`, {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
  });
  return res.text();
}

async function generatePayroll(employeeId, start, end) {
  const res = await fetch(`${base}/api/payroll/generate/${employeeId}`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ periodStart: start, periodEnd: end }),
  });
  return res.json();
}

async function downloadPayslip(payrollId) {
  const res = await fetch(`${base}/api/payroll/${payrollId}/payslip`, {
    headers: { Authorization: "Bearer " + token },
  });
  if (res.status !== 200) {
    throw new Error("Payslip fetch failed: " + res.status);
  }
  const buffer = await res.arrayBuffer();
  const buf = Buffer.from(buffer);
  const out = `../tmp/payslip_${payrollId}.pdf`;
  fs.mkdirSync("../tmp", { recursive: true });
  fs.writeFileSync(out, buf);
  return out;
}

async function main() {
  console.log("Listing expenses and incomes");
  const expList = await (
    await fetch(base + "/api/finance/expenses", {
      headers: { Authorization: "Bearer " + token },
    })
  ).json();
  const incList = await (
    await fetch(base + "/api/finance/income", {
      headers: { Authorization: "Bearer " + token },
    })
  ).json();
  console.log("Expenses:", expList);
  console.log("Incomes:", incList);
  if (expList.length) {
    console.log("Approving first expense", expList[0]._id);
    console.log(await approveExpense(expList[0]._id));
  }
  if (incList.length) {
    console.log("Approving first income", incList[0]._id);
    console.log(await approveIncome(incList[0]._id));
  }

  // Find an employee to generate payroll for
  const emps = await (
    await fetch(base + "/api/finance/expenses", {
      headers: { Authorization: "Bearer " + token },
    })
  ).json();
  // We'll instead query Payroll via DB later; but generate payroll for the user-created employee by calling server script to find employee id
  console.log("Requesting server to find employee id...");
  const resp = await fetch(base + "/__internal/find-employee");
  if (resp.status === 200) {
    const { employeeId } = await resp.json();
    console.log("Found employee:", employeeId);
    const payroll = await generatePayroll(
      employeeId,
      "2026-01-16",
      "2026-01-31"
    );
    console.log("Payroll created:", payroll);
    const payslipPath = await downloadPayslip(payroll._id);
    console.log("Payslip saved to", payslipPath);
  } else {
    console.log("Could not find employee via internal endpoint");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
