import type { PayRun } from "@/types/pay-run";

const PAYRUNS_KEY = "peoplepay360_payruns";

const PAYRUN_CHANGE_EVENT =
  "peoplepay360-payrun-change";

function emitPayRunChange() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new Event(PAYRUN_CHANGE_EVENT)
  );
}

export function getPayRuns(): PayRun[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = localStorage.getItem(PAYRUNS_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(stored);

    return Array.isArray(parsed)
      ? (parsed as PayRun[])
      : [];
  } catch {
    return [];
  }
}

export function savePayRuns(
  payRuns: PayRun[]
): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    PAYRUNS_KEY,
    JSON.stringify(payRuns)
  );

  emitPayRunChange();
}

export function getPayRunById(
  id: string
): PayRun | null {
  return (
    getPayRuns().find(
      (payRun) => payRun.id === id
    ) ?? null
  );
}

export function getPayRunsByStatus(
  status: PayRun["status"]
): PayRun[] {
  return getPayRuns().filter(
    (payRun) => payRun.status === status
  );
}

export function getPayRunsByEmployee(
  employeeId: string
): PayRun[] {
  return getPayRuns().filter(
    (payRun) =>
      payRun.employeeIds.includes(employeeId)
  );
}

export function createPayRun(
  payRunData: Omit<PayRun, "id" | "createdAt"> &
    Partial<Pick<PayRun, "createdAt">>
): PayRun {
  const payRuns = getPayRuns();

  const existingNumbers = payRuns
    .map((payRun) => {
      const match =
        payRun.id.match(/^PAY-(\d+)$/);

      return match
        ? Number(match[1])
        : 0;
    })
    .filter((number) => number > 0);

  const nextNumber =
    existingNumbers.length > 0
      ? Math.max(...existingNumbers) + 1
      : 1;

  const payRun: PayRun = {
    ...payRunData,
    id: `PAY-${String(nextNumber).padStart(4, "0")}`,
    createdAt: payRunData.createdAt ?? new Date().toISOString(),
  };

  savePayRuns([
    ...payRuns,
    payRun,
  ]);

  return payRun;
}

export function updatePayRun(
  id: string,
  payRunData: Partial<
    Omit<PayRun, "id" | "createdAt">
  >
): PayRun | null {
  const payRuns = getPayRuns();

  const index = payRuns.findIndex(
    (payRun) => payRun.id === id
  );

  if (index === -1) {
    return null;
  }

  const updatedPayRun: PayRun = {
    ...payRuns[index],
    ...payRunData,
  };

  const updatedPayRuns = [
    ...payRuns,
  ];

  updatedPayRuns[index] =
    updatedPayRun;

  savePayRuns(updatedPayRuns);

  return updatedPayRun;
}

export function deletePayRun(
  id: string
): boolean {
  const payRuns = getPayRuns();

  const exists = payRuns.some(
    (payRun) => payRun.id === id
  );

  if (!exists) {
    return false;
  }

  const updatedPayRuns =
    payRuns.filter(
      (payRun) => payRun.id !== id
    );

  savePayRuns(updatedPayRuns);

  return true;
}

export function subscribeToPayRunChanges(
  callback: () => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => callback();

  window.addEventListener(
    PAYRUN_CHANGE_EVENT,
    handler
  );

  window.addEventListener(
    "storage",
    handler
  );

  return () => {
    window.removeEventListener(
      PAYRUN_CHANGE_EVENT,
      handler
    );

    window.removeEventListener(
      "storage",
      handler
    );
  };
}
