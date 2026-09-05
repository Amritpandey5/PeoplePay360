export type PayRunStatus =
    | "draft"
    | "processing"
    | "review"
    | "approved"
    | "locked";

export type PayRunEmployeeStatus =
    | "pending"
    | "calculated"
    | "approved";

export type PayRunEmployee = {
    employeeId: string;
    employeeName: string;
    contractId: string;
    salaryStructureId: string;
    basicSalary: number;
    earnings: number;
    deductions: number;
    employerContributions: number;
    grossSalary: number;
    netSalary: number;
    employerCost: number;
    status: PayRunEmployeeStatus;
};

export type PayRun = {
    id: string;
    name: string;
    periodStart: string;
    periodEnd: string;
    paymentDate: string;
    frequency:
        | "monthly"
        | "weekly"
        | "daily"
        | "yearly";
    employeeIds: string[];
    employees: PayRunEmployee[];
    totalBasic: number;
    totalEarnings: number;
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
    totalEmployerContributions: number;
    totalEmployerCost: number;
    status: PayRunStatus;
    createdAt: string;
};