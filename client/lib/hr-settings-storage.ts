import type { HRSettings } from "@/types/hr-settings";

const STORAGE_KEY = "peoplepay360_hr_settings";

const DEFAULT_SETTINGS: HRSettings = {
  companyName: "PeoplePay360",
  companyEmail: "",
  companyPhone: "",
  timezone: "Asia/Kolkata",
  currency: "INR",

  payrollEnabled: true,
  defaultPayFrequency: "monthly",

  attendanceEnabled: true,
  leaveManagementEnabled: true,

  emailNotifications: true,
  payslipNotifications: true,
  leaveNotifications: true,

  updatedAt: new Date().toISOString(),
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function getHRSettings(): HRSettings {
  if (!isBrowser()) {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(DEFAULT_SETTINGS)
      );

      return DEFAULT_SETTINGS;
    }

    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(raw),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveHRSettings(
  settings: HRSettings
): HRSettings {
  const nextSettings: HRSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  if (isBrowser()) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextSettings)
    );

    window.dispatchEvent(
      new CustomEvent("peoplepay360:hr-settings-change")
    );
  }

  return nextSettings;
}

export function resetHRSettings(): HRSettings {
  return saveHRSettings({
    ...DEFAULT_SETTINGS,
    updatedAt: new Date().toISOString(),
  });
}

export function subscribeToHRSettingsChanges(
  callback: (settings: HRSettings) => void
) {
  if (!isBrowser()) {
    return () => {};
  }

  const handler = () => {
    callback(getHRSettings());
  };

  window.addEventListener(
    "peoplepay360:hr-settings-change",
    handler
  );

  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(
      "peoplepay360:hr-settings-change",
      handler
    );

    window.removeEventListener("storage", handler);
  };
}
