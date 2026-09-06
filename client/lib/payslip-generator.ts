// lib/payslip-generator.ts

import type { PayRun } from "@/types/pay-run";
import type {
  Payslip,
  PayslipLine,
} from "@/types/payslip";
import type { Employee } from "@/types/employee";

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function generateLineId(): string {
  return `LINE-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;
}

export function createPayslipFromPayRunEmployee(
  payRun: PayRun,
  employee: Employee,
  payRunEmployee: PayRun["employees"][number]
): Omit<Payslip, "id"> {
  const lines: PayslipLine[] = [];

  /*
   * Basic Salary
   */
  if (payRunEmployee.basicSalary > 0) {
    lines.push({
      id: generateLineId(),
      name: "Basic Salary",
      code: "BASIC",
      type: "earning",
      amount: roundCurrency(
        payRunEmployee.basicSalary
      ),
      isStatutory: false,
    });
  }

  /*
   * Other Earnings
   */
  if (payRunEmployee.earnings > 0) {
    lines.push({
      id: generateLineId(),
      name: "Other Earnings",
      code: "EARNINGS",
      type: "earning",
      amount: roundCurrency(
        payRunEmployee.earnings
      ),
      isStatutory: false,
    });
  }

  /*
   * Deductions
   */
  if (payRunEmployee.deductions > 0) {
    lines.push({
      id: generateLineId(),
      name: "Deductions",
      code: "DEDUCTIONS",
      type: "deduction",
      amount: roundCurrency(
        payRunEmployee.deductions
      ),
      isStatutory: false,
    });
  }

  /*
   * Employer Contributions
   */
  if (
    payRunEmployee.employerContributions > 0
  ) {
    lines.push({
      id: generateLineId(),
      name: "Employer Contributions",
      code: "EMPLOYER_CONTRIBUTION",
      type: "employer_contribution",
      amount: roundCurrency(
        payRunEmployee.employerContributions
      ),
      isStatutory: true,
    });
  }

  const now = new Date().toISOString();

  return {
    payRunId: payRun.id,

    employeeId: employee.id,

    contractId:
      payRunEmployee.contractId,

    salaryStructureId:
      payRunEmployee.salaryStructureId,

    employeeName:
      payRunEmployee.employeeName ||
      employee.name,

    employeeEmail:
      employee.email,

    periodStart:
      payRun.periodStart,

    periodEnd:
      payRun.periodEnd,

    paymentDate:
      payRun.paymentDate,

    frequency:
      payRun.frequency,

    basicSalary: roundCurrency(
      payRunEmployee.basicSalary
    ),

    totalEarnings: roundCurrency(
      payRunEmployee.earnings
    ),

    earnings: roundCurrency(
      payRunEmployee.earnings
    ),

    grossSalary: roundCurrency(
      payRunEmployee.grossSalary
    ),

    totalDeductions: roundCurrency(
      payRunEmployee.deductions
    ),

    deductions: roundCurrency(
      payRunEmployee.deductions
    ),

    netSalary: roundCurrency(
      payRunEmployee.netSalary
    ),

    employerContributions:
      roundCurrency(
        payRunEmployee.employerContributions
      ),

    employerCost: roundCurrency(
      payRunEmployee.employerCost
    ),

    lines,

    status: "generated",

    generatedAt: now,

    createdAt: now,

    updatedAt: now,
  };
}
