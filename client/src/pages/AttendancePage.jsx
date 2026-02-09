import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import {
  attendanceApi,
  employeesApi,
  leavesApi,
  holidaysApi,
} from "../services/api";

export default function Attendance() {
  const { addToast } = useToast();
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [isOnLeave, setIsOnLeave] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    date: "",
    timeIn: "",
    timeOut: "",
    status: "Present",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attendanceData, employeesData] = await Promise.all([
        attendanceApi.getAll(),
        employeesApi.getAll(),
      ]);
      setAttendance(attendanceData);
      setEmployees(employeesData.filter((e) => e.status === "Active"));
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: "",
      employeeName: "",
      date: "",
      timeIn: "",
      timeOut: "",
      status: "Present",
    });
    setIsOnLeave(false);
    setIsHoliday(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "employeeId") {
      const emp = employees.find((e) => e.id === value);
      const newData = {
        ...formData,
        employeeId: value,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : "",
      };
      setFormData(newData);
      checkIfOnLeave(newData.employeeId, newData.date);
    } else if (name === "date") {
      const newData = { ...formData, date: value };
      setFormData(newData);
      checkIfOnLeave(newData.employeeId, newData.date);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const checkIfOnLeave = async (employeeId, date) => {
    if (!employeeId || !date) {
      setIsOnLeave(false);
      setIsHoliday(false);
      return false;
    }
    try {
      const [leaves, holidays] = await Promise.all([
        leavesApi.getAll(),
        holidaysApi.getAll(),
      ]);
      const target = new Date(date);

      const onLeave = leaves.some((lv) => {
        const status = (lv.status || "").toLowerCase();
        if (status !== "approved") return false;
        const lvEmpId =
          lv.employeeId || (lv.employee && lv.employee._id) || lv.employee;
        if (!lvEmpId) return false;
        if (String(lvEmpId) !== String(employeeId)) return false;
        const s = new Date(lv.startDate);
        const e = new Date(lv.endDate);
        const d = new Date(
          target.getFullYear(),
          target.getMonth(),
          target.getDate(),
        );
        const ss = new Date(s.getFullYear(), s.getMonth(), s.getDate());
        const ee = new Date(e.getFullYear(), e.getMonth(), e.getDate());
        return d >= ss && d <= ee;
      });

      const isHol = holidays.some((h) => {
        if (!h || !h.date) return false;
        const hd = new Date(h.date);
        const d = new Date(
          target.getFullYear(),
          target.getMonth(),
          target.getDate(),
        );
        const hh = new Date(hd.getFullYear(), hd.getMonth(), hd.getDate());
        return d.getTime() === hh.getTime();
      });

      setIsOnLeave(onLeave);
      setIsHoliday(isHol && !onLeave);

      if (onLeave) {
        setFormData((prev) => ({ ...prev, status: "On Leave" }));
      } else if (isHol) {
        setFormData((prev) => ({ ...prev, status: "Holiday" }));
      } else if (
        formData.status === "On Leave" ||
        formData.status === "Holiday"
      ) {
        setFormData((prev) => ({ ...prev, status: "Present" }));
      }

      return onLeave;
    } catch (err) {
      console.error("Error checking leave/holiday:", err);
      setIsOnLeave(false);
      setIsHoliday(false);
      return false;
    }
  };

  const handleAddAttendance = async () => {
    try {
      setSaving(true);
      const newRecord = await attendanceApi.create(formData);
      setAttendance([newRecord, ...attendance]);
      setShowAddModal(false);
      resetForm();
      addToast("Attendance record added successfully!", "success");
    } catch (err) {
      addToast("Error adding attendance: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (record) => {
    setSelectedRecord(record);
    const timeIn24 =
      record.timeIn !== "-" ? convertTo24Hour(record.timeIn) : "";
    const timeOut24 =
      record.timeOut !== "-" ? convertTo24Hour(record.timeOut) : "";
    const newData = {
      employeeId: record.employeeId,
      employeeName: record.employeeName,
      date: formatDateForInput(record.date),
      timeIn: timeIn24,
      timeOut: timeOut24,
      status: record.status,
    };
    setFormData(newData);
    setShowEditModal(true);
    checkIfOnLeave(newData.employeeId, newData.date);
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const [month, day, year] = dateStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const convertTo24Hour = (time12) => {
    if (!time12 || time12 === "-") return "";
    const [time, modifier] = time12.split(" ");
    let [hours, minutes] = time.split(":");
    if (modifier === "PM" && hours !== "12") hours = parseInt(hours) + 12;
    if (modifier === "AM" && hours === "12") hours = "00";
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  const handleUpdateAttendance = async () => {
    try {
      setSaving(true);
      const updated = await attendanceApi.update(selectedRecord.id, formData);
      setAttendance(
        attendance.map((r) => (r.id === selectedRecord.id ? updated : r)),
      );
      setShowEditModal(false);
      setSelectedRecord(null);
      resetForm();
      addToast("Attendance record updated successfully!", "success");
    } catch (err) {
      addToast("Error updating attendance: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const filteredAttendance = attendance.filter((record) => {
    return !selectedStatus || record.status === selectedStatus;
  });

  const columns = [
    {
      header: "Employee",
      accessor: "employeeName",
      render: (value) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
            {value
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <span className="font-medium text-gray-800">{value}</span>
        </div>
      ),
    },
    { header: "Date", accessor: "date" },
    { header: "Time In", accessor: "timeIn" },
    { header: "Time Out", accessor: "timeOut" },
    {
      header: "Late",
      accessor: "lateMinutes",
      render: (value) => {
        if (!value || value === 0) return <span className="text-gray-400">-</span>;
        const hours = Math.floor(value / 60);
        const mins = value % 60;
        const display = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        return <span className="text-red-600 font-medium">{display}</span>;
      },
    },
    {
      header: "Hours Worked",
      accessor: "hoursWorked",
      render: (value) => {
        const hours = value?.hours || 0;
        const mins = value?.minutes || 0;
        const decimal = value?.decimal || 0;
        const display = hours > 0 && mins > 0 ? `${hours}h ${mins}m` : hours > 0 ? `${hours}h` : mins > 0 ? `${mins}m` : "0h";
        return (
          <span
            className={
              decimal >= 8
                ? "text-green-600 font-medium"
                : "text-yellow-600 font-medium"
            }
          >
            {display}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            value === "Present"
              ? "bg-green-100 text-green-700"
              : value === "Late"
                ? "bg-yellow-100 text-yellow-700"
                : value === "On Leave"
                  ? "bg-blue-100 text-blue-700"
                  : value === "Holiday"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-red-100 text-red-700"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "id",
      render: (_, row) => (
        <button
          onClick={() => handleEditClick(row)}
          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Edit
        </button>
      ),
    },
  ];

  const stats = {
    present: attendance.filter((a) => a.status === "Present").length,
    late: attendance.filter((a) => a.status === "Late").length,
    absent: attendance.filter((a) => a.status === "Absent").length,
  };

  const AttendanceForm = ({ onSubmit, submitText }) => (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Employee
        </label>
        <select
          name="employeeId"
          value={formData.employeeId}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isOnLeave || isHoliday}
        >
          <option value="Present">Present</option>
          <option value="Late">Late</option>
          <option value="Absent">Absent</option>
          <option value="On Leave">On Leave</option>
          <option value="Holiday">Holiday</option>
        </select>
      </div>
      {formData.status !== "Absent" && !(isOnLeave || isHoliday) && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time In
            </label>
            <input
              type="time"
              name="timeIn"
              value={formData.timeIn}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Out
            </label>
            <input
              type="time"
              name="timeOut"
              value={formData.timeOut}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            resetForm();
          }}
          disabled={saving}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {saving ? "Saving..." : submitText}
        </button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
          <p className="text-gray-500 mt-1">
            Track employee attendance records
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Attendance
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Present</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.present}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Late</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table columns={columns} data={filteredAttendance} />
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add Attendance"
        size="md"
      >
        <AttendanceForm
          onSubmit={handleAddAttendance}
          submitText="Add Record"
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Attendance"
        size="md"
      >
        <AttendanceForm
          onSubmit={handleUpdateAttendance}
          submitText="Update Record"
        />
      </Modal>
    </div>
  );
}
