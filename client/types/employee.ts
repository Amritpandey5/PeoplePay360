export type PaymentBasis =
    | "daily"
    | "weekly"
    | "monthly";


export type Gender =
    | "male"
    | "female"
    | "other"
    | "prefer_not_to_say";

export type Employee = {
    id: string;
    name: string;
    email: string;
    phone: string;
    gender: string;
    password: string;
    dateOfJoining: string;
    dateOfBirth: string;
    paymentBasis: PaymentBasis;
    workingHours: number;
    workingDays: number;
    basicSalary: number;
    hra: number;
    allowances: number;
    deductions: number;
    location: string;
    role: string;
    status: "active" | "inactive";
    createdAt: string;
};
export type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    employeeId?: string;
    isActive: boolean;
    createdAt: string;
};