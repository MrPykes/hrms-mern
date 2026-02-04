const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Get all employees with user data
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("user", "name email role")
      .populate("employment.manager", "name email");

    const formatted = employees.map((emp) => ({
      id: emp._id,
      odName: emp.user?.name || "",
      email: emp.user?.email || "",
      firstName: emp.user?.name?.split(" ")[0] || "",
      lastName: emp.user?.name?.split(" ").slice(1).join(" ") || "",
      department: emp.employment?.department || "General",
      position: emp.user?.role || "Employee",
      status: emp.employment?.status === "active" ? "Active" : "Inactive",
      hireDate: emp.employment?.hireDate
        ? new Date(emp.employment.hireDate).toLocaleDateString("en-US")
        : "",
      salary: emp.salary?.basic || 0,
      phone: emp.personal?.phone || "",
      address: emp.personal?.address || "",
      sss: emp.statutory?.sss || "",
      philhealth: emp.statutory?.philhealth || "",
      pagibig: emp.statutory?.pagibig || "",
      tin: emp.statutory?.tin || "",
      employmentType: emp.employment?.type || "regular",
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get single employee
router.get("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate(
      "user",
      "name email role",
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({
      id: employee._id,
      firstName: employee.user?.name?.split(" ")[0] || "",
      lastName: employee.user?.name?.split(" ").slice(1).join(" ") || "",
      email: employee.user?.email || "",
      department: employee.employment?.department || "General",
      position: employee.user?.role || "Employee",
      status: employee.employment?.status === "active" ? "Active" : "Inactive",
      hireDate: employee.employment?.hireDate,
      salary: employee.salary?.basic || 0,
      phone: employee.personal?.phone || "",
      address: employee.personal?.address || "",
      sss: employee.statutory?.sss || "",
      philhealth: employee.statutory?.philhealth || "",
      pagibig: employee.statutory?.pagibig || "",
      tin: employee.statutory?.tin || "",
      employmentType: employee.employment?.type || "regular",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create new employee
router.post("/", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      department,
      position,
      hireDate,
      salary,
      phone,
      address,
      sss,
      philhealth,
      pagibig,
      tin,
      employmentType,
    } = req.body;

    // Check if user email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create user first
    const passwordHash = await bcrypt.hash("password123", 10);
    const user = new User({
      name: `${firstName} ${lastName}`,
      email,
      passwordHash,
      role: position || "employee",
    });
    await user.save();

    // Create employee
    const employee = new Employee({
      user: user._id,
      personal: {
        phone,
        address,
      },
      employment: {
        type: employmentType || "regular",
        hireDate: hireDate ? new Date(hireDate) : new Date(),
        status: "active",
        department,
      },
      statutory: {
        sss,
        philhealth,
        pagibig,
        tin,
      },
      salary: {
        payType: "monthly",
        basic: parseFloat(salary) || 0,
      },
    });
    await employee.save();

    res.status(201).json({
      id: employee._id,
      firstName,
      lastName,
      email,
      department,
      position,
      status: "Active",
      hireDate: employee.employment.hireDate.toLocaleDateString("en-US"),
      salary: employee.salary.basic,
      phone,
      address,
      sss,
      philhealth,
      pagibig,
      tin,
      employmentType,
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update employee
router.put("/:id", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      department,
      position,
      status,
      hireDate,
      salary,
      phone,
      address,
      sss,
      philhealth,
      pagibig,
      tin,
      employmentType,
    } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Update user
    await User.findByIdAndUpdate(employee.user, {
      name: `${firstName} ${lastName}`,
      email,
      role: position,
    });

    // Update employee
    employee.personal = { phone, address };
    employee.employment = {
      ...employee.employment,
      type: employmentType || "regular",
      hireDate: hireDate ? new Date(hireDate) : employee.employment.hireDate,
      status: status === "Active" ? "active" : "resigned",
      department,
    };
    employee.statutory = { sss, philhealth, pagibig, tin };
    employee.salary = {
      payType: "monthly",
      basic: parseFloat(salary) || 0,
    };
    await employee.save();

    res.json({
      id: employee._id,
      firstName,
      lastName,
      email,
      department,
      position,
      status,
      hireDate: employee.employment.hireDate.toLocaleDateString("en-US"),
      salary: employee.salary.basic,
      phone,
      address,
      sss,
      philhealth,
      pagibig,
      tin,
      employmentType,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete employee
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Delete associated user
    await User.findByIdAndDelete(employee.user);
    await Employee.findByIdAndDelete(req.params.id);

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
