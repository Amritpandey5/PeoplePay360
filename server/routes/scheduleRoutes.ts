import { Router } from "express";
import { randomUUID } from "crypto";

const router = Router();

type DayName =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

type ScheduleDay = {
  day: DayName;
  startTime: string;
  endTime: string;
  breakMinutes: number;
};

type Schedule = {
  id: string;
  name: string;
  description?: string;
  employeeId?: string;
  contractId?: string;
  days: ScheduleDay[];
  weeklyHours: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};

const schedules: Schedule[] = [];

const validDays: DayName[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const timeToMinutes = (time: string): number => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);

  if (!match) {
    return -1;
  }

  return Number(match[1]) * 60 + Number(match[2]);
};

const calculateWeeklyHours = (days: ScheduleDay[]): number => {
  const totalMinutes = days.reduce((total, day) => {
    const start = timeToMinutes(day.startTime);
    const end = timeToMinutes(day.endTime);

    return total + (end - start - day.breakMinutes);
  }, 0);

  return Number((totalMinutes / 60).toFixed(2));
};

const validateDays = (days: unknown): string | null => {
  if (!Array.isArray(days)) {
    return "days must be an array";
  }

  const seenDays = new Set<string>();

  for (const item of days) {
    if (!item || typeof item !== "object") {
      return "Invalid schedule day";
    }

    const day = item as Partial<ScheduleDay>;

    if (!day.day || !validDays.includes(day.day)) {
      return `Invalid day: ${day.day}`;
    }

    if (seenDays.has(day.day)) {
      return `Duplicate day: ${day.day}`;
    }

    seenDays.add(day.day);

    if (!day.startTime || !day.endTime) {
      return `Start time and end time are required for ${day.day}`;
    }

    const start = timeToMinutes(day.startTime);
    const end = timeToMinutes(day.endTime);

    if (start === -1 || end === -1) {
      return `Invalid time format for ${day.day}. Use HH:mm`;
    }

    if (end <= start) {
      return `End time must be after start time for ${day.day}`;
    }

    if (
      typeof day.breakMinutes !== "number" ||
      day.breakMinutes < 0 ||
      day.breakMinutes >= end - start
    ) {
      return `Invalid break time for ${day.day}`;
    }
  }

  return null;
};

/**
 * CREATE SCHEDULE
 * POST /api/schedules
 */
router.post("/", (req, res) => {
  try {
    const {
      name,
      description,
      employeeId,
      contractId,
      days,
      status = "active",
    } = req.body ?? {};

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Schedule name is required",
      });
    }

    if (!Array.isArray(days) || days.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one working day is required",
      });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid schedule status",
      });
    }

    const validationError = validateDays(days);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    if (employeeId) {
      const existingEmployeeSchedule = schedules.find(
        (schedule) =>
          schedule.employeeId === employeeId &&
          schedule.status === "active"
      );

      if (existingEmployeeSchedule) {
        return res.status(409).json({
          success: false,
          message: "Employee already has an active schedule",
        });
      }
    }

    if (contractId) {
      const existingContractSchedule = schedules.find(
        (schedule) =>
          schedule.contractId === contractId &&
          schedule.status === "active"
      );

      if (existingContractSchedule) {
        return res.status(409).json({
          success: false,
          message: "Contract already has an active schedule",
        });
      }
    }

    const normalizedDays: ScheduleDay[] = days.map(
      (day: ScheduleDay) => ({
        day: day.day,
        startTime: day.startTime,
        endTime: day.endTime,
        breakMinutes: day.breakMinutes,
      })
    );

    const now = new Date().toISOString();

    const schedule: Schedule = {
      id: randomUUID(),
      name,
      description,
      employeeId,
      contractId,
      days: normalizedDays,
      weeklyHours: calculateWeeklyHours(normalizedDays),
      status,
      createdAt: now,
      updatedAt: now,
    };

    schedules.push(schedule);

    return res.status(201).json({
      success: true,
      message: "Working schedule created successfully",
      schedule,
    });
  } catch (error) {
    console.error("Create schedule error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * GET ALL SCHEDULES
 * GET /api/schedules
 */
router.get("/", (req, res) => {
  try {
    const {
      employeeId,
      contractId,
      status,
      search,
    } = req.query;

    let result = [...schedules];

    if (employeeId) {
      result = result.filter(
        (schedule) => schedule.employeeId === employeeId
      );
    }

    if (contractId) {
      result = result.filter(
        (schedule) => schedule.contractId === contractId
      );
    }

    if (status) {
      result = result.filter(
        (schedule) => schedule.status === status
      );
    }

    if (search) {
      const keyword = String(search).toLowerCase();

      result = result.filter(
        (schedule) =>
          schedule.name.toLowerCase().includes(keyword) ||
          schedule.description?.toLowerCase().includes(keyword)
      );
    }

    return res.status(200).json({
      success: true,
      data: result,
      total: result.length,
    });
  } catch (error) {
    console.error("Get schedules error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * GET SINGLE SCHEDULE
 * GET /api/schedules/:id
 */
router.get("/:id", (req, res) => {
  const schedule = schedules.find(
    (item) => item.id === req.params.id
  );

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: "Schedule not found",
    });
  }

  return res.status(200).json({
    success: true,
    schedule,
  });
});

/**
 * UPDATE SCHEDULE
 * PATCH /api/schedules/:id
 */
router.patch("/:id", (req, res) => {
  try {
    const schedule = schedules.find(
      (item) => item.id === req.params.id
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    const {
      name,
      description,
      employeeId,
      contractId,
      days,
      status,
    } = req.body ?? {};

    if (status && !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid schedule status",
      });
    }

    if (days !== undefined) {
      if (!Array.isArray(days) || days.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one working day is required",
        });
      }

      const validationError = validateDays(days);

      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError,
        });
      }
    }

    const newEmployeeId =
      employeeId !== undefined
        ? employeeId
        : schedule.employeeId;

    const newContractId =
      contractId !== undefined
        ? contractId
        : schedule.contractId;

    if (
      newEmployeeId &&
      newEmployeeId !== schedule.employeeId &&
      (status ?? schedule.status) === "active"
    ) {
      const conflict = schedules.find(
        (item) =>
          item.id !== schedule.id &&
          item.employeeId === newEmployeeId &&
          item.status === "active"
      );

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: "Employee already has an active schedule",
        });
      }
    }

    if (
      newContractId &&
      newContractId !== schedule.contractId &&
      (status ?? schedule.status) === "active"
    ) {
      const conflict = schedules.find(
        (item) =>
          item.id !== schedule.id &&
          item.contractId === newContractId &&
          item.status === "active"
      );

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: "Contract already has an active schedule",
        });
      }
    }

    if (name !== undefined) schedule.name = name;
    if (description !== undefined) {
      schedule.description = description;
    }

    schedule.employeeId = newEmployeeId;
    schedule.contractId = newContractId;

    if (days !== undefined) {
      schedule.days = days;
      schedule.weeklyHours = calculateWeeklyHours(days);
    }

    if (status !== undefined) {
      schedule.status = status;
    }

    schedule.updatedAt = new Date().toISOString();

    return res.status(200).json({
      success: true,
      message: "Working schedule updated successfully",
      schedule,
    });
  } catch (error) {
    console.error("Update schedule error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * DELETE SCHEDULE
 * DELETE /api/schedules/:id
 */
router.delete("/:id", (req, res) => {
  const index = schedules.findIndex(
    (item) => item.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Schedule not found",
    });
  }

  const deletedSchedule = schedules.splice(index, 1)[0];

  return res.status(200).json({
    success: true,
    message: "Working schedule deleted successfully",
    schedule: deletedSchedule,
  });
});

export default router;