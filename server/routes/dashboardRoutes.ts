import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

/* =========================================================
   DEMO / IN-MEMORY DASHBOARD DATA
========================================================= */

const employees = [
  {
    id: "EMP001",
    name: "Rahul Kumar",
    department: "Engineering",
    employmentType: "full_time",
    status: "active",
    salary: 60000,
  },
  {
    id: "EMP002",
    name: "Priya Sharma",
    department: "HR",
    employmentType: "full_time",
    status: "active",
    salary: 50000,
  },
  {
    id: "EMP003",
    name: "Amit Singh",
    department: "Engineering",
    employmentType: "full_time",
    status: "active",
    salary: 55000,
  },
  {
    id: "EMP004",
    name: "Neha Verma",
    department: "Marketing",
    employmentType: "full_time",
    status: "active",
    salary: 45000,
  },
];

const attendance = [
  {
    employeeId: "EMP001",
    date: "2026-09-01",
    status: "present",
    workedHours: 8,
    overtimeHours: 0,
  },
  {
    employeeId: "EMP001",
    date: "2026-09-02",
    status: "late",
    workedHours: 8.75,
    overtimeHours: 0.75,
  },
  {
    employeeId: "EMP002",
    date: "2026-09-01",
    status: "present",
    workedHours: 8,
    overtimeHours: 0,
  },
  {
    employeeId: "EMP003",
    date: "2026-09-01",
    status: "present",
    workedHours: 8,
    overtimeHours: 0,
  },
  {
    employeeId: "EMP004",
    date: "2026-09-01",
    status: "late",
    workedHours: 7.5,
    overtimeHours: 0,
  },
];

const timeOff = [
  {
    employeeId: "EMP001",
    type: "Annual Leave",
    days: 3,
    status: "approved",
  },
  {
    employeeId: "EMP002",
    type: "Sick Leave",
    days: 2,
    status: "approved",
  },
  {
    employeeId: "EMP003",
    type: "Annual Leave",
    days: 1,
    status: "pending",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function round(
  value: number,
  decimals = 2
): number {
  return Number(value.toFixed(decimals));
}

/* =========================================================
   OVERVIEW
   GET /api/dashboard/overview
========================================================= */

router.get(
  "/overview",
  (req: Request, res: Response) => {
    try {
      const {
        department,
        employmentType,
        status,
      } = req.query;

      let filteredEmployees = [...employees];

      /* -------------------------
         Department Filter
      ------------------------- */

      if (department) {
        filteredEmployees =
          filteredEmployees.filter(
            (employee) =>
              employee.department ===
              String(department)
          );
      }

      /* -------------------------
         Employment Type Filter
      ------------------------- */

      if (employmentType) {
        filteredEmployees =
          filteredEmployees.filter(
            (employee) =>
              employee.employmentType ===
              String(employmentType)
          );
      }

      /* -------------------------
         Status Filter
      ------------------------- */

      if (status) {
        filteredEmployees =
          filteredEmployees.filter(
            (employee) =>
              employee.status ===
              String(status)
          );
      }

      /* -------------------------
         Employee IDs
      ------------------------- */

      const employeeIds =
        filteredEmployees.map(
          (employee) => employee.id
        );

      /* -------------------------
         Filter Attendance
      ------------------------- */

      const filteredAttendance =
        attendance.filter(
          (record) =>
            employeeIds.includes(
              record.employeeId
            )
        );

      /* -------------------------
         Filter Time Off
      ------------------------- */

      const filteredTimeOff =
        timeOff.filter(
          (request) =>
            employeeIds.includes(
              request.employeeId
            )
        );

      /* -------------------------
         Employee Metrics
      ------------------------- */

      const totalEmployees =
        filteredEmployees.length;

      const activeEmployees =
        filteredEmployees.filter(
          (employee) =>
            employee.status === "active"
        ).length;

      /* -------------------------
         Salary Cost
      ------------------------- */

      const monthlySalaryCost =
        round(
          filteredEmployees.reduce(
            (sum, employee) =>
              sum + employee.salary,
            0
          )
        );

      /* -------------------------
         Attendance Metrics
      ------------------------- */

      const presentDays =
        filteredAttendance.filter(
          (record) =>
            record.status === "present"
        ).length;

      const lateDays =
        filteredAttendance.filter(
          (record) =>
            record.status === "late"
        ).length;

      const attendanceRate =
        filteredAttendance.length > 0
          ? round(
              (presentDays /
                filteredAttendance.length) *
                100
            )
          : 0;

      /* -------------------------
         Leave Metrics
      ------------------------- */

      const approvedLeave =
        filteredTimeOff.filter(
          (request) =>
            request.status === "approved"
        );

      const approvedLeaveDays =
        approvedLeave.reduce(
          (sum, request) =>
            sum + request.days,
          0
        );

      const pendingLeave =
        filteredTimeOff.filter(
          (request) =>
            request.status === "pending"
        ).length;

      /* -------------------------
         Response
      ------------------------- */

      return res.status(200).json({
        success: true,

        filters: {
          department:
            department
              ? String(department)
              : null,

          employmentType:
            employmentType
              ? String(employmentType)
              : null,

          status:
            status
              ? String(status)
              : null,
        },

        overview: {
          totalEmployees,
          activeEmployees,

          monthlySalaryCost,

          attendance: {
            attendanceRate,
            presentDays,
            lateDays,
          },

          timeOff: {
            approvedLeaveDays,
            pendingRequests:
              pendingLeave,
          },
        },
      });
    } catch (error) {
      console.error(
        "Dashboard overview error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

/* =========================================================
   SALARY BY DEPARTMENT
   GET /api/dashboard/salary-by-department
========================================================= */

router.get(
  "/salary-by-department",
  (_req: Request, res: Response) => {
    try {
      const departments: Record<
        string,
        {
          employeeCount: number;
          salaryCost: number;
        }
      > = {};

      /* -------------------------
         Build Department Data
      ------------------------- */

      for (const employee of employees) {
        if (!departments[employee.department]) {
          departments[employee.department] = {
            employeeCount: 0,
            salaryCost: 0,
          };
        }

        const departmentData =
          departments[employee.department];

        if (departmentData) {
          departmentData.employeeCount += 1;
          departmentData.salaryCost +=
            employee.salary;
        }
      }

      /* -------------------------
         Format Response
      ------------------------- */

      const data = Object.entries(
        departments
      ).map(
        ([department, values]) => ({
          department,

          employeeCount:
            values.employeeCount,

          salaryCost: round(
            values.salaryCost
          ),
        })
      );

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error(
        "Salary department error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

/* =========================================================
   SALARY TREND
   GET /api/dashboard/salary-trend
========================================================= */

router.get(
  "/salary-trend",
  (_req: Request, res: Response) => {
    try {
      /*
        Demo monthly trend.

        Later this can be generated
        from actual paid payruns.
      */

      const monthlySalary =
        employees.reduce(
          (sum, employee) =>
            sum + employee.salary,
          0
        );

      const data = [
        {
          month: "2026-04",
          salaryCost: round(
            monthlySalary * 0.94
          ),
        },

        {
          month: "2026-05",
          salaryCost: round(
            monthlySalary * 0.96
          ),
        },

        {
          month: "2026-06",
          salaryCost: round(
            monthlySalary * 0.98
          ),
        },

        {
          month: "2026-07",
          salaryCost: round(
            monthlySalary
          ),
        },

        {
          month: "2026-08",
          salaryCost: round(
            monthlySalary * 1.01
          ),
        },

        {
          month: "2026-09",
          salaryCost: round(
            monthlySalary * 1.02
          ),
        },
      ];

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error(
        "Salary trend error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

/* =========================================================
   ATTENDANCE DASHBOARD
   GET /api/dashboard/attendance
========================================================= */

router.get(
  "/attendance",
  (_req: Request, res: Response) => {
    try {
      const total =
        attendance.length;

      /* -------------------------
         Present
      ------------------------- */

      const present =
        attendance.filter(
          (record) =>
            record.status === "present"
        ).length;

      /* -------------------------
         Late
      ------------------------- */

      const late =
        attendance.filter(
          (record) =>
            record.status === "late"
        ).length;

      /* -------------------------
         Average Worked Hours
      ------------------------- */

      const averageWorkedHours =
        total > 0
          ? round(
              attendance.reduce(
                (sum, record) =>
                  sum +
                  record.workedHours,
                0
              ) / total
            )
          : 0;

      /* -------------------------
         Overtime
      ------------------------- */

      const totalOvertimeHours =
        round(
          attendance.reduce(
            (sum, record) =>
              sum +
              record.overtimeHours,
            0
          )
        );

      /* -------------------------
         Attendance Rate
      ------------------------- */

      const attendanceRate =
        total > 0
          ? round(
              (present / total) * 100
            )
          : 0;

      /* -------------------------
         Response
      ------------------------- */

      return res.status(200).json({
        success: true,

        attendance: {
          totalRecords: total,

          present,
          late,

          attendanceRate,

          averageWorkedHours,

          totalOvertimeHours,
        },
      });
    } catch (error) {
      console.error(
        "Dashboard attendance error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

/* =========================================================
   TIME OFF DASHBOARD
   GET /api/dashboard/time-off
========================================================= */

router.get(
  "/time-off",
  (_req: Request, res: Response) => {
    try {
      /* -------------------------
         Approved
      ------------------------- */

      const approved =
        timeOff.filter(
          (request) =>
            request.status ===
            "approved"
        );

      /* -------------------------
         Pending
      ------------------------- */

      const pending =
        timeOff.filter(
          (request) =>
            request.status ===
            "pending"
        );

      /* -------------------------
         Rejected
      ------------------------- */

      const rejected =
        timeOff.filter(
          (request) =>
            request.status ===
            "rejected"
        );

      /* -------------------------
         Total Approved Days
      ------------------------- */

      const totalApprovedDays =
        approved.reduce(
          (sum, request) =>
            sum + request.days,
          0
        );

      /* -------------------------
         Leave By Type
      ------------------------- */

      const leaveByType: Record<
        string,
        number
      > = {};

      for (const request of approved) {
        leaveByType[request.type] =
          (leaveByType[request.type] ||
            0) + request.days;
      }

      /* -------------------------
         Response
      ------------------------- */

      return res.status(200).json({
        success: true,

        timeOff: {
          totalRequests:
            timeOff.length,

          approvedRequests:
            approved.length,

          pendingRequests:
            pending.length,

          rejectedRequests:
            rejected.length,

          totalApprovedDays,

          leaveByType,
        },
      });
    } catch (error) {
      console.error(
        "Dashboard time-off error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

/* =========================================================
   EXPORT
========================================================= */

export default router;