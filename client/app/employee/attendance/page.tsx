// "use client";

// import { useState } from "react";
// import {
//     CalendarDays,
//     CheckCircle2,
//     Clock3,
//     LogIn,
//     LogOut,
//     ShieldCheck,
//     Wifi,
//     X,
//     AlertCircle,
//     Loader2,
// } from "lucide-react";

// type VerificationState =
//     | "idle"
//     | "checking"
//     | "verified"
//     | "failed";

// type AttendanceState =
//     | "not_checked_in"
//     | "checked_in"
//     | "checked_out";

// export default function AttendancePage() {
//     const [showVerification, setShowVerification] = useState(false);

//     const [verificationState, setVerificationState] =
//         useState<VerificationState>("idle");

//     const [attendanceState, setAttendanceState] =
//         useState<AttendanceState>("not_checked_in");

//     const [error, setError] = useState("");

//     const [checkInTime, setCheckInTime] = useState<string | null>(null);
//     const [checkOutTime, setCheckOutTime] = useState<string | null>(null);

//     const today = new Date();

//     const formattedDate = today.toLocaleDateString("en-IN", {
//         weekday: "long",
//         day: "numeric",
//         month: "long",
//         year: "numeric",
//     });

//     const handleStartVerification = () => {
//         setError("");
//         setVerificationState("idle");
//         setShowVerification(true);
//     };

//     const handleCloseVerification = () => {
//         if (verificationState === "checking") {
//             return;
//         }

//         setShowVerification(false);
//         setVerificationState("idle");
//         setError("");
//     };

//     const handleVerifyOfficeWifi = async () => {
//         setError("");
//         setVerificationState("checking");

//         /*
//          * Real office Wi-Fi verification will be connected
//          * to the backend later.
//          *
//          * We intentionally do NOT fake verification success.
//          */

//         await new Promise((resolve) => setTimeout(resolve, 1000));

//         setVerificationState("failed");

//         setError(
//             "Office Wi-Fi verification is not connected yet."
//         );
//     };

//     const handleCheckIn = () => {
//         if (verificationState !== "verified") {
//             setError("Office Wi-Fi verification is required.");
//             return;
//         }

//         setError(
//             "Check-in will be enabled after the attendance backend is connected."
//         );
//     };

//     const handleCheckOut = () => {
//         if (attendanceState !== "checked_in") {
//             return;
//         }

//         setError(
//             "Check-out will be enabled after the attendance backend is connected."
//         );
//     };

//     return (
//         <div className="space-y-6">
//             {/* PAGE HEADER */}

//             <div>
//                 <p className="text-sm font-semibold text-[#0F766E]">
//                     Employee Portal
//                 </p>

//                 <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">
//                     Attendance
//                 </h1>

//                 <p className="mt-1 text-sm text-[#64748B]">
//                     Mark your attendance from the authorized office network.
//                 </p>
//             </div>

//             {/* TODAY */}

//             <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
//                 <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
//                     <div>
//                         <div className="flex items-center gap-2 text-sm text-[#64748B]">
//                             <CalendarDays size={17} />

//                             <span>{formattedDate}</span>
//                         </div>

//                         <h2 className="mt-3 text-3xl font-bold text-[#0F172A]">
//                             Today
//                         </h2>

//                         <p className="mt-1 text-sm text-[#64748B]">
//                             Your attendance status for today.
//                         </p>
//                     </div>

//                     <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ECFDF5]">
//                         <Clock3
//                             size={28}
//                             className="text-[#0F766E]"
//                         />
//                     </div>
//                 </div>

//                 {/* ATTENDANCE STATUS */}

//                 <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-[#F7F9F8] p-5">
//                     <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
//                         <div className="flex items-center gap-3">
//                             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5]">
//                                 {attendanceState === "not_checked_in" ? (
//                                     <Clock3
//                                         size={21}
//                                         className="text-[#64748B]"
//                                     />
//                                 ) : (
//                                     <CheckCircle2
//                                         size={21}
//                                         className="text-[#0F766E]"
//                                     />
//                                 )}
//                             </div>

//                             <div>
//                                 <p className="text-xs text-[#64748B]">
//                                     Attendance Status
//                                 </p>

//                                 <p className="mt-1 font-semibold text-[#0F172A]">
//                                     {attendanceState === "not_checked_in" &&
//                                         "Not checked in"}

//                                     {attendanceState === "checked_in" &&
//                                         "Checked in"}

//                                     {attendanceState === "checked_out" &&
//                                         "Checked out"}
//                                 </p>
//                             </div>
//                         </div>

//                         <div>
//                             <p className="text-xs text-[#64748B]">
//                                 Check-in
//                             </p>

//                             <p className="mt-1 text-sm font-semibold text-[#0F172A]">
//                                 {checkInTime ?? "—"}
//                             </p>
//                         </div>

//                         <div>
//                             <p className="text-xs text-[#64748B]">
//                                 Check-out
//                             </p>

//                             <p className="mt-1 text-sm font-semibold text-[#0F172A]">
//                                 {checkOutTime ?? "—"}
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* OFFICE WIFI */}

//             <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
//                 <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
//                     <div className="flex items-start gap-4">
//                         <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#ECFDF5]">
//                             <Wifi
//                                 size={24}
//                                 className="text-[#0F766E]"
//                             />
//                         </div>

//                         <div>
//                             <h2 className="text-lg font-semibold text-[#0F172A]">
//                                 Office Network Verification
//                             </h2>

//                             <p className="mt-1 max-w-xl text-sm leading-6 text-[#64748B]">
//                                 Attendance can only be marked when you are
//                                 connected to your organization's authorized
//                                 office Wi-Fi.
//                             </p>
//                         </div>
//                     </div>

//                     {attendanceState === "not_checked_in" && (
//                         <button
//                             type="button"
//                             onClick={handleStartVerification}
//                             className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#063D2F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#07513E] sm:w-auto"
//                         >
//                             <ShieldCheck size={18} />
//                             Start Verification
//                         </button>
//                     )}

//                     {attendanceState === "checked_in" && (
//                         <button
//                             type="button"
//                             onClick={handleCheckOut}
//                             className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#063D2F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#07513E] sm:w-auto"
//                         >
//                             <LogOut size={18} />
//                             Check Out
//                         </button>
//                     )}
//                 </div>
//             </div>

//             {/* INFORMATION CARDS */}

//             <div className="grid gap-4 md:grid-cols-3">
//                 <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5]">
//                         <Wifi
//                             size={20}
//                             className="text-[#0F766E]"
//                         />
//                     </div>

//                     <h3 className="mt-4 font-semibold text-[#0F172A]">
//                         Office Wi-Fi
//                     </h3>

//                     <p className="mt-1 text-sm leading-6 text-[#64748B]">
//                         Attendance is restricted to the authorized office
//                         network.
//                     </p>
//                 </div>

//                 <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5]">
//                         <ShieldCheck
//                             size={20}
//                             className="text-[#0F766E]"
//                         />
//                     </div>

//                     <h3 className="mt-4 font-semibold text-[#0F172A]">
//                         Secure Verification
//                     </h3>

//                     <p className="mt-1 text-sm leading-6 text-[#64748B]">
//                         Your workplace network must be verified before
//                         attendance can be marked.
//                     </p>
//                 </div>

//                 <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5]">
//                         <Clock3
//                             size={20}
//                             className="text-[#0F766E]"
//                         />
//                     </div>

//                     <h3 className="mt-4 font-semibold text-[#0F172A]">
//                         Official Time
//                     </h3>

//                     <p className="mt-1 text-sm leading-6 text-[#64748B]">
//                         Attendance time will be recorded by the server.
//                     </p>
//                 </div>
//             </div>

//             {/* VERIFICATION MODAL */}

//             {showVerification && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
//                     <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
//                         {/* MODAL HEADER */}

//                         <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-5">
//                             <div>
//                                 <h2 className="text-lg font-semibold text-[#0F172A]">
//                                     Verify Workplace
//                                 </h2>

//                                 <p className="mt-1 text-xs text-[#64748B]">
//                                     Office Wi-Fi verification
//                                 </p>
//                             </div>

//                             <button
//                                 type="button"
//                                 onClick={handleCloseVerification}
//                                 disabled={
//                                     verificationState === "checking"
//                                 }
//                                 className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] hover:bg-slate-100 disabled:opacity-50"
//                             >
//                                 <X size={19} />
//                             </button>
//                         </div>

//                         {/* MODAL CONTENT */}

//                         <div className="px-6 py-7">
//                             {verificationState === "idle" && (
//                                 <div className="text-center">
//                                     <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ECFDF5]">
//                                         <Wifi
//                                             size={30}
//                                             className="text-[#0F766E]"
//                                         />
//                                     </div>

//                                     <h3 className="mt-5 text-lg font-semibold text-[#0F172A]">
//                                         Check your office network
//                                     </h3>

//                                     <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#64748B]">
//                                         Make sure you are connected to your
//                                         organization's authorized office Wi-Fi.
//                                     </p>

//                                     <button
//                                         type="button"
//                                         onClick={handleVerifyOfficeWifi}
//                                         className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#063D2F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#07513E]"
//                                     >
//                                         <ShieldCheck size={18} />
//                                         Verify Office Wi-Fi
//                                     </button>
//                                 </div>
//                             )}

//                             {verificationState === "checking" && (
//                                 <div className="py-5 text-center">
//                                     <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ECFDF5]">
//                                         <Loader2
//                                             size={30}
//                                             className="animate-spin text-[#0F766E]"
//                                         />
//                                     </div>

//                                     <h3 className="mt-5 text-lg font-semibold text-[#0F172A]">
//                                         Checking office network...
//                                     </h3>

//                                     <p className="mt-2 text-sm text-[#64748B]">
//                                         Please wait.
//                                     </p>
//                                 </div>
//                             )}

//                             {verificationState === "verified" && (
//                                 <div className="text-center">
//                                     <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ECFDF5]">
//                                         <CheckCircle2
//                                             size={32}
//                                             className="text-[#0F766E]"
//                                         />
//                                     </div>

//                                     <h3 className="mt-5 text-lg font-semibold text-[#0F172A]">
//                                         Office Wi-Fi verified
//                                     </h3>

//                                     <p className="mt-2 text-sm text-[#64748B]">
//                                         You can now mark your attendance.
//                                     </p>

//                                     <button
//                                         type="button"
//                                         onClick={handleCheckIn}
//                                         className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#063D2F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#07513E]"
//                                     >
//                                         <LogIn size={18} />
//                                         Check In
//                                     </button>
//                                 </div>
//                             )}

//                             {verificationState === "failed" && (
//                                 <div className="text-center">
//                                     <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
//                                         <AlertCircle
//                                             size={32}
//                                             className="text-red-500"
//                                         />
//                                     </div>

//                                     <h3 className="mt-5 text-lg font-semibold text-[#0F172A]">
//                                         Office Wi-Fi not verified
//                                     </h3>

//                                     <p className="mt-2 text-sm leading-6 text-[#64748B]">
//                                         Connect to the authorized office Wi-Fi
//                                         and try again.
//                                     </p>

//                                     <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-left text-xs leading-5 text-red-600">
//                                         {error}
//                                     </div>

//                                     <button
//                                         type="button"
//                                         onClick={handleVerifyOfficeWifi}
//                                         className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#063D2F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#07513E]"
//                                     >
//                                         <Wifi size={18} />
//                                         Try Again
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }
"use client";

import { useEffect, useState } from "react";
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    LogIn,
    LogOut,
    ShieldCheck,
    Wifi,
    X,
    AlertCircle,
    Loader2,
} from "lucide-react";

type VerificationState =
    | "idle"
    | "checking"
    | "verified"
    | "failed";

type AttendanceState =
    | "not_checked_in"
    | "checked_in"
    | "checked_out";

type ApiResponse = {
    success?: boolean;
    verified?: boolean;
    message?: string;
    error?: string;
    attendance?: {
        checkIn?: string;
        checkOut?: string;
        status?: string;
    };
    record?: {
        checkIn?: string;
        checkOut?: string;
        status?: string;
    };
    data?: {
        checkIn?: string;
        checkOut?: string;
        status?: string;
    };
};

const API_BASE_URL = "http://localhost:5000";

export default function AttendancePage() {
    const [showVerification, setShowVerification] = useState(false);

    const [verificationState, setVerificationState] =
        useState<VerificationState>("idle");

    const [attendanceState, setAttendanceState] =
        useState<AttendanceState>("not_checked_in");

    const [error, setError] = useState("");

    const [checkInTime, setCheckInTime] =
        useState<string | null>(null);

    const [checkOutTime, setCheckOutTime] =
        useState<string | null>(null);

    const [isAttendanceLoading, setIsAttendanceLoading] =
        useState(true);

    const today = new Date();

    const formattedDate = today.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    /*
     * Employee ID comes from the authenticated user/session
     * when login integration is available.
     *
     * We intentionally do not create or hardcode an employee ID.
     */
    const getEmployeeId = () => {
        if (typeof window === "undefined") {
            return "";
        }

        return (
            localStorage.getItem("employeeId") ||
            localStorage.getItem("employee_id") ||
            localStorage.getItem("userId") ||
            ""
        );
    };

    const formatServerTime = (value?: string) => {
        if (!value) {
            return null;
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const extractAttendance = (data: ApiResponse) => {
        return (
            data.attendance ||
            data.record ||
            data.data ||
            null
        );
    };

    const loadTodayAttendance = async () => {
        const employeeId = getEmployeeId();

        /*
         * No employee ID = no fake attendance.
         *
         * Login/auth integration will provide the real ID.
         */
        if (!employeeId) {
            setIsAttendanceLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/attendance/today/${encodeURIComponent(
                    employeeId
                )}`,
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data: ApiResponse = await response
                .json()
                .catch(() => ({}));

            if (!response.ok) {
                setIsAttendanceLoading(false);
                return;
            }

            const attendance = extractAttendance(data);

            if (!attendance) {
                setIsAttendanceLoading(false);
                return;
            }

            const checkIn = attendance.checkIn;
            const checkOut = attendance.checkOut;

            if (checkIn) {
                setCheckInTime(formatServerTime(checkIn));
            }

            if (checkOut) {
                setCheckOutTime(formatServerTime(checkOut));
            }

            if (checkOut) {
                setAttendanceState("checked_out");
            } else if (checkIn) {
                setAttendanceState("checked_in");
            } else {
                setAttendanceState("not_checked_in");
            }
        } catch {
            /*
             * Do not show fake attendance.
             * The page simply remains in its real empty state.
             */
        } finally {
            setIsAttendanceLoading(false);
        }
    };

    useEffect(() => {
        loadTodayAttendance();
    }, []);

    const handleStartVerification = () => {
        setError("");
        setVerificationState("idle");
        setShowVerification(true);
    };

    const handleCloseVerification = () => {
        if (verificationState === "checking") {
            return;
        }

        setShowVerification(false);
        setVerificationState("idle");
        setError("");
    };

    const handleVerifyOfficeWifi = async () => {
        setError("");
        setVerificationState("checking");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/attendance/verification`,
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data: ApiResponse = await response
                .json()
                .catch(() => ({}));

            const isVerified =
                response.ok &&
                (data.verified === true ||
                    data.success === true);

            if (isVerified) {
                setVerificationState("verified");
                setError("");
                return;
            }

            setVerificationState("failed");

            setError(
                data.message ||
                    data.error ||
                    "Office Wi-Fi verification failed. Connect to the authorized office network and try again."
            );
        } catch {
            setVerificationState("failed");

            setError(
                "Unable to connect to the attendance server. Make sure the backend is running on port 5000."
            );
        }
    };

    const handleCheckIn = async () => {
        if (verificationState !== "verified") {
            setError("Office Wi-Fi verification is required.");
            return;
        }

        const employeeId = getEmployeeId();

        if (!employeeId) {
            setError(
                "Employee identity is not available. Please connect the login/authentication system before checking in."
            );
            return;
        }

        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/attendance/check-in`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        employeeId,
                    }),
                }
            );

            const data: ApiResponse = await response
                .json()
                .catch(() => ({}));

            if (!response.ok || data.success === false) {
                throw new Error(
                    data.message ||
                        data.error ||
                        "Unable to check in."
                );
            }

            const attendance = extractAttendance(data);

            setAttendanceState("checked_in");

            if (attendance?.checkIn) {
                setCheckInTime(
                    formatServerTime(attendance.checkIn)
                );
            }

            setShowVerification(false);
            setVerificationState("idle");

            await loadTodayAttendance();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to check in. Please try again."
            );
        }
    };

    const handleCheckOut = async () => {
        const employeeId = getEmployeeId();

        if (!employeeId) {
            setError(
                "Employee identity is not available. Please connect the login/authentication system before checking out."
            );
            return;
        }

        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/attendance/check-out`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        employeeId,
                    }),
                }
            );

            const data: ApiResponse = await response
                .json()
                .catch(() => ({}));

            if (!response.ok || data.success === false) {
                throw new Error(
                    data.message ||
                        data.error ||
                        "Unable to check out."
                );
            }

            const attendance = extractAttendance(data);

            setAttendanceState("checked_out");

            if (attendance?.checkOut) {
                setCheckOutTime(
                    formatServerTime(attendance.checkOut)
                );
            }

            await loadTodayAttendance();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to check out. Please try again."
            );
        }
    };

    return (
        <div className="space-y-6">
            {/* PAGE HEADER */}

            <div>
                <p className="text-sm font-semibold text-[#0F766E]">
                    Employee Portal
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">
                    Attendance
                </h1>

                <p className="mt-1 text-sm text-[#64748B]">
                    Mark your attendance from the authorized office network.
                </p>
            </div>

            {/* TODAY */}

            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-[#64748B]">
                            <CalendarDays size={17} />
                            <span>{formattedDate}</span>
                        </div>

                        <h2 className="mt-3 text-3xl font-bold text-[#0F172A]">
                            Today
                        </h2>

                        <p className="mt-1 text-sm text-[#64748B]">
                            Your attendance status for today.
                        </p>
                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ECFDF5]">
                        <Clock3
                            size={28}
                            className="text-[#0F766E]"
                        />
                    </div>
                </div>

                {/* ATTENDANCE STATUS */}

                <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-[#F7F9F8] p-5">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5]">
                                {attendanceState === "not_checked_in" ? (
                                    <Clock3
                                        size={21}
                                        className="text-[#64748B]"
                                    />
                                ) : (
                                    <CheckCircle2
                                        size={21}
                                        className="text-[#0F766E]"
                                    />
                                )}
                            </div>

                            <div>
                                <p className="text-xs text-[#64748B]">
                                    Attendance Status
                                </p>

                                <p className="mt-1 font-semibold text-[#0F172A]">
                                    {isAttendanceLoading
                                        ? "Loading..."
                                        : attendanceState ===
                                          "not_checked_in"
                                        ? "Not checked in"
                                        : attendanceState ===
                                          "checked_in"
                                        ? "Checked in"
                                        : "Checked out"}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-[#64748B]">
                                Check-in
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#0F172A]">
                                {checkInTime ?? "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-[#64748B]">
                                Check-out
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#0F172A]">
                                {checkOutTime ?? "—"}
                            </p>
                        </div>
                    </div>
                </div>

                {error && !showVerification && (
                    <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}
            </div>

            {/* OFFICE WIFI */}

            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#ECFDF5]">
                            <Wifi
                                size={24}
                                className="text-[#0F766E]"
                            />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-[#0F172A]">
                                Office Network Verification
                            </h2>

                            <p className="mt-1 max-w-xl text-sm leading-6 text-[#64748B]">
                                Attendance can only be marked when you are
                                connected to your organization's authorized
                                office Wi-Fi.
                            </p>
                        </div>
                    </div>

                    {attendanceState === "not_checked_in" && (
                        <button
                            type="button"
                            onClick={handleStartVerification}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#063D2F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#07513E] sm:w-auto"
                        >
                            <ShieldCheck size={18} />
                            Start Verification
                        </button>
                    )}

                    {attendanceState === "checked_in" && (
                        <button
                            type="button"
                            onClick={handleCheckOut}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#063D2F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#07513E] sm:w-auto"
                        >
                            <LogOut size={18} />
                            Check Out
                        </button>
                    )}
                </div>
            </div>

            {/* INFORMATION CARDS */}

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5]">
                        <Wifi
                            size={20}
                            className="text-[#0F766E]"
                        />
                    </div>

                    <h3 className="mt-4 font-semibold text-[#0F172A]">
                        Office Wi-Fi
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[#64748B]">
                        Attendance is restricted to the authorized office
                        network.
                    </p>
                </div>

                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5]">
                        <ShieldCheck
                            size={20}
                            className="text-[#0F766E]"
                        />
                    </div>

                    <h3 className="mt-4 font-semibold text-[#0F172A]">
                        Secure Verification
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[#64748B]">
                        Your workplace network must be verified before
                        attendance can be marked.
                    </p>
                </div>

                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5]">
                        <Clock3
                            size={20}
                            className="text-[#0F766E]"
                        />
                    </div>

                    <h3 className="mt-4 font-semibold text-[#0F172A]">
                        Official Time
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[#64748B]">
                        Attendance time will be recorded by the server.
                    </p>
                </div>
            </div>

            {/* VERIFICATION MODAL */}

            {showVerification && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                        {/* MODAL HEADER */}

                        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-5">
                            <div>
                                <h2 className="text-lg font-semibold text-[#0F172A]">
                                    Verify Workplace
                                </h2>

                                <p className="mt-1 text-xs text-[#64748B]">
                                    Office Wi-Fi verification
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseVerification}
                                disabled={
                                    verificationState === "checking"
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] hover:bg-slate-100 disabled:opacity-50"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {/* MODAL CONTENT */}

                        <div className="px-6 py-7">
                            {verificationState === "idle" && (
                                <div className="text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ECFDF5]">
                                        <Wifi
                                            size={30}
                                            className="text-[#0F766E]"
                                        />
                                    </div>

                                    <h3 className="mt-5 text-lg font-semibold text-[#0F172A]">
                                        Check your office network
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#64748B]">
                                        Make sure you are connected to your
                                        organization's authorized office Wi-Fi.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={handleVerifyOfficeWifi}
                                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#063D2F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#07513E]"
                                    >
                                        <ShieldCheck size={18} />
                                        Verify Office Wi-Fi
                                    </button>
                                </div>
                            )}

                            {verificationState === "checking" && (
                                <div className="py-5 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ECFDF5]">
                                        <Loader2
                                            size={30}
                                            className="animate-spin text-[#0F766E]"
                                        />
                                    </div>

                                    <h3 className="mt-5 text-lg font-semibold text-[#0F172A]">
                                        Checking office network...
                                    </h3>

                                    <p className="mt-2 text-sm text-[#64748B]">
                                        Please wait.
                                    </p>
                                </div>
                            )}

                            {verificationState === "verified" && (
                                <div className="text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ECFDF5]">
                                        <CheckCircle2
                                            size={32}
                                            className="text-[#0F766E]"
                                        />
                                    </div>

                                    <h3 className="mt-5 text-lg font-semibold text-[#0F172A]">
                                        Office Wi-Fi verified
                                    </h3>

                                    <p className="mt-2 text-sm text-[#64748B]">
                                        You can now mark your attendance.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={handleCheckIn}
                                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#063D2F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#07513E]"
                                    >
                                        <LogIn size={18} />
                                        Check In
                                    </button>
                                </div>
                            )}

                            {verificationState === "failed" && (
                                <div className="text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                                        <AlertCircle
                                            size={32}
                                            className="text-red-500"
                                        />
                                    </div>

                                    <h3 className="mt-5 text-lg font-semibold text-[#0F172A]">
                                        Office Wi-Fi not verified
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-[#64748B]">
                                        Connect to the authorized office Wi-Fi
                                        and try again.
                                    </p>

                                    <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-left text-xs leading-5 text-red-600">
                                        {error}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleVerifyOfficeWifi}
                                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#063D2F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#07513E]"
                                    >
                                        <Wifi size={18} />
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}