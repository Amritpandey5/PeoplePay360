
import { Router } from "express";
import type { Request, Response } from "express";
import { randomUUID } from "crypto";

const router = Router();

/* =========================================================
   TYPES
========================================================= */

type Payslip = {
  id: string;

  payrunId: string;

  employeeId: string;

  employeeName: string;

  periodStart: string;
  periodEnd: string;

  paymentDate?: string;

  earnings: {
    code: string;
    name: string;
    amount: number;
  }[];

  deductions: {
    code: string;
    name: string;
    amount: number;
  }[];

  grossSalary: number;
  totalDeductions: number;
  netSalary: number;

  status: "generated" | "sent";

  createdAt: string;
};

/* =========================================================
   IN-MEMORY STORAGE
========================================================= */

const payslips: Payslip[] = [];

/* =========================================================
   HELPERS
========================================================= */

function nowISO(): string {
  return new Date().toISOString();
}

function findPayslip(
  id: string
): Payslip | undefined {
  return payslips.find(
    (payslip) => payslip.id === id
  );
}

/* =========================================================
   GENERATE PAYSLIP
   POST /api/payslips
========================================================= */

router.post(
  "/",
  (req: Request, res: Response) => {
    try {
      const body = req.body ?? {};

      const {
        payrunId,
        employeeId,
        employeeName,
        periodStart,
        periodEnd,
        paymentDate,
        earnings = [],
        deductions = [],
        grossSalary,
        totalDeductions,
        netSalary,
      } = body;

      if (
        !payrunId ||
        !employeeId ||
        !periodStart ||
        !periodEnd
      ) {
        return res.status(400).json({
          success: false,
          message:
            "payrunId, employeeId, periodStart and periodEnd are required",
        });
      }

      if (
        typeof grossSalary !== "number" ||
        typeof totalDeductions !== "number" ||
        typeof netSalary !== "number"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "grossSalary, totalDeductions and netSalary must be numbers",
        });
      }

      const existing = payslips.find(
        (payslip) =>
          payslip.payrunId === payrunId &&
          payslip.employeeId === employeeId
      );

      if (existing) {
        return res.status(409).json({
          success: false,
          message:
            "Payslip already exists for this employee and payrun",
          payslip: existing,
        });
      }

      const payslip: Payslip = {
        id: randomUUID(),

        payrunId,

        employeeId,

        employeeName:
          employeeName || "Employee",

        periodStart,
        periodEnd,

        paymentDate,

        earnings,

        deductions,

        grossSalary,
        totalDeductions,
        netSalary,

        status: "generated",

        createdAt: nowISO(),
      };

      payslips.push(payslip);

      return res.status(201).json({
        success: true,
        message:
          "Payslip generated successfully",
        payslip,
      });
    } catch (error) {
      console.error(
        "Generate payslip error:",
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
   GET ALL PAYSLIPS
   GET /api/payslips
========================================================= */

router.get(
  "/",
  (req: Request, res: Response) => {
    try {
      const {
        employeeId,
        payrunId,
        status,
      } = req.query;

      let result = [...payslips];

      if (employeeId) {
        result = result.filter(
          (payslip) =>
            payslip.employeeId ===
            String(employeeId)
        );
      }

      if (payrunId) {
        result = result.filter(
          (payslip) =>
            payslip.payrunId ===
            String(payrunId)
        );
      }

      if (status) {
        result = result.filter(
          (payslip) =>
            payslip.status ===
            String(status)
        );
      }

      return res.status(200).json({
        success: true,
        data: result,
        total: result.length,
      });
    } catch (error) {
      console.error(
        "Get payslips error:",
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
   GET SINGLE PAYSLIP
   GET /api/payslips/:id
========================================================= */

router.get(
  "/:id",
  (req: Request, res: Response) => {
    try {
      const payslip = findPayslip(
        String(req.params.id)
      );

      if (!payslip) {
        return res.status(404).json({
          success: false,
          message: "Payslip not found",
        });
      }

      return res.status(200).json({
        success: true,
        payslip,
      });
    } catch (error) {
      console.error(
        "Get payslip error:",
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
   PDF RESPONSE
   GET /api/payslips/:id/pdf
========================================================= */

router.get(
  "/:id/pdf",
  (req: Request, res: Response) => {
    try {
      const payslip = findPayslip(
        String(req.params.id)
      );

      if (!payslip) {
        return res.status(404).json({
          success: false,
          message: "Payslip not found",
        });
      }

      /*
        For now we generate a simple HTML payslip.

        Browser can print/save it as PDF.
        In production this can be replaced with
        PDFKit / Puppeteer / another PDF service.
      */

      const earningsHTML =
        payslip.earnings
          .map(
            (earning) => `
              <tr>
                <td>${earning.name}</td>
                <td>₹${earning.amount.toFixed(2)}</td>
              </tr>
            `
          )
          .join("");

      const deductionsHTML =
        payslip.deductions
          .map(
            (deduction) => `
              <tr>
                <td>${deduction.name}</td>
                <td>₹${deduction.amount.toFixed(2)}</td>
              </tr>
            `
          )
          .join("");

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />

  <title>Payslip - ${payslip.employeeId}</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #222;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
    }

    .header h1 {
      margin-bottom: 5px;
    }

    .employee {
      margin-bottom: 25px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }

    th,
    td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }

    th {
      background: #f5f5f5;
    }

    .summary {
      width: 400px;
      margin-left: auto;
    }

    .net {
      font-size: 20px;
      font-weight: bold;
    }

    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>

<body>

  <div class="header">
    <h1>PeoplePay360</h1>
    <h2>Salary Payslip</h2>
  </div>

  <div class="employee">
    <strong>Employee:</strong>
    ${payslip.employeeName}
    <br />

    <strong>Employee ID:</strong>
    ${payslip.employeeId}
    <br />

    <strong>Pay Period:</strong>
    ${payslip.periodStart}
    to
    ${payslip.periodEnd}
    <br />

    <strong>Payment Date:</strong>
    ${payslip.paymentDate || "-"}
  </div>

  <h3>Earnings</h3>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Amount</th>
      </tr>
    </thead>

    <tbody>
      ${earningsHTML}
    </tbody>
  </table>

  <h3>Deductions</h3>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Amount</th>
      </tr>
    </thead>

    <tbody>
      ${deductionsHTML}
    </tbody>
  </table>

  <table class="summary">

    <tr>
      <td>Gross Salary</td>
      <td>₹${payslip.grossSalary.toFixed(2)}</td>
    </tr>

    <tr>
      <td>Total Deductions</td>
      <td>₹${payslip.totalDeductions.toFixed(2)}</td>
    </tr>

    <tr class="net">
      <td>Net Salary</td>
      <td>₹${payslip.netSalary.toFixed(2)}</td>
    </tr>

  </table>

  <div class="footer">
    Generated by PeoplePay360 HR & Payroll System
  </div>

</body>
</html>
      `;

      res.setHeader(
        "Content-Type",
        "text/html"
      );

      return res.status(200).send(html);
    } catch (error) {
      console.error(
        "Payslip PDF error:",
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