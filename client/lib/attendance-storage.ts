import type { AttendanceRecord } from "@/types/attendance";

const ATTENDANCE_KEY = "peoplepay360_attendance";

export function getAttendanceRecords(): AttendanceRecord[] {
    if (typeof window === "undefined") {
        return [];
    }

    const stored = localStorage.getItem(ATTENDANCE_KEY);

    if (!stored) {
        return [];
    }

    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

export function getAttendanceForDate(
    date: string
): AttendanceRecord[] {
    return getAttendanceRecords().filter(
        (record) => record.date === date
    );
}

export function saveAttendance(
    record: AttendanceRecord
): AttendanceRecord {
    const records = getAttendanceRecords();

    const existingIndex = records.findIndex(
        (item) =>
            item.employeeId === record.employeeId &&
            item.date === record.date
    );

    if (existingIndex >= 0) {
        const updatedRecords = [...records];
        updatedRecords[existingIndex] = record;
        localStorage.setItem(
            ATTENDANCE_KEY,
            JSON.stringify(updatedRecords)
        );
        return record;
    }

    localStorage.setItem(
        ATTENDANCE_KEY,
        JSON.stringify([...records, record])
    );

    return record;
}

export function subscribeToAttendanceChanges(
    listener: () => void
) {
    const handler = () => listener();

    window.addEventListener("peoplepay360-attendance-updated", handler);
    window.addEventListener("storage", handler);

    return () => {
        window.removeEventListener(
            "peoplepay360-attendance-updated",
            handler
        );
        window.removeEventListener("storage", handler);
    };
}