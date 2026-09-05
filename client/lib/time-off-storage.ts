import type {
    LeaveBalance,
    LeaveRequest,
    LeaveType,
} from "@/types/time-off";

const LEAVE_TYPES_KEY =
    "peoplepay360_leave_types";

const LEAVE_REQUESTS_KEY =
    "peoplepay360_leave_requests";

const LEAVE_BALANCES_KEY =
    "peoplepay360_leave_balances";

export function getLeaveTypes(): LeaveType[] {
    if (typeof window === "undefined") {
        return [];
    }

    const stored = localStorage.getItem(
        LEAVE_TYPES_KEY
    );

    if (!stored) {
        return [];
    }

    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

export function saveLeaveTypes(
    leaveTypes: LeaveType[]
) {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem(
        LEAVE_TYPES_KEY,
        JSON.stringify(leaveTypes)
    );
}

export function createLeaveType(
    leaveTypeData: Omit<
        LeaveType,
        "id" | "createdAt"
    >
): LeaveType {
    const leaveTypes = getLeaveTypes();

    const leaveType: LeaveType = {
        ...leaveTypeData,
        id: `LT-${String(
            leaveTypes.length + 1
        ).padStart(4, "0")}`,
        createdAt:
            new Date().toISOString(),
    };

    saveLeaveTypes([
        ...leaveTypes,
        leaveType,
    ]);

    return leaveType;
}

export function updateLeaveType(
    id: string,
    leaveTypeData: Partial<
        Omit<LeaveType, "id" | "createdAt">
    >
): LeaveType | null {
    const leaveTypes = getLeaveTypes();

    const index = leaveTypes.findIndex(
        (leaveType) =>
            leaveType.id === id
    );

    if (index === -1) {
        return null;
    }

    const updatedLeaveType = {
        ...leaveTypes[index],
        ...leaveTypeData,
    };

    const updatedLeaveTypes = [
        ...leaveTypes,
    ];

    updatedLeaveTypes[index] =
        updatedLeaveType;

    saveLeaveTypes(updatedLeaveTypes);

    return updatedLeaveType;
}

export function deleteLeaveType(
    id: string
) {
    const leaveTypes = getLeaveTypes();

    saveLeaveTypes(
        leaveTypes.filter(
            (leaveType) =>
                leaveType.id !== id
        )
    );
}

export function getLeaveRequests(): LeaveRequest[] {
    if (typeof window === "undefined") {
        return [];
    }

    const stored = localStorage.getItem(
        LEAVE_REQUESTS_KEY
    );

    if (!stored) {
        return [];
    }

    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

export function saveLeaveRequests(
    requests: LeaveRequest[]
) {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem(
        LEAVE_REQUESTS_KEY,
        JSON.stringify(requests)
    );
}

export function createLeaveRequest(
    requestData: Omit<
        LeaveRequest,
        "id" | "requestedAt"
    >
): LeaveRequest {
    const requests = getLeaveRequests();

    const request: LeaveRequest = {
        ...requestData,
        id: `LR-${String(
            requests.length + 1
        ).padStart(4, "0")}`,
        requestedAt:
            new Date().toISOString(),
    };

    saveLeaveRequests([
        ...requests,
        request,
    ]);

    return request;
}

export function updateLeaveRequest(
    id: string,
    requestData: Partial<
        Omit<LeaveRequest, "id" | "requestedAt">
    >
): LeaveRequest | null {
    const requests = getLeaveRequests();

    const index = requests.findIndex(
        (request) =>
            request.id === id
    );

    if (index === -1) {
        return null;
    }

    const updatedRequest = {
        ...requests[index],
        ...requestData,
    };

    const updatedRequests = [
        ...requests,
    ];

    updatedRequests[index] =
        updatedRequest;

    saveLeaveRequests(updatedRequests);

    return updatedRequest;
}

export function getLeaveBalances(): LeaveBalance[] {
    if (typeof window === "undefined") {
        return [];
    }

    const stored = localStorage.getItem(
        LEAVE_BALANCES_KEY
    );

    if (!stored) {
        return [];
    }

    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

export function saveLeaveBalances(
    balances: LeaveBalance[]
) {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem(
        LEAVE_BALANCES_KEY,
        JSON.stringify(balances)
    );
}

export function saveLeaveBalance(
    balance: LeaveBalance
) {
    const balances = getLeaveBalances();

    const index = balances.findIndex(
        (item) =>
            item.employeeId ===
                balance.employeeId &&
            item.leaveTypeId ===
                balance.leaveTypeId &&
            item.year === balance.year
    );

    if (index === -1) {
        saveLeaveBalances([
            ...balances,
            balance,
        ]);

        return balance;
    }

    const updatedBalances = [
        ...balances,
    ];

    updatedBalances[index] =
        balance;

    saveLeaveBalances(
        updatedBalances
    );

    return balance;
}

export function getEmployeeLeaveBalances(
    employeeId: string,
    year: number
): LeaveBalance[] {
    return getLeaveBalances().filter(
        (balance) =>
            balance.employeeId ===
                employeeId &&
            balance.year === year
    );
}