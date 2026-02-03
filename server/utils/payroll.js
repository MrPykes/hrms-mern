const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

async function computeContributions(basic){
  const sss = Math.round(basic * 0.0365); // simplified employee share
  const philhealth = Math.round(basic * 0.03);
  const pagibig = Math.round(Math.min(100, basic * 0.01));
  return { sss, philhealth, pagibig };
}

async function computePayrollForEmployee(employee, periodStart, periodEnd){
  const basic = employee.salary?.basic || 0;
  const attendances = await Attendance.find({ employee: employee._id, date: { $gte: periodStart, $lte: periodEnd } });
  const leaves = await Leave.find({ employee: employee._id, startDate: { $lte: periodEnd }, endDate: { $gte: periodStart }, status: 'approved' });
  let overtimePay = 0;
  let lateDeductions = 0;
  // Overtime: assume hourly rate = basic / 160
  const hourly = basic / 160;
  attendances.forEach(a => {
    overtimePay += (a.overtimeApproved ? (a.overtimeMinutes/60) * hourly * 1.25 : 0);
    lateDeductions += (a.lateMinutes/60) * hourly;
  });
  const contributions = await computeContributions(basic);
  const gross = basic + overtimePay;
  const totalDeductions = (contributions.sss + contributions.philhealth + contributions.pagibig) + lateDeductions;
  const net = gross - totalDeductions;
  return { basic, overtime: overtimePay, deductions: { late: lateDeductions }, contributions, grossPay: gross, netPay: net };
}

module.exports = { computePayrollForEmployee };
