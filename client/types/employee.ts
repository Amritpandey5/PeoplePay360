export type UserRole =
    | "employee"
    | "hr_manager"
    | "hr_payroll_user"
    | "hr_payroll_manager"
    | "admin";

export type EmployeeType =
    | "permanent"
    | "temporary"
    | "contract"
    | "intern";

export type EmploymentStatus =
    | "active"
    | "probation"
    | "on_leave"
    | "inactive";

export type Employee = {
    id: string;
    employeeId: string;
    fullName: string;
    email: string;
    phone: string;
    parentName: string;
    address: string;
    location: string;
    education: string;
    company: string;
    department: string;
    jobPosition: string;
    hrManagerId: string;
    reportingManagerId: string;
    joiningDate: string;
    employeeType: EmployeeType;
    employmentStatus: EmploymentStatus;
    workEmail: string;
    createdAt: string;
};

export type User = {
    id: string;
    employeeId?: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    passwordConfigured: boolean;
    createdAt: string;
};