const cron = require('node-cron');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const { computePayrollForEmployee } = require('../utils/payroll');

async function runPayrollIfPayday(){
  const now = new Date();
  const day = now.getDate();
  if (![1,16].includes(day)) return;
  if (now.getDay() === 0) now.setDate(now.getDate() + 1);
  if (now.getDay() === 6) now.setDate(now.getDate() + 2);
  const periodStart = day === 1 ? new Date(now.getFullYear(), now.getMonth()-1, 16) : new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = day === 1 ? new Date(now.getFullYear(), now.getMonth(), 0) : new Date(now.getFullYear(), now.getMonth(), 15);
  const emps = await Employee.find({ status: 'active' }).limit(500);
  for (const e of emps){
    const result = await computePayrollForEmployee(e, periodStart, periodEnd);
    await Payroll.create({ employee: e._id, periodStart, periodEnd, ...result, status: 'finalized' });
  }
}

cron.schedule('5 0 * * *', () => {
  runPayrollIfPayday().catch(err => console.error('Payroll cron error', err));
});

module.exports = { runPayrollIfPayday };
