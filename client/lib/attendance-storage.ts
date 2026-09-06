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

export const getAttendanceByDate = getAttendanceForDate;

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

export function upsertAttendance(
    record: Omit<AttendanceRecord, "id" | "workingHours"> & {
        id?: string;
        workingHours?: number;
    }
): AttendanceRecord {
    const attendanceRecord: AttendanceRecord = {
        ...record,
        id:
            record.id ||
            `ATT-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,
        workingHours: record.workingHours ?? 0,
    };

    return saveAttendance(attendanceRecord);
}

export function deleteAttendance(id: string): boolean {
    const records = getAttendanceRecords();
    const nextRecords = records.filter(
        (record) => record.id !== id
    );

    if (nextRecords.length === records.length) {
        return false;
    }

    localStorage.setItem(
        ATTENDANCE_KEY,
        JSON.stringify(nextRecords)
    );

    window.dispatchEvent(
        new Event("peoplepay360-attendance-updated")
    );

    return true;
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
