import type { Payslip } from "@/types/payslip";

const STORAGE_KEY = "peoplepay360_payslips";

function isBrowser() {
  return typeof window !== "undefined";
}

function generateId() {
  return `PS-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase()}`;
}

function emitChange() {
  if (!isBrowser()) return;

  window.dispatchEvent(
    new CustomEvent("peoplepay360:payslips-changed")
  );
}

export function getPayslips(): Payslip[] {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePayslips(payslips: Payslip[]) {
  if (!isBrowser()) return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(payslips)
  );

  emitChange();
}

export function getPayslipById(
  id: string
): Payslip | null {
  return (
    getPayslips().find(
      (payslip) => payslip.id === id
    ) ?? null
  );
}

export function getPayslipsByPayRun(
  payRunId: string
): Payslip[] {
  return getPayslips().filter(
    (payslip) => payslip.payRunId === payRunId
  );
}

export function getPayslipsByEmployee(
  employeeId: string
): Payslip[] {
  return getPayslips().filter(
    (payslip) => payslip.employeeId === employeeId
  );
}

export function createPayslip(
  data: Omit<
    Payslip,
    "id" | "createdAt" | "updatedAt"
  >
): Payslip {
  const now = new Date().toISOString();

  const payslip: Payslip = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };

  const payslips = getPayslips();

  savePayslips([...payslips, payslip]);

  return payslip;
}

export function updatePayslip(
  id: string,
  updates: Partial<Payslip>
): Payslip | null {
  const payslips = getPayslips();

  const index = payslips.findIndex(
    (payslip) => payslip.id === id
  );

  if (index === -1) return null;

  const updated: Payslip = {
    ...payslips[index],
    ...updates,
    id: payslips[index].id,
    updatedAt: new Date().toISOString(),
  };

  payslips[index] = updated;

  savePayslips(payslips);

  return updated;
}

export function deletePayslip(
  id: string
): boolean {
  const payslips = getPayslips();

  const filtered = payslips.filter(
    (payslip) => payslip.id !== id
  );

  if (filtered.length === payslips.length) {
    return false;
  }

  savePayslips(filtered);

  return true;
}

export function subscribeToPayslipChanges(
  callback: () => void
) {
  if (!isBrowser()) {
    return () => {};
  }

  const handler = () => callback();

  window.addEventListener(
    "peoplepay360:payslips-changed",
    handler
  );

  return () => {
    window.removeEventListener(
      "peoplepay360:payslips-changed",
      handler
    );
  };
}