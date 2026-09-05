import { Router } from "express";
import type { Request, Response } from "express";
import { randomUUID } from "crypto";

const router = Router();

/* =========================================================
   TYPES
========================================================= */

type AttendanceStatus =
  | "present"
  | "late"
  | "early_checkout"
  | "absent"
  | "incomplete";

type AttendanceRecord = {
  id: string;
  employeeId: string;

  date: string;

  checkIn: string | null;
  checkOut: string | null;

  workedHours: number;
  overtimeHours: number;

  status: AttendanceStatus;

  lateMinutes: number;
  earlyCheckoutMinutes: number;

  notes?: string;

  createdAt: string;
  updatedAt: string;
};

/* =========================================================
   IN-MEMORY STORAGE
========================================================= */

const attendanceRecords: AttendanceRecord[] = [];

/* =========================================================
   HELPERS
========================================================= */

const WORK_START = "09:00";
const WORK_END = "18:00";
const STANDARD_WORK_HOURS = 8;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowISO(): string {
  return new Date().toISOString();
}

function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function isValidTime(time: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

function timeToMinutes(time: string): number {
  const parts = time.split(":");

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return 0;
  }

  return hours * 60 + minutes;
}

function round(value: number, decimals = 2): number {
  return Number(value.toFixed(decimals));
}

function calculateWorkedHours(
  checkIn: string,
  checkOut: string
): number {
  const difference =
    timeToMinutes(checkOut) - timeToMinutes(checkIn);

  if (difference <= 0) {
    return 0;
  }

  // 1 hour lunch break
  const breakMinutes = difference >= 9 * 60 ? 60 : 0;

  return round((difference - breakMinutes) / 60);
}

function calculateLateMinutes(checkIn: string): number {
  const difference =
    timeToMinutes(checkIn) - timeToMinutes(WORK_START);

  return Math.max(0, difference);
}

function calculateEarlyCheckoutMinutes(checkOut: string): number {
  const difference =
    timeToMinutes(WORK_END) - timeToMinutes(checkOut);

  return Math.max(0, difference);
}

function findAttendance(id: string): AttendanceRecord | undefined {
  return attendanceRecords.find((record) => record.id === id);
}

function getDateRange(
  records: AttendanceRecord[],
  startDate?: string,
  endDate?: string
): AttendanceRecord[] {
  return records.filter((record) => {
    if (startDate && record.date < startDate) {
      return false;
    }

    if (endDate && record.date > endDate) {
      return false;
    }

    return true;
  });
}

/* =========================================================
   CHECK-IN
   POST /api/attendance/check-in
========================================================= */

router.post("/check-in", (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};

    const {
      employeeId,
      date = today(),
      checkIn,
      notes,
    } = body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "employeeId is required",
      });
    }

    if (!checkIn) {
      return res.status(400).json({
        success: false,
        message: "checkIn is required",
      });
    }

    if (!isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    if (!isValidTime(checkIn)) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkIn time. Use HH:mm",
      });
    }

    const existing = attendanceRecords.find(
      (record) =>
        record.employeeId === employeeId &&
        record.date === date
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Attendance already exists for this employee and date",
        attendance: existing,
      });
    }

    const lateMinutes = calculateLateMinutes(checkIn);

    const status: AttendanceStatus =
      lateMinutes > 0 ? "late" : "present";

    const record: AttendanceRecord = {
      id: randomUUID(),
      employeeId,
      date,

      checkIn,
      checkOut: null,

      workedHours: 0,
      overtimeHours: 0,

      status,

      lateMinutes,
      earlyCheckoutMinutes: 0,

      notes,

      createdAt: nowISO(),
      updatedAt: nowISO(),
    };

    attendanceRecords.push(record);

    return res.status(201).json({
      success: true,
      message: "Employee checked in successfully",
      attendance: record,
    });
  } catch (error) {
    console.error("Check-in error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* =========================================================
   CHECK-OUT
   POST /api/attendance/check-out
========================================================= */

router.post("/check-out", (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};

    const {
      employeeId,
      date = today(),
      checkOut,
    } = body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "employeeId is required",
      });
    }

    if (!checkOut) {
      return res.status(400).json({
        success: false,
        message: "checkOut is required",
      });
    }

    if (!isValidTime(checkOut)) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkOut time. Use HH:mm",
      });
    }

    const record = attendanceRecords.find(
      (item) =>
        item.employeeId === employeeId &&
        item.date === date
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Check-in record not found",
      });
    }

    if (!record.checkIn) {
      return res.status(400).json({
        success: false,
        message: "Employee has not checked in",
      });
    }

    if (record.checkOut) {
      return res.status(409).json({
        success: false,
        message: "Employee has already checked out",
        attendance: record,
      });
    }

    if (
      timeToMinutes(checkOut) <=
      timeToMinutes(record.checkIn)
    ) {
      return res.status(400).json({
        success: false,
        message: "Check-out must be after check-in",
      });
    }

    const workedHours = calculateWorkedHours(
      record.checkIn,
      checkOut
    );

    const overtimeHours = round(
      Math.max(0, workedHours - STANDARD_WORK_HOURS)
    );

    const earlyCheckoutMinutes =
      calculateEarlyCheckoutMinutes(checkOut);

    let status: AttendanceStatus = record.status;

    if (earlyCheckoutMinutes > 0) {
      status = "early_checkout";
    } else if (record.lateMinutes > 0) {
      status = "late";
    } else {
      status = "present";
    }

    record.checkOut = checkOut;
    record.workedHours = workedHours;
    record.overtimeHours = overtimeHours;
    record.earlyCheckoutMinutes = earlyCheckoutMinutes;
    record.status = status;
    record.updatedAt = nowISO();

    return res.status(200).json({
      success: true,
      message: "Employee checked out successfully",
      attendance: record,
    });
  } catch (error) {
    console.error("Check-out error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* =========================================================
   GET ALL ATTENDANCE
   GET /api/attendance
========================================================= */

router.get("/", (req: Request, res: Response) => {
  try {
    const {
      employeeId,
      date,
      startDate,
      endDate,
      status,
    } = req.query;

    let records = [...attendanceRecords];

    if (employeeId) {
      records = records.filter(
        (record) =>
          record.employeeId === String(employeeId)
      );
    }

    if (date) {
      records = records.filter(
        (record) => record.date === String(date)
      );
    }

    records = getDateRange(
      records,
      startDate ? String(startDate) : undefined,
      endDate ? String(endDate) : undefined
    );

    if (status) {
      records = records.filter(
        (record) =>
          record.status === String(status)
      );
    }

    records.sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    return res.status(200).json({
      success: true,
      data: records,
      total: records.length,
    });
  } catch (error) {
    console.error("Get attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* =========================================================
   ANALYTICS
   GET /api/attendance/analytics
========================================================= */

router.get("/analytics", (req: Request, res: Response) => {
  try {
    const {
      employeeId,
      startDate,
      endDate,
    } = req.query;

    let records = [...attendanceRecords];

    if (employeeId) {
      records = records.filter(
        (record) =>
          record.employeeId === String(employeeId)
      );
    }

    records = getDateRange(
      records,
      startDate ? String(startDate) : undefined,
      endDate ? String(endDate) : undefined
    );

    const totalRecords = records.length;

    const present = records.filter(
      (r) => r.status === "present"
    ).length;

    const late = records.filter(
      (r) => r.status === "late"
    ).length;

    const earlyCheckout = records.filter(
      (r) => r.status === "early_checkout"
    ).length;

    const incomplete = records.filter(
      (r) => r.status === "incomplete"
    ).length;

    const totalWorkedHours = round(
      records.reduce(
        (sum, record) => sum + record.workedHours,
        0
      )
    );

    const totalOvertimeHours = round(
      records.reduce(
        (sum, record) => sum + record.overtimeHours,
        0
      )
    );

    const averageWorkedHours =
      totalRecords > 0
        ? round(totalWorkedHours / totalRecords)
        : 0;

    const attendanceRate =
      totalRecords > 0
        ? round((present / totalRecords) * 100)
        : 0;

    const lateRate =
      totalRecords > 0
        ? round((late / totalRecords) * 100)
        : 0;

    return res.status(200).json({
      success: true,

      filters: {
        employeeId: employeeId || null,
        startDate: startDate || null,
        endDate: endDate || null,
      },

      analytics: {
        totalRecords,

        present,
        late,
        earlyCheckout,
        incomplete,

        attendanceRate,
        lateRate,

        totalWorkedHours,
        averageWorkedHours,
        totalOvertimeHours,
      },
    });
  } catch (error) {
    console.error("Attendance analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* =========================================================
   ANOMALIES
   GET /api/attendance/anomalies
========================================================= */

router.get("/anomalies", (req: Request, res: Response) => {
  try {
    const {
      employeeId,
      startDate,
      endDate,
    } = req.query;

    let records = [...attendanceRecords];

    if (employeeId) {
      records = records.filter(
        (record) =>
          record.employeeId === String(employeeId)
      );
    }

    records = getDateRange(
      records,
      startDate ? String(startDate) : undefined,
      endDate ? String(endDate) : undefined
    );

    const anomalies = records
      .map((record) => {
        const issues: string[] = [];

        if (!record.checkIn) {
          issues.push("Missing check-in");
        }

        if (!record.checkOut) {
          issues.push("Missing check-out");
        }

        if (record.lateMinutes >= 30) {
          issues.push("Significantly late arrival");
        } else if (record.lateMinutes > 0) {
          issues.push("Late arrival");
        }

        if (record.earlyCheckoutMinutes >= 30) {
          issues.push("Early checkout");
        }

        if (
          record.workedHours > 0 &&
          record.workedHours < 4
        ) {
          issues.push("Very low worked hours");
        }

        if (record.overtimeHours >= 3) {
          issues.push("High overtime");
        }

        return {
          ...record,
          anomalies: issues,
          anomalyCount: issues.length,
        };
      })
      .filter((record) => record.anomalyCount > 0);

    return res.status(200).json({
      success: true,
      total: anomalies.length,
      anomalies,
    });
  } catch (error) {
    console.error("Attendance anomaly error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* =========================================================
   PAYROLL SUMMARY
   GET /api/attendance/payroll-summary
========================================================= */

router.get(
  "/payroll-summary",
  (req: Request, res: Response) => {
    try {
      const {
        employeeId,
        startDate,
        endDate,
      } = req.query;

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: "employeeId is required",
        });
      }

      let records = attendanceRecords.filter(
        (record) =>
          record.employeeId === String(employeeId)
      );

      records = getDateRange(
        records,
        startDate ? String(startDate) : undefined,
        endDate ? String(endDate) : undefined
      );

      const totalWorkedHours = round(
        records.reduce(
          (sum, record) => sum + record.workedHours,
          0
        )
      );

      const overtimeHours = round(
        records.reduce(
          (sum, record) => sum + record.overtimeHours,
          0
        )
      );

      const lateMinutes = records.reduce(
        (sum, record) =>
          sum + record.lateMinutes,
        0
      );

      const presentDays = records.filter(
        (record) =>
          record.checkIn && record.checkOut
      ).length;

      const incompleteDays = records.filter(
        (record) =>
          record.checkIn && !record.checkOut
      ).length;

      return res.status(200).json({
        success: true,

        employeeId,

        period: {
          startDate: startDate || null,
          endDate: endDate || null,
        },

        payrollSummary: {
          attendanceDays: records.length,
          presentDays,
          incompleteDays,

          totalWorkedHours,
          overtimeHours,

          lateMinutes,
          lateHours: round(lateMinutes / 60),
        },
      });
    } catch (error) {
      console.error("Payroll summary error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

/* =========================================================
   EMPLOYEE HEALTH
   GET /api/attendance/:employeeId/health
========================================================= */

router.get(
  "/:employeeId/health",
  (req: Request, res: Response) => {
    try {
      const { employeeId } = req.params;

      const records = attendanceRecords.filter(
        (record) =>
          record.employeeId === employeeId
      );

      if (records.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "No attendance records found for this employee",
        });
      }

      const total = records.length;

      const lateCount = records.filter(
        (record) => record.lateMinutes > 0
      ).length;

      const earlyCheckoutCount =
        records.filter(
          (record) =>
            record.earlyCheckoutMinutes > 0
        ).length;

      const incompleteCount =
        records.filter(
          (record) => !record.checkOut
        ).length;

      const totalWorkedHours = records.reduce(
        (sum, record) =>
          sum + record.workedHours,
        0
      );

      const averageWorkedHours = round(
        totalWorkedHours / total
      );

      /*
        Simple explainable attendance health score.

        Start: 100

        Penalties:
        Late:              -5 each
        Early checkout:   -5 each
        Missing checkout: -10 each

        Score is capped between 0 and 100.
      */

      const penalty =
        lateCount * 5 +
        earlyCheckoutCount * 5 +
        incompleteCount * 10;

      const score = Math.max(
        0,
        Math.min(100, 100 - penalty)
      );

      let level:
        | "excellent"
        | "good"
        | "needs_attention"
        | "critical";

      if (score >= 90) {
        level = "excellent";
      } else if (score >= 75) {
        level = "good";
      } else if (score >= 50) {
        level = "needs_attention";
      } else {
        level = "critical";
      }

      return res.status(200).json({
        success: true,

        employeeId,

        health: {
          score,
          level,

          metrics: {
            totalAttendanceRecords: total,
            lateCount,
            earlyCheckoutCount,
            incompleteCount,
            averageWorkedHours,
          },

          explanation: {
            latePenalty: lateCount * 5,
            earlyCheckoutPenalty:
              earlyCheckoutCount * 5,
            incompletePenalty:
              incompleteCount * 10,
          },
        },
      });
    } catch (error) {
      console.error(
        "Attendance health error:",
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
   EMPLOYEE ATTENDANCE
   GET /api/attendance/:employeeId
========================================================= */

router.get(
  "/:employeeId",
  (req: Request, res: Response) => {
    try {
      const { employeeId } = req.params;

      const records = attendanceRecords
        .filter(
          (record) =>
            record.employeeId === employeeId
        )
        .sort((a, b) =>
          b.date.localeCompare(a.date)
        );

      return res.status(200).json({
        success: true,
        employeeId,
        data: records,
        total: records.length,
      });
    } catch (error) {
      console.error(
        "Employee attendance error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

export default router;