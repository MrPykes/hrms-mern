const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Models
const User = require("../models/User");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Expense = require("../models/Expense");
const Income = require("../models/Income");
const Payroll = require("../models/Payroll");

// Mock Data (copied from client/src/data/mockData.js)
const employees = [
  {
    id: 1,
    firstName: "Juan",
    lastName: "Dela Cruz",
    email: "juan.delacruz@company.com",
    phone: "0917-123-4567",
    position: "Software Developer",
    department: "IT",
    employmentType: "Regular",
    status: "Active",
    hireDate: "01/15/2022",
    salary: 45000,
    allowances: 5000,
    address: "123 Rizal St., Makati City",
    birthDate: "05/20/1990",
    sss: "34-1234567-8",
    philhealth: "12-123456789-0",
    pagibig: "1234-5678-9012",
    tin: "123-456-789-000",
  },
  {
    id: 2,
    firstName: "Maria",
    lastName: "Santos",
    email: "maria.santos@company.com",
    phone: "0918-234-5678",
    position: "HR Manager",
    department: "Human Resources",
    employmentType: "Regular",
    status: "Active",
    hireDate: "03/01/2021",
    salary: 55000,
    allowances: 7000,
    address: "456 Bonifacio Ave., Quezon City",
    birthDate: "08/15/1988",
    sss: "34-2345678-9",
    philhealth: "12-234567890-1",
    pagibig: "2345-6789-0123",
    tin: "234-567-890-000",
  },
  {
    id: 3,
    firstName: "Pedro",
    lastName: "Reyes",
    email: "pedro.reyes@company.com",
    phone: "0919-345-6789",
    position: "Accountant",
    department: "Finance",
    employmentType: "Regular",
    status: "Active",
    hireDate: "06/15/2020",
    salary: 40000,
    allowances: 4000,
    address: "789 Mabini St., Pasig City",
    birthDate: "12/10/1992",
    sss: "34-3456789-0",
    philhealth: "12-345678901-2",
    pagibig: "3456-7890-1234",
    tin: "345-678-901-000",
  },
  {
    id: 4,
    firstName: "Ana",
    lastName: "Garcia",
    email: "ana.garcia@company.com",
    phone: "0920-456-7890",
    position: "Marketing Specialist",
    department: "Marketing",
    employmentType: "Probationary",
    status: "Active",
    hireDate: "11/01/2025",
    salary: 35000,
    allowances: 3000,
    address: "321 Luna St., Mandaluyong City",
    birthDate: "03/25/1995",
    sss: "34-4567890-1",
    philhealth: "12-456789012-3",
    pagibig: "4567-8901-2345",
    tin: "456-789-012-000",
  },
  {
    id: 5,
    firstName: "Carlos",
    lastName: "Mendoza",
    email: "carlos.mendoza@company.com",
    phone: "0921-567-8901",
    position: "Project Manager",
    department: "Operations",
    employmentType: "Regular",
    status: "Active",
    hireDate: "02/20/2019",
    salary: 60000,
    allowances: 8000,
    address: "654 Aguinaldo Blvd., Cavite City",
    birthDate: "07/30/1985",
    sss: "34-5678901-2",
    philhealth: "12-567890123-4",
    pagibig: "5678-9012-3456",
    tin: "567-890-123-000",
  },
  {
    id: 6,
    firstName: "Rosa",
    lastName: "Villanueva",
    email: "rosa.villanueva@company.com",
    phone: "0922-678-9012",
    position: "Admin Assistant",
    department: "Administration",
    employmentType: "Contractual",
    status: "Active",
    hireDate: "09/01/2025",
    salary: 25000,
    allowances: 2000,
    address: "987 Quezon Ave., Caloocan City",
    birthDate: "11/05/1998",
    sss: "34-6789012-3",
    philhealth: "12-678901234-5",
    pagibig: "6789-0123-4567",
    tin: "678-901-234-000",
  },
  {
    id: 7,
    firstName: "Miguel",
    lastName: "Torres",
    email: "miguel.torres@company.com",
    phone: "0923-789-0123",
    position: "Sales Executive",
    department: "Sales",
    employmentType: "Regular",
    status: "Inactive",
    hireDate: "04/10/2018",
    salary: 38000,
    allowances: 5000,
    address: "147 España Blvd., Manila",
    birthDate: "09/18/1991",
    sss: "34-7890123-4",
    philhealth: "12-789012345-6",
    pagibig: "7890-1234-5678",
    tin: "789-012-345-000",
  },
];

const attendanceData = [
  {
    employeeId: 1,
    date: "02/03/2026",
    timeIn: "08:00",
    timeOut: "17:00",
    lateMinutes: 0,
    status: "Present",
  },
  {
    employeeId: 2,
    date: "02/03/2026",
    timeIn: "08:15",
    timeOut: "17:30",
    lateMinutes: 15,
    status: "Late",
  },
  {
    employeeId: 3,
    date: "02/03/2026",
    timeIn: "07:55",
    timeOut: "17:00",
    lateMinutes: 0,
    status: "Present",
  },
  {
    employeeId: 4,
    date: "02/03/2026",
    timeIn: null,
    timeOut: null,
    lateMinutes: 0,
    status: "Absent",
  },
  {
    employeeId: 5,
    date: "02/03/2026",
    timeIn: "08:00",
    timeOut: "18:00",
    lateMinutes: 0,
    status: "Present",
  },
  {
    employeeId: 6,
    date: "02/03/2026",
    timeIn: "08:30",
    timeOut: "17:00",
    lateMinutes: 30,
    status: "Late",
  },
  {
    employeeId: 1,
    date: "02/04/2026",
    timeIn: "08:00",
    timeOut: "17:00",
    lateMinutes: 0,
    status: "Present",
  },
  {
    employeeId: 2,
    date: "02/04/2026",
    timeIn: "08:00",
    timeOut: "17:00",
    lateMinutes: 0,
    status: "Present",
  },
  {
    employeeId: 3,
    date: "02/04/2026",
    timeIn: "08:00",
    timeOut: "17:00",
    lateMinutes: 0,
    status: "Present",
  },
  {
    employeeId: 4,
    date: "02/04/2026",
    timeIn: "08:05",
    timeOut: "17:00",
    lateMinutes: 5,
    status: "Present",
  },
];

const leavesData = [
  {
    employeeId: 1,
    type: "Vacation",
    startDate: "02/10/2026",
    endDate: "02/12/2026",
    days: 3,
    reason: "Family vacation",
    status: "approved",
  },
  {
    employeeId: 3,
    type: "Sick",
    startDate: "02/05/2026",
    endDate: "02/05/2026",
    days: 1,
    reason: "Medical checkup",
    status: "approved",
  },
  {
    employeeId: 4,
    type: "Unpaid",
    startDate: "02/03/2026",
    endDate: "02/03/2026",
    days: 1,
    reason: "Family emergency",
    status: "pending",
  },
  {
    employeeId: 2,
    type: "Vacation",
    startDate: "02/20/2026",
    endDate: "02/25/2026",
    days: 4,
    reason: "Personal trip",
    status: "pending",
  },
  {
    employeeId: 5,
    type: "Sick",
    startDate: "01/28/2026",
    endDate: "01/29/2026",
    days: 2,
    reason: "Flu",
    status: "approved",
  },
];

const expensesData = [
  {
    date: "02/01/2026",
    category: "Office Supplies",
    description: "Printer ink and paper",
    amount: 3500,
  },
  {
    date: "02/01/2026",
    category: "Utilities",
    description: "Electricity bill - January",
    amount: 15000,
  },
  {
    date: "02/02/2026",
    category: "Internet",
    description: "Monthly internet subscription",
    amount: 2500,
  },
  {
    date: "02/03/2026",
    category: "Salaries",
    description: "January 2026 payroll",
    amount: 256200,
  },
  {
    date: "02/03/2026",
    category: "Miscellaneous",
    description: "Team lunch meeting",
    amount: 5000,
  },
  {
    date: "02/04/2026",
    category: "Office Supplies",
    description: "New office chairs (5 pcs)",
    amount: 25000,
  },
  {
    date: "02/05/2026",
    category: "Utilities",
    description: "Water bill - January",
    amount: 3000,
  },
];

const incomeData = [
  {
    date: "02/01/2026",
    source: "Client Payments",
    description: "ABC Corp - Web Development Project",
    amount: 150000,
  },
  {
    date: "02/02/2026",
    source: "Services",
    description: "Monthly IT Support - XYZ Inc.",
    amount: 50000,
  },
  {
    date: "02/03/2026",
    source: "Projects",
    description: "Mobile App Development - DEF Ltd.",
    amount: 200000,
  },
  {
    date: "02/04/2026",
    source: "Client Payments",
    description: "GHI Corp - System Maintenance",
    amount: 35000,
  },
  {
    date: "02/05/2026",
    source: "Services",
    description: "Consultation Services - JKL Inc.",
    amount: 25000,
  },
];

const payrollData = [
  {
    employeeId: 1,
    period: "January 2026",
    basic: 45000,
    overtime: 2500,
    grossPay: 52500,
    sss: 2025,
    philhealth: 1125,
    pagibig: 200,
    withholdingTax: 3500,
    netPay: 45650,
    status: "paid",
  },
  {
    employeeId: 2,
    period: "January 2026",
    basic: 55000,
    overtime: 0,
    grossPay: 62000,
    sss: 2475,
    philhealth: 1375,
    pagibig: 200,
    withholdingTax: 5200,
    netPay: 52750,
    status: "paid",
  },
  {
    employeeId: 3,
    period: "January 2026",
    basic: 40000,
    overtime: 1500,
    grossPay: 45500,
    sss: 1800,
    philhealth: 1000,
    pagibig: 200,
    withholdingTax: 2800,
    netPay: 39700,
    status: "paid",
  },
  {
    employeeId: 4,
    period: "January 2026",
    basic: 35000,
    overtime: 0,
    grossPay: 38000,
    sss: 1575,
    philhealth: 875,
    pagibig: 200,
    withholdingTax: 2000,
    netPay: 33350,
    status: "draft",
  },
  {
    employeeId: 5,
    period: "January 2026",
    basic: 60000,
    overtime: 3000,
    grossPay: 71000,
    sss: 2700,
    philhealth: 1500,
    pagibig: 200,
    withholdingTax: 6500,
    netPay: 60100,
    status: "paid",
  },
  {
    employeeId: 6,
    period: "January 2026",
    basic: 25000,
    overtime: 500,
    grossPay: 27500,
    sss: 1125,
    philhealth: 625,
    pagibig: 100,
    withholdingTax: 1000,
    netPay: 24650,
    status: "draft",
  },
];

// Helper to parse MM/DD/YYYY date
function parseDate(dateStr) {
  if (!dateStr) return null;
  const [month, day, year] = dateStr.split("/");
  return new Date(year, parseInt(month) - 1, parseInt(day));
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Expense.deleteMany({});
    await Income.deleteMany({});
    await Payroll.deleteMany({});

    // Create Admin user
    console.log("👤 Creating admin user...");
    const adminPassword = await bcrypt.hash("admin123", 10);
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@techsolutions.ph",
      passwordHash: adminPassword,
      role: "admin",
    });

    // Create Users and Employees
    console.log("👥 Creating employees...");
    const userEmployeeMap = {}; // Maps mock employee id to Employee document

    for (const emp of employees) {
      const password = await bcrypt.hash("password123", 10);
      const user = await User.create({
        name: `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
        passwordHash: password,
        role: "employee",
      });

      const employmentTypeMap = {
        Regular: "regular",
        Probationary: "probationary",
        Contractual: "contractual",
      };

      const employee = await Employee.create({
        user: user._id,
        personal: {
          birthdate: parseDate(emp.birthDate),
          address: emp.address,
          phone: emp.phone,
        },
        employment: {
          type: employmentTypeMap[emp.employmentType] || "regular",
          hireDate: parseDate(emp.hireDate),
          status: emp.status === "Active" ? "active" : "resigned",
        },
        statutory: {
          sss: emp.sss,
          philhealth: emp.philhealth,
          pagibig: emp.pagibig,
          tin: emp.tin,
        },
        salary: {
          payType: "monthly",
          basic: emp.salary,
        },
      });

      userEmployeeMap[emp.id] = employee;
      console.log(`   ✓ ${emp.firstName} ${emp.lastName}`);
    }

    // Create Attendance records
    console.log("📅 Creating attendance records...");
    for (const att of attendanceData) {
      const employee = userEmployeeMap[att.employeeId];
      if (!employee) continue;

      const date = parseDate(att.date);
      let clockIn = null;
      let clockOut = null;

      if (att.timeIn) {
        const [hours, mins] = att.timeIn.split(":");
        clockIn = new Date(date);
        clockIn.setHours(parseInt(hours), parseInt(mins));
      }

      if (att.timeOut) {
        const [hours, mins] = att.timeOut.split(":");
        clockOut = new Date(date);
        clockOut.setHours(parseInt(hours), parseInt(mins));
      }

      await Attendance.create({
        employee: employee._id,
        date,
        clockIn,
        clockOut,
        lateMinutes: att.lateMinutes,
        overtimeMinutes: 0,
        overtimeApproved: false,
      });
    }
    console.log(`   ✓ ${attendanceData.length} attendance records`);

    // Create Leave records
    console.log("🏖️  Creating leave records...");
    for (const leave of leavesData) {
      const employee = userEmployeeMap[leave.employeeId];
      if (!employee) continue;

      await Leave.create({
        employee: employee._id,
        type: leave.type,
        startDate: parseDate(leave.startDate),
        endDate: parseDate(leave.endDate),
        days: leave.days,
        reason: leave.reason,
        status: leave.status,
      });
    }
    console.log(`   ✓ ${leavesData.length} leave records`);

    // Create Expense records
    console.log("💸 Creating expense records...");
    for (const expense of expensesData) {
      await Expense.create({
        description: expense.description,
        category: expense.category,
        amount: expense.amount,
        date: parseDate(expense.date),
        status: "approved",
      });
    }
    console.log(`   ✓ ${expensesData.length} expense records`);

    // Create Income records
    console.log("💰 Creating income records...");
    for (const inc of incomeData) {
      await Income.create({
        source: inc.source,
        description: inc.description,
        amount: inc.amount,
        date: parseDate(inc.date),
        status: "received",
      });
    }
    console.log(`   ✓ ${incomeData.length} income records`);

    // Create Payroll records
    console.log("💵 Creating payroll records...");
    for (const pay of payrollData) {
      const employee = userEmployeeMap[pay.employeeId];
      if (!employee) continue;

      await Payroll.create({
        employee: employee._id,
        periodStart: new Date("2026-01-01"),
        periodEnd: new Date("2026-01-31"),
        basic: pay.basic,
        overtime: pay.overtime,
        deductions: {
          withholdingTax: pay.withholdingTax,
        },
        contributions: {
          sss: pay.sss,
          philhealth: pay.philhealth,
          pagibig: pay.pagibig,
        },
        grossPay: pay.grossPay,
        netPay: pay.netPay,
        status: pay.status,
      });
    }
    console.log(`   ✓ ${payrollData.length} payroll records`);

    console.log("\n✅ Database seeding complete!");
    console.log("\n📋 Summary:");
    console.log(`   - Users: ${employees.length + 1} (including admin)`);
    console.log(`   - Employees: ${employees.length}`);
    console.log(`   - Attendance: ${attendanceData.length}`);
    console.log(`   - Leaves: ${leavesData.length}`);
    console.log(`   - Expenses: ${expensesData.length}`);
    console.log(`   - Income: ${incomeData.length}`);
    console.log(`   - Payroll: ${payrollData.length}`);
    console.log("\n🔐 Admin Login:");
    console.log("   Email: admin@techsolutions.ph");
    console.log("   Password: admin123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

main();
