export type LeaveStatus =
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled";

export type LeaveType = {
    id: string;
    name: string;
    code: string;
    description: string;
    isPaid: boolean;
    annualAllocation: number;
    carryForward: boolean;
    maxConsecutiveDays: number | null;
    status: "active" | "inactive";
    createdAt: string;
};

export type LeaveRequest = {
    id: string;
    employeeId: string;
    leaveTypeId: string;
    fromDate: string;
    toDate: string;
    totalDays: number;
    reason: string;
    status: LeaveStatus;
    requestedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    rejectionReason?: string;
};

export type LeaveBalance = {
    id: string;
    employeeId: string;
    leaveTypeId: string;
    allocatedDays: number;
    usedDays: number;
    pendingDays: number;
    remainingDays: number;
    year: number;
};