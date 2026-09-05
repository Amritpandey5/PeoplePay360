import type { PayRun } from "@/types/pay-run";

const PAY_RUNS_KEY = "peoplepay360_pay_runs";

export function getPayRuns(): PayRun[] {
    if (typeof window === "undefined") {
        return [];
    }

    const stored = localStorage.getItem(PAY_RUNS_KEY);

    if (!stored) {
        return [];
    }

    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

export function savePayRuns(payRuns: PayRun[]) {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem(PAY_RUNS_KEY, JSON.stringify(payRuns));
}

export function createPayRun(
    payRunData: Omit<PayRun, "id" | "createdAt">
): PayRun {
    const payRuns = getPayRuns();
    const payRun: PayRun = {
        ...payRunData,
        id: `PAY-${String(payRuns.length + 1).padStart(4, "0")}`,
        createdAt: new Date().toISOString(),
    };

    savePayRuns([payRun, ...payRuns]);

    return payRun;
}
