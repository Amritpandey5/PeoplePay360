export type ScheduleType =
    | "fixed"
    | "shift"
    | "flexible";

export type WeekDay =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

export type ScheduleDay = {
    day: WeekDay;
    enabled: boolean;
    startTime: string;
    endTime: string;
    breakMinutes: number;
};

export type WorkingSchedule = {
    id: string;
    name: string;
    type: ScheduleType;
    days: ScheduleDay[];
    weeklyHours: number;
    employeeIds: string[];
    contractIds: string[];
    isActive: boolean;
    createdAt: string;
};