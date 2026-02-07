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
        status:
          emp.employment?.status === "active"
            ? "Active"
            : emp.employment?.status === "resigned"
            ? "Resigned"
            : emp.employment?.status === "terminated"
            ? "Terminated"
            : "Inactive",
        hireDate: emp.employment?.hireDate
          ? new Date(emp.employment.hireDate).toLocaleDateString("en-US")
          : "",
        salary: emp.salary?.basic || 0,
        allowances: emp.salary?.allowances || 0,
        birthDate: emp.personal?.birthdate
          ? new Date(emp.personal.birthdate).toLocaleDateString("en-US")
          : "",
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
        status:
          employee.employment?.status === "active"
            ? "Active"
            : employee.employment?.status === "resigned"
            ? "Resigned"
            : employee.employment?.status === "terminated"
            ? "Terminated"
            : "Inactive",
        hireDate: employee.employment?.hireDate,
        salary: employee.salary?.basic || 0,
        allowances: employee.salary?.allowances || 0,
        birthDate: employee.personal?.birthdate
          ? new Date(employee.personal.birthdate).toLocaleDateString("en-US")
          : "",
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
      birthDate,
      salary,
      allowances,
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
        ...(birthDate ? { birthdate: new Date(birthDate) } : {}),
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
        allowances: parseFloat(allowances) || 0,
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
        allowances: employee.salary.allowances || 0,
        birthDate: employee.personal?.birthdate
          ? new Date(employee.personal.birthdate).toLocaleDateString("en-US")
          : "",
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
      birthDate,
      allowances,
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

    // Update personal - preserve existing values where not provided
    employee.personal = {
      ...employee.personal,
      phone: phone || employee.personal?.phone,
      address: address || employee.personal?.address,
      ...(birthDate ? { birthdate: new Date(birthDate) } : {}),
    };

    // Employment updates - preserve existing values unless provided
    employee.employment = {
      ...employee.employment,
      type: employmentType || employee.employment?.type || "regular",
      hireDate: hireDate ? new Date(hireDate) : employee.employment?.hireDate,
      department: department || employee.employment?.department,
    };

    // Only update status if explicitly provided to avoid clearing it
    if (typeof status !== "undefined") {
      const s = String(status).toLowerCase();
      if (s === "active") employee.employment.status = "active";
      else if (s === "resigned" || s === "inactive") employee.employment.status = "resigned";
      else if (s === "terminated") employee.employment.status = "terminated";
    }

    employee.statutory = { sss, philhealth, pagibig, tin };
    employee.salary = {
      payType: "monthly",
      basic: parseFloat(salary) || employee.salary?.basic || 0,
      allowances: parseFloat(allowances) || employee.salary?.allowances || 0,
    };
    await employee.save();

    res.json({
      id: employee._id,
      firstName,
      lastName,
      email,
      department,
      position,
      status: typeof status !== 'undefined' ? status : (employee.employment?.status === 'active' ? 'Active' : 'Resigned'),
      hireDate: employee.employment.hireDate.toLocaleDateString("en-US"),
      salary: employee.salary.basic,
      allowances: employee.salary.allowances || 0,
      birthDate: employee.personal?.birthdate
        ? new Date(employee.personal.birthdate).toLocaleDateString("en-US")
        : "",
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
