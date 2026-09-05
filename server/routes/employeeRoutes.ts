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

function getQueryString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  return undefined;
}

function findDepartmentIndex(idOrCode: string): number {
  return departments.findIndex(
    (department) =>
      department.id === idOrCode ||
      department.code.toLowerCase() === idOrCode.toLowerCase()
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
      status = "active",
    } = req.body ?? {};

    /* -------------------------
       REQUIRED FIELDS
    ------------------------- */

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Department name and code are required",
      });
    }

    const cleanName = String(name).trim();
    const cleanCode = String(code).trim().toUpperCase();

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: "Department name cannot be empty",
      });
    }

    if (!cleanCode) {
      return res.status(400).json({
        success: false,
        message: "Department code cannot be empty",
      });
    }

    /* -------------------------
       VALIDATE STATUS
    ------------------------- */

    if (status !== "active" && status !== "inactive") {
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
        department.name.toLowerCase() === cleanName.toLowerCase()
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
        department.code.toLowerCase() === cleanCode.toLowerCase()
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

    const now = new Date().toISOString();

    const department: Department = {
      id: randomUUID(),
      name: cleanName,
      code: cleanCode,
      ...(description !== undefined && {
        description: String(description).trim(),
      }),
      ...(managerId !== undefined && {
        managerId: String(managerId).trim(),
      }),
      status,
      createdAt: now,
      updatedAt: now,
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
    const search = getQueryString(req.query.search);
    const status = getQueryString(req.query.status);

    let result = [...departments];

    /* -------------------------
       SEARCH
    ------------------------- */

    if (search) {
      const searchText = search.toLowerCase();

      result = result.filter((department) => {
        return (
          department.name.toLowerCase().includes(searchText) ||
          department.code.toLowerCase().includes(searchText) ||
          department.description
            ?.toLowerCase()
            .includes(searchText)
        );
      });
    }

    /* -------------------------
       STATUS FILTER
    ------------------------- */

    if (status) {
      if (status !== "active" && status !== "inactive") {
        return res.status(400).json({
          success: false,
          message: "Status must be active or inactive",
        });
      }

      result = result.filter(
        (department) => department.status === status
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
    const { id } = req.params;

    const departmentIndex = findDepartmentIndex(String(id));

    if (departmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const department = departments[departmentIndex];

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
    const { id } = req.params;

    const departmentIndex = findDepartmentIndex(String(id));

    if (departmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const existingDepartment = departments[departmentIndex];

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

    /* =====================================================
       NAME VALIDATION
    ===================================================== */

    let finalName = existingDepartment.name;

    if (name !== undefined) {
      finalName = String(name).trim();

      if (!finalName) {
        return res.status(400).json({
          success: false,
          message: "Department name cannot be empty",
        });
      }

      const duplicateName = departments.find(
        (department, index) =>
          index !== departmentIndex &&
          department.name.toLowerCase() === finalName.toLowerCase()
      );

      if (duplicateName) {
        return res.status(409).json({
          success: false,
          message: "Department name already exists",
        });
      }
    }

    /* =====================================================
       CODE VALIDATION
    ===================================================== */

    let finalCode = existingDepartment.code;

    if (code !== undefined) {
      finalCode = String(code).trim().toUpperCase();

      if (!finalCode) {
        return res.status(400).json({
          success: false,
          message: "Department code cannot be empty",
        });
      }

      const duplicateCode = departments.find(
        (department, index) =>
          index !== departmentIndex &&
          department.code.toLowerCase() === finalCode.toLowerCase()
      );

      if (duplicateCode) {
        return res.status(409).json({
          success: false,
          message: "Department code already exists",
        });
      }
    }

    /* =====================================================
       STATUS VALIDATION
    ===================================================== */

    let finalStatus = existingDepartment.status;

    if (status !== undefined) {
      if (status !== "active" && status !== "inactive") {
        return res.status(400).json({
          success: false,
          message: "Status must be active or inactive",
        });
      }

      finalStatus = status;
    }

    /* =====================================================
       UPDATE OBJECT
    ===================================================== */

    const updatedDepartment: Department = {
      ...existingDepartment,

      name: finalName,
      code: finalCode,
      status: finalStatus,

      ...(description !== undefined && {
        description: String(description).trim(),
      }),

      ...(managerId !== undefined && {
        managerId: String(managerId).trim(),
      }),

      updatedAt: new Date().toISOString(),
    };

    departments[departmentIndex] = updatedDepartment;

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
    const { id } = req.params;

    const departmentIndex = findDepartmentIndex(String(id));

    if (departmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const department = departments[departmentIndex];

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    departments.splice(departmentIndex, 1);

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

export default router;