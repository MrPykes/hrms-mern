const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Employee = require("../models/Employee");

// Get all attendance records
router.get("/", async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate({
        path: "employee",
        populate: { path: "user", select: "name" },
      })
      .sort({ date: -1 });

    // load approved leaves to mark attendance as On Leave when applicable
    const approvedLeaves = await Leave.find({ status: "approved" });

    const formatted = records.map((record) => {
      const clockIn = record.clockIn ? new Date(record.clockIn) : null;
      const clockOut = record.clockOut ? new Date(record.clockOut) : null;

      let hoursWorked = 0;
      if (clockIn && clockOut) {
        hoursWorked = ((clockOut - clockIn) / (1000 * 60 * 60)).toFixed(1);
      }

      // default status based on clock records
      let status = "Present";
      if (!clockIn) {
        status = "Absent";
      } else if (record.lateMinutes > 0) {
        status = "Late";
      }

      // check if there's an approved leave for this employee overlapping the attendance date
      const recDate = new Date(record.date);
      const isOnLeave = approvedLeaves.some((lv) => {
        if (!lv.employee) return false;
        if (lv.employee.toString() !== (record.employee?._id || "").toString()) return false;
        const ls = new Date(lv.startDate);
        const le = new Date(lv.endDate);
        // normalize dates to ignore time portion
        const d = new Date(recDate.getFullYear(), recDate.getMonth(), recDate.getDate());
        const s = new Date(ls.getFullYear(), ls.getMonth(), ls.getDate());
        const e = new Date(le.getFullYear(), le.getMonth(), le.getDate());
        return d >= s && d <= e;
      });

      if (isOnLeave) {
        status = "On Leave";
      }

      return {
        id: record._id,
        employeeId: record.employee?._id,
        employeeName: record.employee?.user?.name || "Unknown",
        date: new Date(record.date).toLocaleDateString("en-US"),
        timeIn: isOnLeave ? "-" : (clockIn
          ? clockIn.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-"),
        timeOut: isOnLeave ? "-" : (clockOut
          ? clockOut.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-"),
        hoursWorked: isOnLeave ? 0 : (parseFloat(hoursWorked) || 0),
        status,
        lateMinutes: record.lateMinutes,
        overtimeMinutes: record.overtimeMinutes,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create attendance record
router.post("/", async (req, res) => {
  try {
    const { employeeId, date, timeIn, timeOut, status } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const recordDate = new Date(date);
    let clockIn = null;
    let clockOut = null;
    let lateMinutes = 0;

    if (status !== "Absent" && timeIn) {
      const [inH, inM] = timeIn.split(":");
      clockIn = new Date(recordDate);
      clockIn.setHours(parseInt(inH), parseInt(inM), 0);

      // Calculate late minutes (assuming 8:00 AM start)
      const startTime = new Date(recordDate);
      startTime.setHours(8, 0, 0);
      if (clockIn > startTime) {
        lateMinutes = Math.floor((clockIn - startTime) / (1000 * 60));
      }
    }

    if (status !== "Absent" && timeOut) {
      const [outH, outM] = timeOut.split(":");
      clockOut = new Date(recordDate);
      clockOut.setHours(parseInt(outH), parseInt(outM), 0);
    }

    const attendance = new Attendance({
      employee: employeeId,
      date: recordDate,
      clockIn,
      clockOut,
      lateMinutes,
      notes: status === "Absent" ? "Absent" : "",
    });
    await attendance.save();

    await attendance.populate({
      path: "employee",
      populate: { path: "user", select: "name" },
    });

    let hoursWorked = 0;
    if (clockIn && clockOut) {
      hoursWorked = ((clockOut - clockIn) / (1000 * 60 * 60)).toFixed(1);
    }

    res.status(201).json({
      id: attendance._id,
      employeeId: attendance.employee._id,
      employeeName: attendance.employee.user?.name || "Unknown",
      date: new Date(attendance.date).toLocaleDateString("en-US"),
      timeIn: clockIn
        ? clockIn.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      timeOut: clockOut
        ? clockOut.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      hoursWorked: parseFloat(hoursWorked) || 0,
      status,
    });
  } catch (error) {
    console.error("Error creating attendance:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update attendance record
router.put("/:id", async (req, res) => {
  try {
    const { employeeId, date, timeIn, timeOut, status } = req.body;

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    const recordDate = new Date(date);
    let clockIn = null;
    let clockOut = null;
    let lateMinutes = 0;

    if (status !== "Absent" && timeIn) {
      const [inH, inM] = timeIn.split(":");
      clockIn = new Date(recordDate);
      clockIn.setHours(parseInt(inH), parseInt(inM), 0);

      const startTime = new Date(recordDate);
      startTime.setHours(8, 0, 0);
      if (clockIn > startTime) {
        lateMinutes = Math.floor((clockIn - startTime) / (1000 * 60));
      }
    }

    if (status !== "Absent" && timeOut) {
      const [outH, outM] = timeOut.split(":");
      clockOut = new Date(recordDate);
      clockOut.setHours(parseInt(outH), parseInt(outM), 0);
    }

    attendance.employee = employeeId;
    attendance.date = recordDate;
    attendance.clockIn = clockIn;
    attendance.clockOut = clockOut;
    attendance.lateMinutes = lateMinutes;
    attendance.notes = status === "Absent" ? "Absent" : "";
    await attendance.save();

    await attendance.populate({
      path: "employee",
      populate: { path: "user", select: "name" },
    });

    let hoursWorked = 0;
    if (clockIn && clockOut) {
      hoursWorked = ((clockOut - clockIn) / (1000 * 60 * 60)).toFixed(1);
    }

    res.json({
      id: attendance._id,
      employeeId: attendance.employee._id,
      employeeName: attendance.employee.user?.name || "Unknown",
      date: new Date(attendance.date).toLocaleDateString("en-US"),
      timeIn: clockIn
        ? clockIn.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      timeOut: clockOut
        ? clockOut.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      hoursWorked: parseFloat(hoursWorked) || 0,
      status,
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete attendance record
router.delete("/:id", async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    res.json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
