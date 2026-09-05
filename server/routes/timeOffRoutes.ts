import { Router } from "express";
import { randomUUID } from "crypto";

const router = Router();

/* =========================================================
   TYPES
========================================================= */

type LeaveType = {
  id: string;
  name: string;
  code: string;
  description?: string;
  unit: "days" | "hours";
  paid: boolean;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};

type LeaveAllocation = {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  allocated: number;
  used: number;
  remaining: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

type LeaveRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

type LeaveRequest = {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  quantity: number;
  reason?: string;
  status: LeaveRequestStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
};

/* =========================================================
   IN-MEMORY STORAGE
========================================================= */

const leaveTypes: LeaveType[] = [];
const allocations: LeaveAllocation[] = [];
const requests: LeaveRequest[] = [];

/* =========================================================
   HELPERS
========================================================= */

const isValidDate = (value: string): boolean => {
  return !Number.isNaN(new Date(value).getTime());
};

const calculateDays = (
  startDate: string,
  endDate: string
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const difference =
    end.getTime() - start.getTime();

  return Number(
    (difference / (1000 * 60 * 60 * 24) + 1).toFixed(2)
  );
};

const datesOverlap = (
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean => {
  return (
    new Date(startA) <= new Date(endB) &&
    new Date(endA) >= new Date(startB)
  );
};

/* =========================================================
   LEAVE TYPES
========================================================= */

/**
 * CREATE LEAVE TYPE
 * POST /api/time-off/types
 */
router.post("/types", (req, res) => {
  try {
    const {
      name,
      code,
      description,
      unit = "days",
      paid = true,
      status = "active",
    } = req.body ?? {};

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Leave type name and code are required",
      });
    }

    if (!["days", "hours"].includes(unit)) {
      return res.status(400).json({
        success: false,
        message: "Unit must be days or hours",
      });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave type status",
      });
    }

    const normalizedCode = String(code).toUpperCase();

    const duplicate = leaveTypes.find(
      (type) =>
        type.code === normalizedCode ||
        type.name.toLowerCase() ===
          String(name).toLowerCase()
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Leave type with same name or code already exists",
      });
    }

    const now = new Date().toISOString();

    const leaveType: LeaveType = {
      id: randomUUID(),
      name,
      code: normalizedCode,
      description,
      unit,
      paid,
      status,
      createdAt: now,
      updatedAt: now,
    };

    leaveTypes.push(leaveType);

    return res.status(201).json({
      success: true,
      message: "Leave type created successfully",
      leaveType,
    });
  } catch (error) {
    console.error("Create leave type error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * GET LEAVE TYPES
 * GET /api/time-off/types
 */
router.get("/types", (req, res) => {
  const { status, search } = req.query;

  let result = [...leaveTypes];

  if (status) {
    result = result.filter(
      (type) => type.status === status
    );
  }

  if (search) {
    const keyword = String(search).toLowerCase();

    result = result.filter(
      (type) =>
        type.name.toLowerCase().includes(keyword) ||
        type.code.toLowerCase().includes(keyword)
    );
  }

  return res.status(200).json({
    success: true,
    data: result,
    total: result.length,
  });
});

/**
 * GET SINGLE LEAVE TYPE
 * GET /api/time-off/types/:id
 */
router.get("/types/:id", (req, res) => {
  const leaveType = leaveTypes.find(
    (type) => type.id === req.params.id
  );

  if (!leaveType) {
    return res.status(404).json({
      success: false,
      message: "Leave type not found",
    });
  }

  return res.status(200).json({
    success: true,
    leaveType,
  });
});

/* =========================================================
   LEAVE ALLOCATIONS
========================================================= */

/**
 * CREATE ALLOCATION
 * POST /api/time-off/allocations
 */
router.post("/allocations", (req, res) => {
  try {
    const {
      employeeId,
      leaveTypeId,
      allocated,
      startDate,
      endDate,
    } = req.body ?? {};

    if (
      !employeeId ||
      !leaveTypeId ||
      allocated === undefined ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "employeeId, leaveTypeId, allocated, startDate and endDate are required",
      });
    }

    if (
      typeof allocated !== "number" ||
      allocated <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Allocated amount must be greater than 0",
      });
    }

    if (
      !isValidDate(startDate) ||
      !isValidDate(endDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid allocation dates",
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message:
          "End date cannot be before start date",
      });
    }

    const leaveType = leaveTypes.find(
      (type) => type.id === leaveTypeId
    );

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found",
      });
    }

    if (leaveType.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Leave type is inactive",
      });
    }

    const overlappingAllocation = allocations.find(
      (allocation) =>
        allocation.employeeId === employeeId &&
        allocation.leaveTypeId === leaveTypeId &&
        datesOverlap(
          allocation.startDate,
          allocation.endDate,
          startDate,
          endDate
        )
    );

    if (overlappingAllocation) {
      return res.status(409).json({
        success: false,
        message:
          "Overlapping leave allocation already exists",
      });
    }

    const now = new Date().toISOString();

    const allocation: LeaveAllocation = {
      id: randomUUID(),
      employeeId,
      leaveTypeId,
      allocated,
      used: 0,
      remaining: allocated,
      startDate,
      endDate,
      createdAt: now,
      updatedAt: now,
    };

    allocations.push(allocation);

    return res.status(201).json({
      success: true,
      message: "Leave allocation created successfully",
      allocation,
    });
  } catch (error) {
    console.error(
      "Create allocation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * GET ALLOCATIONS
 * GET /api/time-off/allocations
 */
router.get("/allocations", (req, res) => {
  const {
    employeeId,
    leaveTypeId,
  } = req.query;

  let result = [...allocations];

  if (employeeId) {
    result = result.filter(
      (allocation) =>
        allocation.employeeId === employeeId
    );
  }

  if (leaveTypeId) {
    result = result.filter(
      (allocation) =>
        allocation.leaveTypeId === leaveTypeId
    );
  }

  return res.status(200).json({
    success: true,
    data: result,
    total: result.length,
  });
});

/**
 * GET SINGLE ALLOCATION
 * GET /api/time-off/allocations/:id
 */
router.get("/allocations/:id", (req, res) => {
  const allocation = allocations.find(
    (item) => item.id === req.params.id
  );

  if (!allocation) {
    return res.status(404).json({
      success: false,
      message: "Leave allocation not found",
    });
  }

  return res.status(200).json({
    success: true,
    allocation,
  });
});

/* =========================================================
   LEAVE REQUESTS
========================================================= */

/**
 * CREATE LEAVE REQUEST
 * POST /api/time-off/requests
 */
router.post("/requests", (req, res) => {
  try {
    const {
      employeeId,
      leaveTypeId,
      startDate,
      endDate,
      quantity,
      reason,
    } = req.body ?? {};

    if (
      !employeeId ||
      !leaveTypeId ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "employeeId, leaveTypeId, startDate and endDate are required",
      });
    }

    if (
      !isValidDate(startDate) ||
      !isValidDate(endDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request dates",
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message:
          "End date cannot be before start date",
      });
    }

    const leaveType = leaveTypes.find(
      (type) => type.id === leaveTypeId
    );

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found",
      });
    }

    if (leaveType.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Leave type is inactive",
      });
    }

    const requestQuantity =
      quantity !== undefined
        ? Number(quantity)
        : calculateDays(startDate, endDate);

    if (
      Number.isNaN(requestQuantity) ||
      requestQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave quantity",
      });
    }

    const overlappingRequest = requests.find(
      (request) =>
        request.employeeId === employeeId &&
        request.status !== "rejected" &&
        request.status !== "cancelled" &&
        datesOverlap(
          request.startDate,
          request.endDate,
          startDate,
          endDate
        )
    );

    if (overlappingRequest) {
      return res.status(409).json({
        success: false,
        message:
          "Employee already has an overlapping leave request",
      });
    }

    const allocation = allocations.find(
      (item) =>
        item.employeeId === employeeId &&
        item.leaveTypeId === leaveTypeId &&
        new Date(item.startDate) <=
          new Date(startDate) &&
        new Date(item.endDate) >=
          new Date(endDate)
    );

    if (!allocation) {
      return res.status(400).json({
        success: false,
        message:
          "No valid leave allocation found for this employee and period",
      });
    }

    if (requestQuantity > allocation.remaining) {
      return res.status(400).json({
        success: false,
        message: `Insufficient leave balance. Remaining: ${allocation.remaining}`,
      });
    }

    const now = new Date().toISOString();

    const request: LeaveRequest = {
      id: randomUUID(),
      employeeId,
      leaveTypeId,
      startDate,
      endDate,
      quantity: requestQuantity,
      reason,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    requests.push(request);

    return res.status(201).json({
      success: true,
      message: "Leave request created successfully",
      request,
    });
  } catch (error) {
    console.error(
      "Create leave request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * GET LEAVE REQUESTS
 * GET /api/time-off/requests
 */
router.get("/requests", (req, res) => {
  const {
    employeeId,
    leaveTypeId,
    status,
    startDate,
    endDate,
  } = req.query;

  let result = [...requests];

  if (employeeId) {
    result = result.filter(
      (request) =>
        request.employeeId === employeeId
    );
  }

  if (leaveTypeId) {
    result = result.filter(
      (request) =>
        request.leaveTypeId === leaveTypeId
    );
  }

  if (status) {
    result = result.filter(
      (request) =>
        request.status === status
    );
  }

  if (startDate && endDate) {
    result = result.filter((request) =>
      datesOverlap(
        request.startDate,
        request.endDate,
        String(startDate),
        String(endDate)
      )
    );
  }

  return res.status(200).json({
    success: true,
    data: result,
    total: result.length,
  });
});

/**
 * GET SINGLE REQUEST
 * GET /api/time-off/requests/:id
 */
router.get("/requests/:id", (req, res) => {
  const request = requests.find(
    (item) => item.id === req.params.id
  );

  if (!request) {
    return res.status(404).json({
      success: false,
      message: "Leave request not found",
    });
  }

  return res.status(200).json({
    success: true,
    request,
  });
});

/* =========================================================
   APPROVE REQUEST
========================================================= */

/**
 * APPROVE LEAVE
 * PATCH /api/time-off/requests/:id/approve
 */
router.patch(
  "/requests/:id/approve",
  (req, res) => {
    try {
      const request = requests.find(
        (item) => item.id === req.params.id
      );

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Leave request not found",
        });
      }

      if (request.status !== "pending") {
        return res.status(400).json({
          success: false,
          message:
            "Only pending leave requests can be approved",
        });
      }

      const allocation = allocations.find(
        (item) =>
          item.employeeId === request.employeeId &&
          item.leaveTypeId === request.leaveTypeId &&
          new Date(item.startDate) <=
            new Date(request.startDate) &&
          new Date(item.endDate) >=
            new Date(request.endDate)
      );

      if (!allocation) {
        return res.status(400).json({
          success: false,
          message:
            "Valid leave allocation not found",
        });
      }

      if (request.quantity > allocation.remaining) {
        return res.status(400).json({
          success: false,
          message:
            "Insufficient leave balance",
        });
      }

      const { approvedBy = "HR Manager" } =
        req.body ?? {};

      const now = new Date().toISOString();

      request.status = "approved";
      request.approvedBy = approvedBy;
      request.approvedAt = now;
      request.updatedAt = now;

      allocation.used += request.quantity;
      allocation.remaining =
        allocation.allocated - allocation.used;
      allocation.updatedAt = now;

      return res.status(200).json({
        success: true,
        message:
          "Leave request approved and balance updated",
        request,
        allocation,
      });
    } catch (error) {
      console.error(
        "Approve leave error:",
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
   REJECT REQUEST
========================================================= */

/**
 * REJECT LEAVE
 * PATCH /api/time-off/requests/:id/reject
 */
router.patch(
  "/requests/:id/reject",
  (req, res) => {
    try {
      const request = requests.find(
        (item) => item.id === req.params.id
      );

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Leave request not found",
        });
      }

      if (request.status !== "pending") {
        return res.status(400).json({
          success: false,
          message:
            "Only pending leave requests can be rejected",
        });
      }

      const {
        rejectedBy = "HR Manager",
        rejectionReason,
      } = req.body ?? {};

      const now = new Date().toISOString();

      request.status = "rejected";
      request.rejectedBy = rejectedBy;
      request.rejectedAt = now;
      request.rejectionReason = rejectionReason;
      request.updatedAt = now;

      return res.status(200).json({
        success: true,
        message: "Leave request rejected",
        request,
      });
    } catch (error) {
      console.error(
        "Reject leave error:",
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
   CANCEL REQUEST
========================================================= */

/**
 * CANCEL LEAVE
 * PATCH /api/time-off/requests/:id/cancel
 */
router.patch(
  "/requests/:id/cancel",
  (req, res) => {
    try {
      const request = requests.find(
        (item) => item.id === req.params.id
      );

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Leave request not found",
        });
      }

      if (
        request.status !== "pending" &&
        request.status !== "approved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only pending or approved requests can be cancelled",
        });
      }

      if (request.status === "approved") {
        const allocation = allocations.find(
          (item) =>
            item.employeeId === request.employeeId &&
            item.leaveTypeId === request.leaveTypeId
        );

        if (allocation) {
          allocation.used = Math.max(
            0,
            allocation.used - request.quantity
          );

          allocation.remaining =
            allocation.allocated - allocation.used;

          allocation.updatedAt =
            new Date().toISOString();
        }
      }

      request.status = "cancelled";
      request.updatedAt =
        new Date().toISOString();

      return res.status(200).json({
        success: true,
        message: "Leave request cancelled",
        request,
      });
    } catch (error) {
      console.error(
        "Cancel leave error:",
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