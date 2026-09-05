import { Router } from "express";
import { randomUUID } from "crypto";

const router = Router();

type SalaryRuleCategory =
  | "BASIC"
  | "ALLOWANCE"
  | "GROSS"
  | "DEDUCTION"
  | "NET";

type SalaryRuleType = "FIXED" | "PERCENTAGE" | "FORMULA";

type SalaryRuleStatus = "active" | "inactive";

interface SalaryRule {
  id: string;
  name: string;
  code: string;
  category: SalaryRuleCategory;
  sequence: number;
  type: SalaryRuleType;

  // FIXED -> amount
  // PERCENTAGE -> percentage value
  // FORMULA -> formula expression
  value?: number;
  formula?: string;

  // Rules whose values/formulas are required before
  // calculating this rule.
  dependsOn?: string[];

  description?: string;
  status: SalaryRuleStatus;

  createdAt: string;
  updatedAt: string;
}

const salaryRules: SalaryRule[] = [];

// ======================================================
// HELPERS
// ======================================================

const validCategories: SalaryRuleCategory[] = [
  "BASIC",
  "ALLOWANCE",
  "GROSS",
  "DEDUCTION",
  "NET",
];

const validTypes: SalaryRuleType[] = [
  "FIXED",
  "PERCENTAGE",
  "FORMULA",
];

const validStatuses: SalaryRuleStatus[] = [
  "active",
  "inactive",
];

function isValidCategory(value: string): value is SalaryRuleCategory {
  return validCategories.includes(value as SalaryRuleCategory);
}

function isValidType(value: string): value is SalaryRuleType {
  return validTypes.includes(value as SalaryRuleType);
}

function isValidStatus(value: string): value is SalaryRuleStatus {
  return validStatuses.includes(value as SalaryRuleStatus);
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function findRule(identifier: string) {
  return salaryRules.find(
    (rule) =>
      rule.id === identifier ||
      rule.code.toLowerCase() === identifier.toLowerCase()
  );
}

function validateDependencies(
  dependsOn: string[] | undefined,
  currentRuleId?: string
) {
  if (!dependsOn) {
    return null;
  }

  if (!Array.isArray(dependsOn)) {
    return "dependsOn must be an array";
  }

  for (const dependency of dependsOn) {
    const rule = findRule(dependency);

    if (!rule) {
      return `Dependency rule not found: ${dependency}`;
    }

    if (currentRuleId && rule.id === currentRuleId) {
      return "A salary rule cannot depend on itself";
    }
  }

  return null;
}

// ======================================================
// CREATE SALARY RULE
// POST /api/salary-rules
// ======================================================

router.post("/", (req, res) => {
  try {
    const {
      name,
      code,
      category,
      sequence,
      type,
      value,
      formula,
      dependsOn,
      description,
      status = "active",
    } = req.body ?? {};

    // Required fields
    if (!name || !code || !category || sequence === undefined || !type) {
      return res.status(400).json({
        success: false,
        message:
          "name, code, category, sequence and type are required",
      });
    }

    const normalizedCode = normalizeCode(code);

    // Category validation
    if (!isValidCategory(category)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid category. Use BASIC, ALLOWANCE, GROSS, DEDUCTION or NET",
      });
    }

    // Type validation
    if (!isValidType(type)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid type. Use FIXED, PERCENTAGE or FORMULA",
      });
    }

    // Status validation
    if (!isValidStatus(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use active or inactive",
      });
    }

    // Sequence validation
    if (
      typeof sequence !== "number" ||
      !Number.isInteger(sequence) ||
      sequence < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "sequence must be a positive integer",
      });
    }

    // Duplicate code
    const existingCode = salaryRules.find(
      (rule) => rule.code === normalizedCode
    );

    if (existingCode) {
      return res.status(409).json({
        success: false,
        message: `Salary rule code already exists: ${normalizedCode}`,
      });
    }

    // FIXED validation
    if (type === "FIXED") {
      if (typeof value !== "number" || value < 0) {
        return res.status(400).json({
          success: false,
          message: "FIXED rule requires value >= 0",
        });
      }
    }

    // PERCENTAGE validation
    if (type === "PERCENTAGE") {
      if (
        typeof value !== "number" ||
        value < 0 ||
        value > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "PERCENTAGE value must be between 0 and 100",
        });
      }
    }

    // FORMULA validation
    if (type === "FORMULA") {
      if (!formula || typeof formula !== "string") {
        return res.status(400).json({
          success: false,
          message: "FORMULA rule requires a formula",
        });
      }
    }

    // Dependencies
    const dependencyError = validateDependencies(dependsOn);

    if (dependencyError) {
      return res.status(400).json({
        success: false,
        message: dependencyError,
      });
    }

    const now = new Date().toISOString();

    const rule: SalaryRule = {
      id: randomUUID(),
      name: name.trim(),
      code: normalizedCode,
      category,
      sequence,
      type,
      ...(value !== undefined ? { value } : {}),
      ...(formula ? { formula: formula.trim() } : {}),
      ...(dependsOn ? { dependsOn } : {}),
      ...(description ? { description: description.trim() } : {}),
      status,
      createdAt: now,
      updatedAt: now,
    };

    salaryRules.push(rule);

    return res.status(201).json({
      success: true,
      message: "Salary rule created successfully",
      salaryRule: rule,
    });
  } catch (error) {
    console.error("Create salary rule error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ======================================================
// GET ALL SALARY RULES
// GET /api/salary-rules
// ======================================================

router.get("/", (req, res) => {
  try {
    const {
      search,
      category,
      type,
      status,
    } = req.query;

    let result = [...salaryRules];

    if (search) {
      const searchText = String(search).toLowerCase();

      result = result.filter(
        (rule) =>
          rule.name.toLowerCase().includes(searchText) ||
          rule.code.toLowerCase().includes(searchText) ||
          rule.description?.toLowerCase().includes(searchText)
      );
    }

    if (category) {
      result = result.filter(
        (rule) => rule.category === String(category).toUpperCase()
      );
    }

    if (type) {
      result = result.filter(
        (rule) => rule.type === String(type).toUpperCase()
      );
    }

    if (status) {
      result = result.filter(
        (rule) => rule.status === String(status).toLowerCase()
      );
    }

    // Payroll calculation should always use sequence order
    result.sort((a, b) => a.sequence - b.sequence);

    return res.status(200).json({
      success: true,
      data: result,
      total: result.length,
    });
  } catch (error) {
    console.error("Get salary rules error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ======================================================
// GET SINGLE SALARY RULE
// GET /api/salary-rules/:id
// ======================================================

router.get("/:id", (req, res) => {
  try {
    const rule = findRule(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Salary rule not found",
      });
    }

    return res.status(200).json({
      success: true,
      salaryRule: rule,
    });
  } catch (error) {
    console.error("Get salary rule error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ======================================================
// UPDATE SALARY RULE
// PATCH /api/salary-rules/:id
// ======================================================

router.patch("/:id", (req, res) => {
  try {
    const rule = findRule(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Salary rule not found",
      });
    }

    const {
      name,
      code,
      category,
      sequence,
      type,
      value,
      formula,
      dependsOn,
      description,
      status,
    } = req.body ?? {};

    // CODE
    if (code !== undefined) {
      const normalizedCode = normalizeCode(code);

      const duplicate = salaryRules.find(
        (item) =>
          item.code === normalizedCode &&
          item.id !== rule.id
      );

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Salary rule code already exists: ${normalizedCode}`,
        });
      }

      rule.code = normalizedCode;
    }

    // NAME
    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({
          success: false,
          message: "name cannot be empty",
        });
      }

      rule.name = String(name).trim();
    }

    // CATEGORY
    if (category !== undefined) {
      if (!isValidCategory(category)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid category. Use BASIC, ALLOWANCE, GROSS, DEDUCTION or NET",
        });
      }

      rule.category = category;
    }

    // SEQUENCE
    if (sequence !== undefined) {
      if (
        typeof sequence !== "number" ||
        !Number.isInteger(sequence) ||
        sequence < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "sequence must be a positive integer",
        });
      }

      rule.sequence = sequence;
    }

    // TYPE
    if (type !== undefined) {
      if (!isValidType(type)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid type. Use FIXED, PERCENTAGE or FORMULA",
        });
      }

      rule.type = type;
    }

    // VALUE
    if (value !== undefined) {
      if (rule.type === "FIXED") {
        if (typeof value !== "number" || value < 0) {
          return res.status(400).json({
            success: false,
            message: "FIXED value must be >= 0",
          });
        }
      }

      if (rule.type === "PERCENTAGE") {
        if (
          typeof value !== "number" ||
          value < 0 ||
          value > 100
        ) {
          return res.status(400).json({
            success: false,
            message:
              "PERCENTAGE value must be between 0 and 100",
          });
        }
      }

      rule.value = value;
    }

    // FORMULA
    if (formula !== undefined) {
      if (rule.type === "FORMULA" && !String(formula).trim()) {
        return res.status(400).json({
          success: false,
          message: "Formula cannot be empty",
        });
      }

      rule.formula = String(formula).trim();
    }

    // DEPENDENCIES
    if (dependsOn !== undefined) {
      const dependencyError = validateDependencies(
        dependsOn,
        rule.id
      );

      if (dependencyError) {
        return res.status(400).json({
          success: false,
          message: dependencyError,
        });
      }

      rule.dependsOn = dependsOn;
    }

    // DESCRIPTION
    if (description !== undefined) {
      rule.description = String(description).trim();
    }

    // STATUS
    if (status !== undefined) {
      if (!isValidStatus(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Use active or inactive",
        });
      }

      rule.status = status;
    }

    // Ensure correct fields based on type
    if (rule.type === "FIXED") {
      if (rule.value === undefined) {
        return res.status(400).json({
          success: false,
          message: "FIXED rule requires value",
        });
      }

      delete rule.formula;
    }

    if (rule.type === "PERCENTAGE") {
      if (rule.value === undefined) {
        return res.status(400).json({
          success: false,
          message: "PERCENTAGE rule requires value",
        });
      }

      delete rule.formula;
    }

    if (rule.type === "FORMULA") {
      if (!rule.formula) {
        return res.status(400).json({
          success: false,
          message: "FORMULA rule requires formula",
        });
      }

      delete rule.value;
    }

    rule.updatedAt = new Date().toISOString();

    return res.status(200).json({
      success: true,
      message: "Salary rule updated successfully",
      salaryRule: rule,
    });
  } catch (error) {
    console.error("Update salary rule error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ======================================================
// DELETE SALARY RULE
// DELETE /api/salary-rules/:id
// ======================================================

router.delete("/:id", (req, res) => {
  try {
    const index = salaryRules.findIndex(
      (rule) =>
        rule.id === req.params.id ||
        rule.code.toLowerCase() === req.params.id.toLowerCase()
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Salary rule not found",
      });
    }

 const rule = salaryRules[index];

if (!rule) {
  return res.status(404).json({
    success: false,
    message: "Salary rule not found",
  });
}

    // Prevent deleting a rule used as dependency
  const usedBy = salaryRules.filter(
  (item) =>
    item.dependsOn?.includes(String(rule.id)) ||
    item.dependsOn?.includes(String(rule.code))
);

    if (usedBy.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete this rule because it is used by another salary rule",
        usedBy: usedBy.map((item) => ({
          id: item.id,
          code: item.code,
          name: item.name,
        })),
      });
    }

    salaryRules.splice(index, 1);

    return res.status(200).json({
      success: true,
      message: "Salary rule deleted successfully",
      salaryRule: rule,
    });
  } catch (error) {
    console.error("Delete salary rule error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;