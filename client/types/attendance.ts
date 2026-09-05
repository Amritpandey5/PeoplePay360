export type AttendanceStatus =
    | "present"
    | "late"
    | "absent"
    | "working"
    | "not_marked";

export type AttendanceRecord = {
    id: string;
    employeeId: string;
    date: string;
    checkIn: string;
    checkOut: string;
    workingHours: number;
    status: AttendanceStatus;
};