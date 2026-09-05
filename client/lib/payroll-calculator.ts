import type { PayRunEmployee } from "@/types/pay-run";

export type PayrollCalculationInput = {
    employeeId: string;
    employeeName: string;
    contractId: string;
    salaryStructureId: string;
    basicSalary: number;
    earnings: number;
    deductions: number;
    employerContributions: number;
};

export function calculateEmployeePayroll(
    input: PayrollCalculationInput
): PayRunEmployee {
    const grossSalary =
        input.basicSalary +
        input.earnings;

    const netSalary =
        grossSalary -
        input.deductions;

    const employerCost =
        grossSalary +
        input.employerContributions;

    return {
        employeeId: input.employeeId,
        employeeName: input.employeeName,
        contractId: input.contractId,
        salaryStructureId: input.salaryStructureId,
        basicSalary: input.basicSalary,
        earnings: input.earnings,
        deductions: input.deductions,
        employerContributions:
            input.employerContributions,
        grossSalary,
        netSalary,
        employerCost,
        status: "calculated",
    };
}

export function calculatePayRunTotals(
    employees: PayRunEmployee[]
) {
    return employees.reduce(
        (totals, employee) => {
            totals.basic += employee.basicSalary;
            totals.earnings += employee.earnings;
            totals.gross += employee.grossSalary;
            totals.deductions += employee.deductions;
            totals.employerContributions +=
                employee.employerContributions;
            totals.net += employee.netSalary;
            totals.employerCost +=
                employee.employerCost;

            return totals;
        },
        {
            basic: 0,
            earnings: 0,
            gross: 0,
            deductions: 0,
            employerContributions: 0,
            net: 0,
            employerCost: 0,
        }
    );
}