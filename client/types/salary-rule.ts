export type SalaryRuleType =
    | "deduction"
    | "employer_contribution"
    | "earning"
    | "tax";

export type SalaryRuleCalculation =
    | "fixed"
    | "percentage_basic"
    | "percentage_gross"
    | "percentage_ctc"
    | "slab";

export type SalaryRuleFrequency =
    | "monthly"
    | "weekly"
    | "daily"
    | "yearly";

export type SalaryRule = {
    id: string;
    name: string;
    code: string;
    description: string;
    type: SalaryRuleType;
    calculation: SalaryRuleCalculation;
    value: number;
    maximumCap: number | null;
    minimumSalary: number | null;
    frequency: SalaryRuleFrequency;
    isStatutory: boolean;
    status: "active" | "inactive";
    effectiveFrom: string;
    priority: number;
    createdAt: string;
};