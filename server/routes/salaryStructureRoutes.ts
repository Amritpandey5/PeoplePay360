import { Router } from "express";
import { randomUUID } from "crypto";

const router = Router();

type SalaryStructureStatus = "active" | "inactive";

interface SalaryStructure {
  id: string;
  name: string;
  code: string;
  description?: string;

  // Salary Rule IDs or codes
  ruleIds: string[];

  // Employees assigned to this salary structure
  employeeIds: string[];

  effectiveFrom: string;
  effectiveTo?: string;

  status: SalaryStructureStatus;

  createdAt: string;
  updatedAt: string;
}

const salaryStructures: SalaryStructure[] = [];

const validStatuses: SalaryStructureStatus[] = [
  "active",
  "inactive",
];

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function findStructure(identifier: string) {
  return salaryStructures.find(
    (structure) =>
      structure.id === identifier ||
      structure.code.toLowerCase() === identifier.toLowerCase()
  );
}

// ======================================================
// CREATE SALARY STRUCTURE
// POST /api/salary-structures
// ======================================================

router.post("/", (req, res) => {
  try {
    const {
      name,
      code,
      description,
      ruleIds = [],
      employeeIds = [],
      effectiveFrom,
      effectiveTo,
      status = "active",
    } = req.body ?? {};

    // Required fields
    if (!name || !code || !effectiveFrom) {
      return res.status(400).json({
        success: false,
        message: "name, code and effectiveFrom are required",
      });
    }

    // Validate arrays
    if (!Array.isArray(ruleIds)) {
      return res.status(400).json({
        success: false,
        message: "ruleIds must be an array",
      });
    }

    if (!Array.isArray(employeeIds)) {
      return res.status(400).json({
        success: false,
        message: "employeeIds must be an array",
      });
    }

    // Validate status
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use active or inactive",
      });
    }

    // Validate dates
    if (!isValidDate(effectiveFrom)) {
      return res.status(400).json({
        success: false,
        message: "effectiveFrom must be in YYYY-MM-DD format",
      });
    }

    if (effectiveTo && !isValidDate(effectiveTo)) {
      return res.status(400).json({
        success: false,
        message: "effectiveTo must be in YYYY-MM-DD format",
      });
    }

    if (effectiveTo && effectiveTo < effectiveFrom) {
      return res.status(400).json({
        success: false,
        message: "effectiveTo cannot be before effectiveFrom",
      });
    }

    const normalizedCode = normalizeCode(code);

    // Duplicate code
    const existingCode = salaryStructures.find(
      (structure) => structure.code === normalizedCode
    );

    if (existingCode) {
      return res.status(409).json({
        success: false,
        message: `Salary structure code already exists: ${normalizedCode}`,
      });
    }

    // Remove duplicate rule IDs
    const uniqueRuleIds = [...new Set(ruleIds)];

    // Remove duplicate employees
    const uniqueEmployeeIds = [...new Set(employeeIds)];

    // Prevent overlapping active structures for same employee
    if (status === "active" && uniqueEmployeeIds.length > 0) {
      for (const employeeId of uniqueEmployeeIds) {
        const overlapping = salaryStructures.find((structure) => {
          if (
            structure.status !== "active" ||
            !structure.employeeIds.includes(employeeId)
          ) {
            return false;
          }

          const existingStart = structure.effectiveFrom;
          const existingEnd =
            structure.effectiveTo ?? "9999-12-31";

          const newEnd =
            effectiveTo ?? "9999-12-31";

          return (
            effectiveFrom <= existingEnd &&
            newEnd >= existingStart
          );
        });

        if (overlapping) {
          return res.status(409).json({
            success: false,
            message:
              `Employee ${employeeId} already has an active salary structure during this period`,
            existingStructure: {
              id: overlapping.id,
              code: overlapping.code,
              name: overlapping.name,
            },
          });
        }
      }
    }

    const now = new Date().toISOString();

    const structure: SalaryStructure = {
      id: randomUUID(),
      name: name.trim(),
      code: normalizedCode,
      ...(description
        ? { description: description.trim() }
        : {}),
      ruleIds: uniqueRuleIds,
      employeeIds: uniqueEmployeeIds,
      effectiveFrom,
      ...(effectiveTo ? { effectiveTo } : {}),
      status,
      createdAt: now,
      updatedAt: now,
    };

    salaryStructures.push(structure);

    return res.status(201).json({
      success: true,
      message: "Salary structure created successfully",
      salaryStructure: structure,
    });
  } catch (error) {
    console.error("Create salary structure error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ======================================================
// GET ALL SALARY STRUCTURES
// GET /api/salary-structures
// ======================================================

router.get("/", (req, res) => {
  try {
    const {
      search,
      status,
      employeeId,
      effectiveDate,
    } = req.query;

    let result = [...salaryStructures];

    // Search
    if (search) {
      const searchText = String(search).toLowerCase();

      result = result.filter(
        (structure) =>
          structure.name.toLowerCase().includes(searchText) ||
          structure.code.toLowerCase().includes(searchText) ||
          structure.description
            ?.toLowerCase()
            .includes(searchText)
      );
    }

    // Status
    if (status) {
      result = result.filter(
        (structure) =>
          structure.status === String(status).toLowerCase()
      );
    }

    // Employee
    if (employeeId) {
      result = result.filter((structure) =>
        structure.employeeIds.includes(String(employeeId))
      );
    }

    // Effective date
    if (effectiveDate) {
      const date = String(effectiveDate);

      result = result.filter((structure) => {
        const startsBefore = structure.effectiveFrom <= date;
        const endsAfter =
          !structure.effectiveTo ||
          structure.effectiveTo >= date;

        return startsBefore && endsAfter;
      });
    }

    // Latest structures first
    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    return res.status(200).json({
      success: true,
      data: result,
      total: result.length,
    });
  } catch (error) {
    console.error("Get salary structures error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ======================================================
// GET SINGLE SALARY STRUCTURE
// GET /api/salary-structures/:id
// ======================================================

router.get("/:id", (req, res) => {
  try {
    const structure = findStructure(req.params.id);

    if (!structure) {
      return res.status(404).json({
        success: false,
        message: "Salary structure not found",
      });
    }

    return res.status(200).json({
      success: true,
      salaryStructure: structure,
    });
  } catch (error) {
    console.error("Get salary structure error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ======================================================
// UPDATE SALARY STRUCTURE
// PATCH /api/salary-structures/:id
// ======================================================

router.patch("/:id", (req, res) => {
  try {
    const structure = findStructure(req.params.id);

    if (!structure) {
      return res.status(404).json({
        success: false,
        message: "Salary structure not found",
      });
    }

    const {
      name,
      code,
      description,
      ruleIds,
      employeeIds,
      effectiveFrom,
      effectiveTo,
      status,
    } = req.body ?? {};

    // NAME
    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({
          success: false,
          message: "name cannot be empty",
        });
      }

      structure.name = String(name).trim();
    }

    // CODE
    if (code !== undefined) {
      const normalizedCode = normalizeCode(code);

      const duplicate = salaryStructures.find(
        (item) =>
          item.code === normalizedCode &&
          item.id !== structure.id
      );

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            `Salary structure code already exists: ${normalizedCode}`,
        });
      }

      structure.code = normalizedCode;
    }

    // DESCRIPTION
    if (description !== undefined) {
      structure.description = String(description).trim();
    }

    // RULE IDS
    if (ruleIds !== undefined) {
      if (!Array.isArray(ruleIds)) {
        return res.status(400).json({
          success: false,
          message: "ruleIds must be an array",
        });
      }

      structure.ruleIds = [...new Set(ruleIds)];
    }

    // EMPLOYEE IDS
    if (employeeIds !== undefined) {
      if (!Array.isArray(employeeIds)) {
        return res.status(400).json({
          success: false,
          message: "employeeIds must be an array",
        });
      }

      structure.employeeIds = [...new Set(employeeIds)];
    }

    // EFFECTIVE FROM
    if (effectiveFrom !== undefined) {
      if (!isValidDate(effectiveFrom)) {
        return res.status(400).json({
          success: false,
          message:
            "effectiveFrom must be in YYYY-MM-DD format",
        });
      }

      structure.effectiveFrom = effectiveFrom;
    }

    // EFFECTIVE TO
    if (effectiveTo !== undefined) {
      if (effectiveTo !== null && !isValidDate(effectiveTo)) {
        return res.status(400).json({
          success: false,
          message:
            "effectiveTo must be YYYY-MM-DD or null",
        });
      }

      structure.effectiveTo = effectiveTo || undefined;
    }

    // Validate date range
    if (
      structure.effectiveTo &&
      structure.effectiveTo < structure.effectiveFrom
    ) {
      return res.status(400).json({
        success: false,
        message:
          "effectiveTo cannot be before effectiveFrom",
      });
    }

    // STATUS
    if (status !== undefined) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Use active or inactive",
        });
      }

      structure.status = status;
    }

    // Check active employee overlap after update
    if (
      structure.status === "active" &&
      structure.employeeIds.length > 0
    ) {
      for (const employeeId of structure.employeeIds) {
        const overlapping = salaryStructures.find((item) => {
          if (
            item.id === structure.id ||
            item.status !== "active" ||
            !item.employeeIds.includes(employeeId)
          ) {
            return false;
          }

          const existingEnd =
            item.effectiveTo ?? "9999-12-31";

          const currentEnd =
            structure.effectiveTo ?? "9999-12-31";

          return (
            structure.effectiveFrom <= existingEnd &&
            currentEnd >= item.effectiveFrom
          );
        });

        if (overlapping) {
          return res.status(409).json({
            success: false,
            message:
              `Employee ${employeeId} already has another active salary structure during this period`,
            existingStructure: {
              id: overlapping.id,
              code: overlapping.code,
              name: overlapping.name,
            },
          });
        }
      }
    }

    structure.updatedAt = new Date().toISOString();

    return res.status(200).json({
      success: true,
      message: "Salary structure updated successfully",
      salaryStructure: structure,
    });
  } catch (error) {
    console.error("Update salary structure error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ======================================================
// DELETE SALARY STRUCTURE
// DELETE /api/salary-structures/:id
// ======================================================

router.delete("/:id", (req, res) => {
  try {
    const index = salaryStructures.findIndex(
      (structure) =>
        structure.id === req.params.id ||
        structure.code.toLowerCase() ===
          req.params.id.toLowerCase()
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Salary structure not found",
      });
    }

    const structure = salaryStructures[index];

    salaryStructures.splice(index, 1);

    return res.status(200).json({
      success: true,
      message: "Salary structure deleted successfully",
      salaryStructure: structure,
    });
  } catch (error) {
    console.error("Delete salary structure error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;