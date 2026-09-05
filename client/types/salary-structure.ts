export type SalaryFrequency =
    | "monthly"
    | "weekly"
    | "daily"
    | "yearly";

export type SalaryComponentType =
    | "earning"
    | "deduction"
    | "employer_contribution";

export type SalaryCalculationType =
    | "fixed"
    | "percentage_basic"
    | "percentage_gross"
    | "percentage_ctc";

export type SalaryComponent = {
    id: string;
    name: string;
    type: SalaryComponentType;
    calculationType: SalaryCalculationType;
    value: number;
    isStatutory: boolean;
};

export type SalaryStructure = {
    id: string;
    name: string;
    code: string;
    description: string;
    frequency: SalaryFrequency;
    annualCtc: number;
    components: SalaryComponent[];
    status: "active" | "inactive";
    employeeIds: string[];
    createdAt: string;
};