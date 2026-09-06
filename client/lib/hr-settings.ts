export type HRSettings = {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  timezone: string;
  currency: string;

  payrollEnabled: boolean;
  defaultPayFrequency: "monthly" | "weekly" | "daily" | "yearly";

  attendanceEnabled: boolean;
  leaveManagementEnabled: boolean;

  emailNotifications: boolean;
  payslipNotifications: boolean;
  leaveNotifications: boolean;

  updatedAt: string;
};