export type PayslipStatus = "draft" | "generated" | "finalized";

export type PayslipLine = {
  id: string;
  name: string;
  code: string;
  type: "earning" | "deduction" | "employer_contribution";
  amount: number;
  isStatutory: boolean;
};

export type Payslip = {
  id: string;

  payRunId: string;

  employeeId: string;
  employeeName: string;
  employeeEmail?: string;

  contractId: string;
  salaryStructureId: string;

  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  frequency?: "monthly" | "weekly" | "daily" | "yearly";

  basicSalary: number;
  earnings: number;
  totalEarnings?: number;
  deductions: number;
  totalDeductions?: number;
  employerContributions: number;

  grossSalary: number;
  netSalary: number;
  employerCost: number;

  status: PayslipStatus;
  lines?: PayslipLine[];

  generatedAt: string;
  finalizedAt?: string;

  createdAt: string;
  updatedAt: string;
};
