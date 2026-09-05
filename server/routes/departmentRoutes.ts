import { Router } from "express";
import type { Request, Response } from "express";
import { randomUUID } from "crypto";

const router = Router();

/* =========================================================
   TYPES
========================================================= */

type DepartmentStatus = "active" | "inactive";

type Department = {
  id: string;
  name: string;
  code: string;
  description?: string;
  managerId?: string;
  status: DepartmentStatus;
  createdAt: string;
  updatedAt: string;
};

/* =========================================================
   IN-MEMORY STORAGE
========================================================= */

const departments: Department[] = [];

/* =========================================================
   HELPERS
========================================================= */

function nowISO(): string {
  return new Date().toISOString();
}

function normalizeName(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeCode(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

function isValidStatus(value: unknown): value is DepartmentStatus {
  return value === "active" || value === "inactive";
}

function findDepartmentIndex(idOrCode: string): number {
  const value = idOrCode.trim().toLowerCase();

  return departments.findIndex(
    (department) =>
      department.id.toLowerCase() === value ||
      department.code.toLowerCase() === value
  );
}

/* =========================================================
   CREATE DEPARTMENT
   POST /api/departments
========================================================= */

router.post("/", (req: Request, res: Response) => {
  try {
    const {
      name,
      code,
      description,
      managerId,
      status,
    } = req.body ?? {};

    /* -------------------------
       REQUIRED FIELDS
    ------------------------- */

    const departmentName = normalizeName(name);
    const departmentCode = normalizeCode(code);

    if (!departmentName) {
      return res.status(400).json({
        success: false,
        message: "Department name is required",
      });
    }

    if (!departmentCode) {
      return res.status(400).json({
        success: false,
        message: "Department code is required",
      });
    }

    /* -------------------------
       STATUS
    ------------------------- */

    const departmentStatus: DepartmentStatus =
      status === undefined ? "active" : status;

    if (!isValidStatus(departmentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    /* -------------------------
       DUPLICATE NAME
    ------------------------- */

    const duplicateName = departments.find(
      (department) =>
        department.name.toLowerCase() ===
        departmentName.toLowerCase()
    );

    if (duplicateName) {
      return res.status(409).json({
        success: false,
        message: "Department name already exists",
      });
    }

    /* -------------------------
       DUPLICATE CODE
    ------------------------- */

    const duplicateCode = departments.find(
      (department) =>
        department.code.toLowerCase() ===
        departmentCode.toLowerCase()
    );

    if (duplicateCode) {
      return res.status(409).json({
        success: false,
        message: "Department code already exists",
      });
    }

    /* -------------------------
       CREATE
    ------------------------- */

    const timestamp = nowISO();

    const department: Department = {
      id: randomUUID(),
      name: departmentName,
      code: departmentCode,

      ...(description !== undefined && {
        description: String(description).trim(),
      }),

      ...(managerId !== undefined && {
        managerId: String(managerId).trim(),
      }),

      status: departmentStatus,

      createdAt: timestamp,
      updatedAt: timestamp,
    };

    departments.push(department);

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    console.error("Create department error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* =========================================================
   GET ALL DEPARTMENTS
   GET /api/departments
========================================================= */

router.get("/", (req: Request, res: Response) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim().toLowerCase()
        : "";

    const status =
      typeof req.query.status === "string"
        ? req.query.status.trim().toLowerCase()
        : "";

    let result = [...departments];

    /* -------------------------
       SEARCH
    ------------------------- */

    if (search) {
      result = result.filter((department) => {
        return (
          department.name.toLowerCase().includes(search) ||
          department.code.toLowerCase().includes(search) ||
          (department.description ?? "")
            .toLowerCase()
            .includes(search)
        );
      });
    }

    /* -------------------------
       STATUS FILTER
    ------------------------- */

    if (status) {
      result = result.filter(
        (department) =>
          department.status === status
      );
    }

    return res.status(200).json({
      success: true,
      total: result.length,
      departments: result,
    });
  } catch (error) {
    console.error("Get departments error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* =========================================================
   GET SINGLE DEPARTMENT
   GET /api/departments/:id
========================================================= */

router.get("/:id", (req: Request, res: Response) => {
  try {
    const id = String(req.params.id ?? "").trim();

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Department id is required",
      });
    }

    const index = findDepartmentIndex(id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const department = departments[index];

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.status(200).json({
      success: true,
      department,
    });
  } catch (error) {
    console.error("Get department error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* =========================================================
   UPDATE DEPARTMENT
   PATCH /api/departments/:id
========================================================= */

router.patch("/:id", (req: Request, res: Response) => {
  try {
    const id = String(req.params.id ?? "").trim();

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Department id is required",
      });
    }

    const index = findDepartmentIndex(id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const existingDepartment = departments[index];

    if (!existingDepartment) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const {
      name,
      code,
      description,
      managerId,
      status,
    } = req.body ?? {};

    /* -------------------------
       NORMALIZE INPUT
    ------------------------- */

    const finalName =
      name !== undefined
        ? normalizeName(name)
        : existingDepartment.name;

    const finalCode =
      code !== undefined
        ? normalizeCode(code)
        : existingDepartment.code;

    const finalStatus =
      status !== undefined
        ? status
        : existingDepartment.status;

    /* -------------------------
       VALIDATION
    ------------------------- */

    if (!finalName) {
      return res.status(400).json({
        success: false,
        message: "Department name cannot be empty",
      });
    }

    if (!finalCode) {
      return res.status(400).json({
        success: false,
        message: "Department code cannot be empty",
      });
    }

    if (!isValidStatus(finalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    /* -------------------------
       DUPLICATE NAME
    ------------------------- */

    const duplicateName = departments.find(
      (department, departmentIndex) =>
        departmentIndex !== index &&
        department.name.toLowerCase() ===
          finalName.toLowerCase()
    );

    if (duplicateName) {
      return res.status(409).json({
        success: false,
        message: "Department name already exists",
      });
    }

    /* -------------------------
       DUPLICATE CODE
    ------------------------- */

    const duplicateCode = departments.find(
      (department, departmentIndex) =>
        departmentIndex !== index &&
        department.code.toLowerCase() ===
          finalCode.toLowerCase()
    );

    if (duplicateCode) {
      return res.status(409).json({
        success: false,
        message: "Department code already exists",
      });
    }

    /* -------------------------
       BUILD UPDATED OBJECT
    ------------------------- */

    const updatedDepartment: Department = {
      ...existingDepartment,

      name: finalName,
      code: finalCode,
      status: finalStatus,

      ...(name !== undefined && {
        name: finalName,
      }),

      ...(code !== undefined && {
        code: finalCode,
      }),

      ...(description !== undefined && {
        description: String(description).trim(),
      }),

      ...(managerId !== undefined && {
        managerId: String(managerId).trim(),
      }),

      updatedAt: nowISO(),
    };

    /* -------------------------
       UPDATE ARRAY
    ------------------------- */

    departments[index] = updatedDepartment;

    return res.status(200).json({
      success: true,
      message: "Department updated successfully",
      department: updatedDepartment,
    });
  } catch (error) {
    console.error("Update department error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* =========================================================
   DELETE DEPARTMENT
   DELETE /api/departments/:id
========================================================= */

router.delete("/:id", (req: Request, res: Response) => {
  try {
    const id = String(req.params.id ?? "").trim();

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Department id is required",
      });
    }

    const index = findDepartmentIndex(id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const department = departments[index];

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    departments.splice(index, 1);

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully",
      department,
    });
  } catch (error) {
    console.error("Delete department error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* =========================================================
   EXPORT
========================================================= */

export default router;