export type ContractType =
    | "permanent"
    | "fixed_term"
    | "probation"
    | "internship"
    | "part_time";

export type ContractStatus =
    | "active"
    | "upcoming"
    | "expired";

export type Contract = {
    id: string;
    employeeId: string;
    contractType: ContractType;
    jobTitle: string;
    startDate: string;
    endDate: string;
    salary: number;
    notes: string;
    createdAt: string;
};