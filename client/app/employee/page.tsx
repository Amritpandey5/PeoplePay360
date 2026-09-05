// import {
//   CalendarDays,
//   Clock3,
//   FileText,
//   ArrowUpRight,
//   CheckCircle2,
//   Megaphone,
//   UserRound,
// } from "lucide-react";

// const stats = [
//   {
//     title: "Today's Attendance",
//     value: "Present",
//     subtitle: "Checked in at 09:32 AM",
//     icon: CheckCircle2,
//     iconBg: "bg-emerald-50",
//     iconColor: "text-emerald-600",
//   },
//   {
//     title: "Leave Balance",
//     value: "12 Days",
//     subtitle: "Available this year",
//     icon: CalendarDays,
//     iconBg: "bg-blue-50",
//     iconColor: "text-blue-600",
//   },
//   {
//     title: "Working Hours",
//     value: "7h 24m",
//     subtitle: "Today's working time",
//     icon: Clock3,
//     iconBg: "bg-amber-50",
//     iconColor: "text-amber-600",
//   },
//   {
//     title: "Latest Payslip",
//     value: "₹45,000",
//     subtitle: "August 2026",
//     icon: FileText,
//     iconBg: "bg-violet-50",
//     iconColor: "text-violet-600",
//   },
// ];

// const announcements = [
//   {
//     title: "Independence Day Holiday",
//     description:
//       "The office will remain closed on the upcoming public holiday.",
//     date: "Aug 15, 2026",
//   },
//   {
//     title: "Salary Processing Update",
//     description:
//       "Monthly salary processing has been completed successfully.",
//     date: "Aug 30, 2026",
//   },
//   {
//     title: "Company Policy Update",
//     description:
//       "Please review the latest employee policies and guidelines.",
//     date: "Sep 02, 2026",
//   },
// ];

// export default function EmployeeDashboard() {
//   return (
//     <div className="space-y-6">
//       {/* Welcome Section */}
//       <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
//         <div>
//           <p className="text-sm font-medium text-teal-700">
//             Employee Portal
//           </p>

//           <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
//             Good Morning, Employee 👋
//           </h1>

//           <p className="mt-1 text-sm text-slate-500">
//             Here&apos;s an overview of your work activity.
//           </p>
//         </div>

//         <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
//           <p className="text-xs font-medium text-slate-400">
//             Today
//           </p>
//           <p className="text-sm font-semibold text-slate-800">
//             September 05, 2026
//           </p>
//         </div>
//       </section>

//       {/* Statistics */}
//       <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         {stats.map((stat) => {
//           const Icon = stat.icon;

//           return (
//             <div
//               key={stat.title}
//               className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
//             >
//               <div className="flex items-start justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-slate-500">
//                     {stat.title}
//                   </p>

//                   <h2 className="mt-2 text-2xl font-bold text-slate-900">
//                     {stat.value}
//                   </h2>
//                 </div>

//                 <div
//                   className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBg}`}
//                 >
//                   <Icon size={21} className={stat.iconColor} />
//                 </div>
//               </div>

//               <p className="mt-3 text-xs text-slate-500">
//                 {stat.subtitle}
//               </p>
//             </div>
//           );
//         })}
//       </section>

//       {/* Main Grid */}
//       <section className="grid gap-6 xl:grid-cols-3">
//         {/* Attendance */}
//         <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-lg font-semibold text-slate-900">
//                 Today&apos;s Attendance
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Your attendance activity for today
//               </p>
//             </div>

//             <Clock3 className="text-teal-600" size={22} />
//           </div>

//           <div className="mt-6 grid gap-4 sm:grid-cols-3">
//             <div className="rounded-xl bg-slate-50 p-4">
//               <p className="text-xs font-medium text-slate-500">
//                 Check In
//               </p>

//               <p className="mt-2 text-xl font-bold text-slate-900">
//                 09:32 AM
//               </p>

//               <p className="mt-1 text-xs text-emerald-600">
//                 On time
//               </p>
//             </div>

//             <div className="rounded-xl bg-slate-50 p-4">
//               <p className="text-xs font-medium text-slate-500">
//                 Check Out
//               </p>

//               <p className="mt-2 text-xl font-bold text-slate-900">
//                 —
//               </p>

//               <p className="mt-1 text-xs text-slate-500">
//                 Not checked out
//               </p>
//             </div>

//             <div className="rounded-xl bg-slate-50 p-4">
//               <p className="text-xs font-medium text-slate-500">
//                 Worked
//               </p>

//               <p className="mt-2 text-xl font-bold text-slate-900">
//                 7h 24m
//               </p>

//               <p className="mt-1 text-xs text-slate-500">
//                 Today
//               </p>
//             </div>
//           </div>

//           <button
//             type="button"
//             className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
//           >
//             View Attendance
//             <ArrowUpRight size={17} />
//           </button>
//         </div>

//         {/* Profile Card */}
//         <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//           <div className="flex items-center gap-4">
//             <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-lg font-bold text-white">
//               E
//             </div>

//             <div>
//               <h2 className="font-semibold text-slate-900">
//                 Employee
//               </h2>

//               <p className="text-sm text-slate-500">
//                 Employee ID: EMP001
//               </p>
//             </div>
//           </div>

//           <div className="mt-6 space-y-4">
//             <div>
//               <p className="text-xs text-slate-400">Department</p>
//               <p className="mt-1 text-sm font-medium text-slate-800">
//                 Human Resources
//               </p>
//             </div>

//             <div>
//               <p className="text-xs text-slate-400">Position</p>
//               <p className="mt-1 text-sm font-medium text-slate-800">
//                 Employee
//               </p>
//             </div>

//             <div>
//               <p className="text-xs text-slate-400">Status</p>
//               <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
//                 Active
//               </span>
//             </div>
//           </div>

//           <button
//             type="button"
//             className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
//           >
//             <UserRound size={17} />
//             View Profile
//           </button>
//         </div>
//       </section>

//       {/* Announcements */}
//       <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-lg font-semibold text-slate-900">
//               Recent Announcements
//             </h2>

//             <p className="mt-1 text-sm text-slate-500">
//               Latest updates from your organization
//             </p>
//           </div>

//           <Megaphone className="text-teal-600" size={22} />
//         </div>

//         <div className="mt-5 divide-y divide-slate-100">
//           {announcements.map((announcement) => (
//             <div
//               key={announcement.title}
//               className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
//             >
//               <div>
//                 <h3 className="text-sm font-semibold text-slate-900">
//                   {announcement.title}
//                 </h3>

//                 <p className="mt-1 max-w-2xl text-sm text-slate-500">
//                   {announcement.description}
//                 </p>
//               </div>

//               <p className="shrink-0 text-xs font-medium text-slate-400">
//                 {announcement.date}
//               </p>
//             </div>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// }
"use client";

import {
  CalendarDays,
  Clock3,
  FileText,
  ArrowUpRight,
  CheckCircle2,
  Megaphone,
  UserRound,
  ShieldCheck,
  LogIn,
  LogOut,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "http://localhost:5000";

type AttendanceRecord = {
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status?: "present" | "checked_out";
  verification?: {
    checkInVerified?: boolean;
    checkInClientIp?: string;
    checkInVerifiedAt?: string;
    checkOutVerified?: boolean;
    checkOutClientIp?: string;
    checkOutVerifiedAt?: string;
  };
};

type AttendanceResponse = {
  success?: boolean;
  attendance?: AttendanceRecord | null;
};

type VerificationResponse = {
  success?: boolean;
  verified?: boolean;
  message?: string;
  network?: {
    verified?: boolean;
    clientIp?: string;
  };
};

function getEmployeeId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("employeeId") ||
    localStorage.getItem("employee_id") ||
    localStorage.getItem("userId") ||
    ""
  );
}

function formatTime(dateString?: string) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getWorkedMilliseconds(attendance: AttendanceRecord | null) {
  if (!attendance?.checkIn) {
    return 0;
  }

  const checkIn = new Date(attendance.checkIn).getTime();

  if (Number.isNaN(checkIn)) {
    return 0;
  }

  const checkOut = attendance.checkOut
    ? new Date(attendance.checkOut).getTime()
    : Date.now();

  if (Number.isNaN(checkOut)) {
    return 0;
  }

  return Math.max(0, checkOut - checkIn);
}

function formatWorkedTime(milliseconds: number) {
  const totalMinutes = Math.floor(milliseconds / 60000);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

export default function EmployeeDashboard() {
  const [employeeId, setEmployeeId] = useState("");

  const [attendance, setAttendance] =
    useState<AttendanceRecord | null>(null);

  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "checking" | "verified" | "failed"
  >("idle");

  const [verificationMessage, setVerificationMessage] = useState("");

  const [actionLoading, setActionLoading] = useState<
    "check-in" | "check-out" | null
  >(null);

  const [attendanceLoading, setAttendanceLoading] = useState(true);

  const [workedMilliseconds, setWorkedMilliseconds] = useState(0);

  const [error, setError] = useState("");

  const today = useMemo(() => new Date(), []);

  /*
   * Get logged-in employee ID
   */
  useEffect(() => {
    setEmployeeId(getEmployeeId());
  }, []);

  /*
   * Load today's attendance
   */
  const loadTodayAttendance = async () => {
    const id = getEmployeeId();

    if (!id) {
      setAttendanceLoading(false);
      setAttendance(null);
      return;
    }

    try {
      setAttendanceLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/attendance/today/${encodeURIComponent(id)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data: AttendanceResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.success === false
            ? "Unable to load today's attendance."
            : `Request failed with status ${response.status}.`
        );
      }

      setAttendance(data.attendance || null);
    } catch (err) {
      console.error("Attendance loading error:", err);

      setError(
        "Unable to connect to the attendance server."
      );

      setAttendance(null);
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    if (!employeeId) {
      setAttendanceLoading(false);
      return;
    }

    loadTodayAttendance();
  }, [employeeId]);

  /*
   * Live worked-hours counter
   */
  useEffect(() => {
    if (!attendance?.checkIn) {
      setWorkedMilliseconds(0);
      return;
    }

    const updateWorkedTime = () => {
      setWorkedMilliseconds(getWorkedMilliseconds(attendance));
    };

    updateWorkedTime();

    const interval = setInterval(updateWorkedTime, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [attendance]);

  /*
   * Verify office network
   */
  const verifyOfficeNetwork = async () => {
    try {
      setVerificationStatus("checking");
      setVerificationMessage("");
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/attendance/verification`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data: VerificationResponse = await response.json();

      if (!response.ok || !data.verified) {
        setVerificationStatus("failed");

        setVerificationMessage(
          data.message ||
            "Office network verification failed."
        );

        return false;
      }

      setVerificationStatus("verified");

      setVerificationMessage(
        data.message ||
          "Office network verified successfully."
      );

      return true;
    } catch (err) {
      console.error("Network verification error:", err);

      setVerificationStatus("failed");

      setVerificationMessage(
        "Unable to connect to the attendance server."
      );

      return false;
    }
  };

  /*
   * Check In
   */
  const handleCheckIn = async () => {
    if (!employeeId) {
      setError(
        "Employee identity is not available. Please login again."
      );
      return;
    }

    try {
      setActionLoading("check-in");
      setError("");

      /*
       * Verification must happen before check-in.
       */
      const verified = await verifyOfficeNetwork();

      if (!verified) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/attendance/check-in`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId,
          }),
        }
      );

      const data: AttendanceResponse & {
        message?: string;
      } = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Check-in could not be completed."
        );
      }

      if (!data.attendance) {
        throw new Error(
          "Check-in succeeded but attendance data was not returned."
        );
      }

      setAttendance(data.attendance);

      setVerificationStatus("verified");

      setVerificationMessage(
        "Office network verified. Check-in successful."
      );
    } catch (err) {
      console.error("Check-in error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Check-in failed."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
   * Check Out
   */
  const handleCheckOut = async () => {
    if (!employeeId) {
      setError(
        "Employee identity is not available. Please login again."
      );
      return;
    }

    try {
      setActionLoading("check-out");
      setError("");

      /*
       * Verify office network before checkout too.
       */
      const verified = await verifyOfficeNetwork();

      if (!verified) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/attendance/check-out`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId,
          }),
        }
      );

      const data: AttendanceResponse & {
        message?: string;
      } = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Check-out could not be completed."
        );
      }

      if (!data.attendance) {
        throw new Error(
          "Check-out succeeded but attendance data was not returned."
        );
      }

      setAttendance(data.attendance);

      setVerificationMessage(
        "Office network verified. Check-out successful."
      );
    } catch (err) {
      console.error("Check-out error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Check-out failed."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const isCheckedIn =
    Boolean(attendance?.checkIn) &&
    !attendance?.checkOut;

  const isCompleted =
    Boolean(attendance?.checkIn) &&
    Boolean(attendance?.checkOut);

  const attendanceStatus = attendanceLoading
    ? "Loading..."
    : isCompleted
      ? "Completed"
      : isCheckedIn
        ? "Checked In"
        : "Not Checked In";

  const attendanceStatusClass = isCompleted
    ? "bg-emerald-50 text-emerald-700"
    : isCheckedIn
      ? "bg-blue-50 text-blue-700"
      : "bg-slate-100 text-slate-600";

  return (
    <div className="space-y-6">

      {/* =====================================================
          WELCOME
      ====================================================== */}

      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-teal-700">
            Employee Portal
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Good Morning
            {employeeId ? " 👋" : ""}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s an overview of your work activity.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs font-medium text-slate-400">
            Today
          </p>

          <p className="text-sm font-semibold text-slate-800">
            {formatDate(today)}
          </p>
        </div>
      </section>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div>
            <p className="text-sm font-semibold text-red-800">
              Attendance Error
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          QUICK STATS
      ====================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Attendance */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Today&apos;s Attendance
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {attendanceStatus}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
              <CheckCircle2
                size={21}
                className="text-emerald-600"
              />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            {attendance?.checkIn
              ? `Checked in at ${formatTime(attendance.checkIn)}`
              : "No attendance recorded yet"}
          </p>
        </div>

        {/* Leave */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Leave Balance
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                —
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <CalendarDays
                size={21}
                className="text-blue-600"
              />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Leave data will appear here
          </p>
        </div>

        {/* Working Hours */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Working Hours
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {attendance?.checkIn
                  ? formatWorkedTime(workedMilliseconds)
                  : "0h 00m"}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
              <Clock3
                size={21}
                className="text-amber-600"
              />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            {isCheckedIn
              ? "Currently working"
              : isCompleted
                ? "Today&apos;s working time"
                : "No working time recorded"}
          </p>
        </div>

        {/* Payslip */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Latest Payslip
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                —
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">
              <FileText
                size={21}
                className="text-violet-600"
              />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Payslip data will appear here
          </p>
        </div>
      </section>

      {/* =====================================================
          MAIN GRID
      ====================================================== */}

      <section className="grid gap-6 xl:grid-cols-3">

        {/* =================================================
            ATTENDANCE CARD
        ================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Today&apos;s Attendance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Verify your office network and manage today&apos;s attendance.
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50">
              <ShieldCheck
                size={22}
                className="text-teal-700"
              />
            </div>
          </div>

          {/* Attendance Information */}

          <div className="mt-6 grid gap-4 sm:grid-cols-3">

            {/* Check In */}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">
                Check In
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {attendanceLoading
                  ? "..."
                  : formatTime(attendance?.checkIn)}
              </p>

              <p
                className={`mt-1 text-xs ${
                  attendance?.checkIn
                    ? "text-emerald-600"
                    : "text-slate-500"
                }`}
              >
                {attendance?.checkIn
                  ? "Verified"
                  : "Not checked in"}
              </p>
            </div>

            {/* Check Out */}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">
                Check Out
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {attendanceLoading
                  ? "..."
                  : formatTime(attendance?.checkOut)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {attendance?.checkOut
                  ? "Completed"
                  : "Not checked out"}
              </p>
            </div>

            {/* Worked */}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">
                Worked
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {attendance?.checkIn
                  ? formatWorkedTime(workedMilliseconds)
                  : "0h 00m"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Today
              </p>
            </div>
          </div>

          {/* Status */}

          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${attendanceStatusClass}`}
              >
                {attendanceStatus}
              </span>

              {attendance?.verification?.checkInVerified && (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <ShieldCheck size={14} />
                  Network Verified
                </span>
              )}
            </div>

            <Link
              href="/employee/attendance"
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              View Attendance
              <ArrowUpRight size={17} />
            </Link>
          </div>

          {/* Verification Message */}

          {verificationMessage && (
            <div
              className={`mt-4 rounded-xl border p-4 ${
                verificationStatus === "verified"
                  ? "border-emerald-200 bg-emerald-50"
                  : verificationStatus === "failed"
                    ? "border-red-200 bg-red-50"
                    : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">

                {verificationStatus === "verified" ? (
                  <CheckCircle2
                    size={18}
                    className="text-emerald-600"
                  />
                ) : (
                  <AlertCircle
                    size={18}
                    className="text-red-600"
                  />
                )}

                <p
                  className={`text-sm font-medium ${
                    verificationStatus === "verified"
                      ? "text-emerald-700"
                      : "text-red-700"
                  }`}
                >
                  {verificationMessage}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">

            {/* Not checked in */}
            {!attendance?.checkIn && (
              <>
                {verificationStatus !== "verified" && (
                  <button
                    type="button"
                    onClick={verifyOfficeNetwork}
                    disabled={
                      verificationStatus === "checking" ||
                      actionLoading !== null
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-700 px-5 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {verificationStatus === "checking" ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Verifying Network...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={17} />
                        Start Verification
                      </>
                    )}
                  </button>
                )}

                {verificationStatus === "verified" && (
                  <button
                    type="button"
                    onClick={handleCheckIn}
                    disabled={actionLoading !== null}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading === "check-in" ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Checking In...
                      </>
                    ) : (
                      <>
                        <LogIn size={17} />
                        Check In
                      </>
                    )}
                  </button>
                )}
              </>
            )}

            {/* Checked in */}
            {isCheckedIn && (
              <button
                type="button"
                onClick={handleCheckOut}
                disabled={actionLoading !== null}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading === "check-out" ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Checking Out...
                  </>
                ) : (
                  <>
                    <LogOut size={17} />
                    Check Out
                  </>
                )}
              </button>
            )}

            {/* Completed */}
            {isCompleted && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={18} />
                Attendance Completed
              </div>
            )}
          </div>

          {/* No employee ID */}

          {!employeeId && !attendanceLoading && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">
                Employee identity not available
              </p>

              <p className="mt-1 text-xs text-amber-700">
                Please login again before marking attendance.
              </p>
            </div>
          )}
        </div>

        {/* =================================================
            PROFILE CARD
        ================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-lg font-bold text-white">
              E
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Employee
              </h2>

              <p className="text-sm text-slate-500">
                {employeeId
                  ? `Employee ID: ${employeeId}`
                  : "Employee ID unavailable"}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">

            <div>
              <p className="text-xs text-slate-400">
                Department
              </p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                —
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Position
              </p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                —
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Status
              </p>

              <span className="mt-1 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                —
              </span>
            </div>
          </div>

          <Link
            href="/employee/profile"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <UserRound size={17} />
            View Profile
          </Link>
        </div>
      </section>

      {/* =====================================================
          ANNOUNCEMENTS
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Announcements
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Organization announcements will appear here.
            </p>
          </div>

          <Megaphone
            className="text-teal-600"
            size={22}
          />
        </div>

        <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">

          <Megaphone
            size={28}
            className="mx-auto text-slate-400"
          />

          <p className="mt-3 text-sm font-medium text-slate-700">
            No announcements available
          </p>

          <p className="mt-1 text-xs text-slate-500">
            New company announcements will appear here.
          </p>
        </div>
      </section>
    </div>
  );
}