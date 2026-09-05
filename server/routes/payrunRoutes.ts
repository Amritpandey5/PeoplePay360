import { Router } from "express";
import type { Request, Response } from "express";
import { randomUUID } from "crypto";

const router = Router();

/* =========================================================
   TYPES
========================================================= */

type PayrunStatus =
  | "draft"
  | "computed"
  | "validated"
  | "paid";

type SalaryLine = {
  code: string;
  name: string;
  category:
    | "BASIC"
    | "ALLOWANCE"
    | "GROSS"
    | "DEDUCTION"
    | "NET";
  amount: number;
};

type PayrunEmployee = {
  employeeId: string;

  basicSalary: number;

  workedDays: number;
  totalWorkingDays: number;

  overtimeHours: number;

  earnings: SalaryLine[];
  deductions: SalaryLine[];

  grossSalary: number;
  totalDeductions: number;
  netSalary: number;

  computedAt?: string;
};

type Payrun = {
  id: string;

  name: string;

  periodStart: string;
  periodEnd: string;

  paymentDate?: string;

  status: PayrunStatus;

  employeeIds: string[];

  employees: PayrunEmployee[];

  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;

  createdAt: string;
  updatedAt: string;

  validatedAt?: string;
  paidAt?: string;
};

/* =========================================================
   IN-MEMORY STORAGE
========================================================= */

const payruns: Payrun[] = [];

/* =========================================================
   HELPERS
========================================================= */

function nowISO(): string {
  return new Date().toISOString();
}

function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function round(value: number, decimals = 2): number {
  return Number(value.toFixed(decimals));
}

function daysBetween(
  startDate: string,
  endDate: string
): number {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const difference =
    end.getTime() - start.getTime();

  return Math.floor(
    difference / (1000 * 60 * 60 * 24)
  ) + 1;
}

function findPayrun(
  id: string
): Payrun | undefined {
  return payruns.find(
    (payrun) => payrun.id === id
  );
}

/*
  Demo salary calculation.

  BASIC = supplied basicSalary
  HRA   = 20% of BASIC
  TA    = ₹3000
  PF    = 12% of BASIC

  Gross = BASIC + HRA + TA
  Net   = Gross - PF
*/

function calculateEmployeeSalary(
  employeeId: string,
  basicSalary: number,
  workedDays: number,
  totalWorkingDays: number,
  overtimeHours: number
): PayrunEmployee {
  const attendanceRatio =
    totalWorkingDays > 0
      ? Math.min(
          1,
          Math.max(
            0,
            workedDays / totalWorkingDays
          )
        )
      : 1;

  const proratedBasic = round(
    basicSalary * attendanceRatio
  );

  const hra = round(
    proratedBasic * 0.2
  );

  const transportAllowance = 3000;

  const overtimeRate =
    basicSalary /
    totalWorkingDays /
    8;

  const overtimeAmount = round(
    overtimeHours * overtimeRate * 1.5
  );

  const grossSalary = round(
    proratedBasic +
      hra +
      transportAllowance +
      overtimeAmount
  );

  const pf = round(
    proratedBasic * 0.12
  );

  const totalDeductions = pf;

  const netSalary = round(
    grossSalary - totalDeductions
  );

  const earnings: SalaryLine[] = [
    {
      code: "BASIC",
      name: "Basic Salary",
      category: "BASIC",
      amount: proratedBasic,
    },
    {
      code: "HRA",
      name: "House Rent Allowance",
      category: "ALLOWANCE",
      amount: hra,
    },
    {
      code: "TA",
      name: "Transport Allowance",
      category: "ALLOWANCE",
      amount: transportAllowance,
    },
  ];

  if (overtimeAmount > 0) {
    earnings.push({
      code: "OT",
      name: "Overtime",
      category: "ALLOWANCE",
      amount: overtimeAmount,
    });
  }

  const deductions: SalaryLine[] = [
    {
      code: "PF",
      name: "Provident Fund",
      category: "DEDUCTION",
      amount: pf,
    },
  ];

  return {
    employeeId,

    basicSalary,

    workedDays,
    totalWorkingDays,

    overtimeHours,

    earnings,
    deductions,

    grossSalary,
    totalDeductions,
    netSalary,

    computedAt: nowISO(),
  };
}

/* =========================================================
   CREATE PAYRUN
   POST /api/payruns
========================================================= */

router.post(
  "/",
  (req: Request, res: Response) => {
    try {
      const body = req.body ?? {};

      const {
        name,
        periodStart,
        periodEnd,
        paymentDate,
        employeeIds,
      } = body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "name is required",
        });
      }

      if (!periodStart || !periodEnd) {
        return res.status(400).json({
          success: false,
          message:
            "periodStart and periodEnd are required",
        });
      }

      if (
        !isValidDate(periodStart) ||
        !isValidDate(periodEnd)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Dates must use YYYY-MM-DD format",
        });
      }

      if (periodEnd < periodStart) {
        return res.status(400).json({
          success: false,
          message:
            "periodEnd cannot be before periodStart",
        });
      }

      if (
        paymentDate &&
        !isValidDate(paymentDate)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "paymentDate must use YYYY-MM-DD format",
        });
      }

      if (
        !Array.isArray(employeeIds) ||
        employeeIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "employeeIds must contain at least one employee",
        });
      }

      const existing = payruns.find(
        (payrun) =>
          payrun.periodStart === periodStart &&
          payrun.periodEnd === periodEnd
      );

      if (existing) {
        return res.status(409).json({
          success: false,
          message:
            "A payrun already exists for this period",
          payrun: existing,
        });
      }

      const uniqueEmployeeIds = [
        ...new Set(employeeIds),
      ];

      const payrun: Payrun = {
        id: randomUUID(),

        name,

        periodStart,
        periodEnd,

        paymentDate,

        status: "draft",

        employeeIds: uniqueEmployeeIds,

        employees: [],

        totalGrossSalary: 0,
        totalDeductions: 0,
        totalNetSalary: 0,

        createdAt: nowISO(),
        updatedAt: nowISO(),
      };

      payruns.push(payrun);

      return res.status(201).json({
        success: true,
        message: "Payrun created successfully",
        payrun,
      });
    } catch (error) {
      console.error(
        "Create payrun error:",
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
   GET ALL PAYRUNS
   GET /api/payruns
========================================================= */

router.get(
  "/",
  (req: Request, res: Response) => {
    try {
      const {
        status,
        periodStart,
        periodEnd,
      } = req.query;

      let result = [...payruns];

      if (status) {
        result = result.filter(
          (payrun) =>
            payrun.status === String(status)
        );
      }

      if (periodStart) {
        result = result.filter(
          (payrun) =>
            payrun.periodStart ===
            String(periodStart)
        );
      }

      if (periodEnd) {
        result = result.filter(
          (payrun) =>
            payrun.periodEnd ===
            String(periodEnd)
        );
      }

      result.sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      );

      return res.status(200).json({
        success: true,
        data: result,
        total: result.length,
      });
    } catch (error) {
      console.error(
        "Get payruns error:",
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
   GET SINGLE PAYRUN
   GET /api/payruns/:id
========================================================= */

router.get(
  "/:id",
  (req: Request, res: Response) => {
    try {
      const payrun = findPayrun(String(req.params.id));

      if (!payrun) {
        return res.status(404).json({
          success: false,
          message: "Payrun not found",
        });
      }

      return res.status(200).json({
        success: true,
        payrun,
      });
    } catch (error) {
      console.error(
        "Get payrun error:",
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
   COMPUTE PAYRUN
   POST /api/payruns/:id/compute

   Body:
   {
     "employees": [
       {
         "employeeId": "EMP001",
         "basicSalary": 60000,
         "workedDays": 20,
         "totalWorkingDays": 22,
         "overtimeHours": 4
       }
     ]
   }
========================================================= */

router.post(
  "/:id/compute",
  (req: Request, res: Response) => {
    try {
      const payrun = findPayrun(String(req.params.id));

      if (!payrun) {
        return res.status(404).json({
          success: false,
          message: "Payrun not found",
        });
      }

      if (
        payrun.status === "paid"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Paid payrun cannot be recomputed",
        });
      }

      const body = req.body ?? {};

      const employees = body.employees;

      if (
        !Array.isArray(employees) ||
        employees.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "employees array is required",
        });
      }

      const computedEmployees: PayrunEmployee[] =
        [];

      for (const employee of employees) {
        const {
          employeeId,
          basicSalary,
          workedDays,
          totalWorkingDays,
          overtimeHours = 0,
        } = employee;

        if (!employeeId) {
          return res.status(400).json({
            success: false,
            message:
              "employeeId is required for every employee",
          });
        }

        if (
          typeof basicSalary !== "number" ||
          basicSalary < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid basicSalary for ${employeeId}`,
          });
        }

        if (
          typeof workedDays !== "number" ||
          typeof totalWorkingDays !== "number"
        ) {
          return res.status(400).json({
            success: false,
            message:
              `workedDays and totalWorkingDays are required for ${employeeId}`,
          });
        }

        if (
          workedDays < 0 ||
          totalWorkingDays <= 0 ||
          workedDays > totalWorkingDays
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid attendance values for ${employeeId}`,
          });
        }

        if (
          typeof overtimeHours !== "number" ||
          overtimeHours < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid overtimeHours for ${employeeId}`,
          });
        }

        computedEmployees.push(
          calculateEmployeeSalary(
            employeeId,
            basicSalary,
            workedDays,
            totalWorkingDays,
            overtimeHours
          )
        );
      }

      payrun.employees =
        computedEmployees;

      payrun.employeeIds =
        computedEmployees.map(
          (employee) =>
            employee.employeeId
        );

      payrun.totalGrossSalary =
        round(
          computedEmployees.reduce(
            (sum, employee) =>
              sum + employee.grossSalary,
            0
          )
        );

      payrun.totalDeductions =
        round(
          computedEmployees.reduce(
            (sum, employee) =>
              sum +
              employee.totalDeductions,
            0
          )
        );

      payrun.totalNetSalary =
        round(
          computedEmployees.reduce(
            (sum, employee) =>
              sum + employee.netSalary,
            0
          )
        );

      payrun.status = "computed";
      payrun.updatedAt = nowISO();

      return res.status(200).json({
        success: true,
        message:
          "Payrun computed successfully",
        payrun,
      });
    } catch (error) {
      console.error(
        "Compute payrun error:",
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
   VALIDATE PAYRUN
   POST /api/payruns/:id/validate
========================================================= */

router.post(
  "/:id/validate",
  (req: Request, res: Response) => {
    try {
      const payrun = findPayrun(String(req.params.id));

      if (!payrun) {
        return res.status(404).json({
          success: false,
          message: "Payrun not found",
        });
      }

      if (payrun.status !== "computed") {
        return res.status(400).json({
          success: false,
          message:
            "Only computed payruns can be validated",
        });
      }

      if (payrun.employees.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Payrun has no employee salary calculations",
        });
      }

      const invalidEmployee =
        payrun.employees.find(
          (employee) =>
            employee.netSalary < 0 ||
            employee.grossSalary < 0
        );

      if (invalidEmployee) {
        return res.status(400).json({
          success: false,
          message:
            "Payrun contains invalid salary values",
          employeeId:
            invalidEmployee.employeeId,
        });
      }

      payrun.status = "validated";
      payrun.validatedAt = nowISO();
      payrun.updatedAt = nowISO();

      return res.status(200).json({
        success: true,
        message:
          "Payrun validated successfully",
        payrun,
      });
    } catch (error) {
      console.error(
        "Validate payrun error:",
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
   MARK PAYRUN PAID
   POST /api/payruns/:id/mark-paid
========================================================= */

router.post(
  "/:id/mark-paid",
  (req: Request, res: Response) => {
    try {
      const payrun = findPayrun(String(req.params.id));

      if (!payrun) {
        return res.status(404).json({
          success: false,
          message: "Payrun not found",
        });
      }

      if (payrun.status !== "validated") {
        return res.status(400).json({
          success: false,
          message:
            "Only validated payruns can be marked as paid",
        });
      }

      payrun.status = "paid";
      payrun.paidAt = nowISO();
      payrun.updatedAt = nowISO();

      return res.status(200).json({
        success: true,
        message:
          "Payrun marked as paid successfully",
        payrun,
      });
    } catch (error) {
      console.error(
        "Mark paid error:",
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
   SEND PAYSLIPS
   POST /api/payruns/:id/send-payslips
========================================================= */

router.post(
  "/:id/send-payslips",
  (req: Request, res: Response) => {
    try {
      const payrun = findPayrun(String(req.params.id));

      if (!payrun) {
        return res.status(404).json({
          success: false,
          message: "Payrun not found",
        });
      }

      if (
        payrun.status !== "validated" &&
        payrun.status !== "paid"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payrun must be validated or paid before sending payslips",
        });
      }

      /*
        Email service will be connected later.

        For hackathon:
        We return the list of payslips that are ready.
      */

      const payslips = payrun.employees.map(
        (employee) => ({
          employeeId:
            employee.employeeId,

          payrunId: payrun.id,

          status: "ready_to_send",

          netSalary:
            employee.netSalary,
        })
      );

      return res.status(200).json({
        success: true,
        message:
          "Payslips prepared successfully. Email delivery can be connected to Nodemailer.",
        total: payslips.length,
        payslips,
      });
    } catch (error) {
      console.error(
        "Send payslips error:",
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