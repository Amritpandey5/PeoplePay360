import type {
    ScheduleDay,
    WorkingSchedule,
} from "@/types/working-schedule";

const WORKING_SCHEDULES_KEY =
    "peoplepay360_working_schedules";

export function getWorkingSchedules(): WorkingSchedule[] {
    if (typeof window === "undefined") {
        return [];
    }

    const stored = localStorage.getItem(
        WORKING_SCHEDULES_KEY
    );

    if (!stored) {
        return [];
    }

    try {
        const parsed = JSON.parse(stored);

        return Array.isArray(parsed)
            ? parsed
            : [];
    } catch {
        return [];
    }
}

export function saveWorkingSchedules(
    schedules: WorkingSchedule[]
) {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem(
        WORKING_SCHEDULES_KEY,
        JSON.stringify(schedules)
    );

    window.dispatchEvent(
        new Event(
            "peoplepay360-working-schedules-updated"
        )
    );
}

export function calculateDayHours(
    day: ScheduleDay
): number {
    if (
        !day.enabled ||
        !day.startTime ||
        !day.endTime
    ) {
        return 0;
    }

    const [startHour, startMinute] =
        day.startTime.split(":").map(Number);

    const [endHour, endMinute] =
        day.endTime.split(":").map(Number);

    let startMinutes =
        startHour * 60 + startMinute;

    let endMinutes =
        endHour * 60 + endMinute;

    if (endMinutes <= startMinutes) {
        endMinutes += 24 * 60;
    }

    const breakMinutes =
        Number(day.breakMinutes) || 0;

    const workingMinutes =
        endMinutes -
        startMinutes -
        breakMinutes;

    if (workingMinutes <= 0) {
        return 0;
    }

    return workingMinutes / 60;
}

export function calculateWeeklyHours(
    days: ScheduleDay[]
): number {
    return days.reduce(
        (total, day) =>
            total + calculateDayHours(day),
        0
    );
}

export function createWorkingSchedule(
    scheduleData: Omit<
        WorkingSchedule,
        "id" | "createdAt" | "weeklyHours"
    >
): WorkingSchedule {
    const schedules =
        getWorkingSchedules();

    const schedule: WorkingSchedule = {
        ...scheduleData,
        id: `SCH-${String(
            schedules.length + 1
        ).padStart(4, "0")}`,
        weeklyHours:
            calculateWeeklyHours(
                scheduleData.days
            ),
        createdAt:
            new Date().toISOString(),
    };

    saveWorkingSchedules([
        ...schedules,
        schedule,
    ]);

    return schedule;
}

export function updateWorkingSchedule(
    id: string,
    updates: Partial<
        Omit<
            WorkingSchedule,
            "id" | "createdAt"
        >
    >
) {
    const schedules =
        getWorkingSchedules();

    const index =
        schedules.findIndex(
            (schedule) =>
                schedule.id === id
        );

    if (index === -1) {
        return null;
    }

    const current =
        schedules[index];

    const updated: WorkingSchedule = {
        ...current,
        ...updates,
        weeklyHours: updates.days
            ? calculateWeeklyHours(
                  updates.days
              )
            : current.weeklyHours,
    };

    const nextSchedules = [
        ...schedules,
    ];

    nextSchedules[index] =
        updated;

    saveWorkingSchedules(
        nextSchedules
    );

    return updated;
}

export function deleteWorkingSchedule(
    id: string
) {
    const schedules =
        getWorkingSchedules();

    const updatedSchedules =
        schedules.filter(
            (schedule) =>
                schedule.id !== id
        );

    saveWorkingSchedules(
        updatedSchedules
    );
}

export function subscribeToWorkingScheduleChanges(
    listener: () => void
) {
    if (typeof window === "undefined") {
        return () => {};
    }

    const customEventHandler = () =>
        listener();

    const storageEventHandler = () =>
        listener();

    window.addEventListener(
        "peoplepay360-working-schedules-updated",
        customEventHandler
    );

    window.addEventListener(
        "storage",
        storageEventHandler
    );

    return () => {
        window.removeEventListener(
            "peoplepay360-working-schedules-updated",
            customEventHandler
        );

        window.removeEventListener(
            "storage",
            storageEventHandler
        );
    };
}