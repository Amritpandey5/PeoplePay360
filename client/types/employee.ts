export type PaymentBasis =
    | "daily"
    | "weekly"
    | "monthly";

export type UserRole =
    | "employee"
    | "hr_manager"
    | "hr_payroll_user"
    | "hr_payroll_manager"
    | "admin"
    | "Hr_Manager"
    | "Hr_Payroll"
    | "Hr_Payroll_Manager";

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
    employeeId?: string;
    department?: string;
    jobPosition?: string;
    status: "active" | "inactive";
    isActive?: boolean;
    createdAt: string;
};
export type User = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    employeeId?: string;
    isActive: boolean;
    createdAt: string;
    department?: string;
    jobPosition?: string;
};
