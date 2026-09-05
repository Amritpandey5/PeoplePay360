import { Router } from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import os from "os";
import AttendanceModel from "../db/Attendance.ts";

const router = Router();

/* =========================================================
   TYPES
========================================================= */

type AttendanceStatus =
    | "present"
    | "late"
    | "half_day"
    | "absent"
    | "incomplete"
    | "early_checkout";

type VerificationResult = {
    officeNetwork: boolean;
    presenceVerified: boolean;
    secureSession: boolean;
    clientIp: string;
};

/* =========================================================
   COMPANY ATTENDANCE POLICY
========================================================= */

const POLICY = {
    workStartMinutes: 9 * 60,
    workEndMinutes: 18 * 60,

    requiredHours: 8,

    gracePeriodMinutes: 10,

    halfDayCutoffMinutes: 12 * 60,
    absentCutoffMinutes: 14 * 60,

    overtimeEnabled: true,
};

/* =========================================================
   HELPERS
========================================================= */

function round(
    value: number,
    decimals = 2
): number {
    return Number(value.toFixed(decimals));
}

/* =========================================================
   ATTENDANCE DATE
========================================================= */

function getAttendanceDate(
    date = new Date()
): string {
    const timezone =
        process.env.ATTENDANCE_TIMEZONE ||
        "Asia/Kolkata";

    try {
        return new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone: timezone,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }
        ).format(date);
    } catch {
        return date.toISOString().slice(0, 10);
    }
}

/* =========================================================
   TIME PARTS
========================================================= */

function getTimeParts(
    date = new Date()
) {
    const timezone =
        process.env.ATTENDANCE_TIMEZONE ||
        "Asia/Kolkata";

    try {
        const formatter =
            new Intl.DateTimeFormat(
                "en-GB",
                {
                    timeZone: timezone,
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }
            );

        const parts =
            formatter.formatToParts(date);

        const hour = Number(
            parts.find(
                (part) =>
                    part.type === "hour"
            )?.value || 0
        );

        const minute = Number(
            parts.find(
                (part) =>
                    part.type === "minute"
            )?.value || 0
        );

        return {
            hour,
            minute,
            totalMinutes:
                hour * 60 + minute,
        };
    } catch {
        return {
            hour: date.getHours(),
            minute: date.getMinutes(),
            totalMinutes:
                date.getHours() * 60 +
                date.getMinutes(),
        };
    }
}

/* =========================================================
   WORKED HOURS
========================================================= */

function calculateWorkedHours(
    checkIn: Date,
    checkOut: Date
): number {
    const milliseconds =
        checkOut.getTime() -
        checkIn.getTime();

    if (milliseconds <= 0) {
        return 0;
    }

    return round(
        milliseconds /
            (1000 * 60 * 60)
    );
}

/* =========================================================
   LATE MINUTES
========================================================= */

function calculateLateMinutes(
    checkIn: Date
): number {
    const { totalMinutes } =
        getTimeParts(checkIn);

    const lateAfter =
        POLICY.workStartMinutes +
        POLICY.gracePeriodMinutes;

    return Math.max(
        0,
        totalMinutes - lateAfter
    );
}

/* =========================================================
   EARLY CHECKOUT
========================================================= */

function calculateEarlyCheckoutMinutes(
    checkOut: Date
): number {
    const { totalMinutes } =
        getTimeParts(checkOut);

    return Math.max(
        0,
        POLICY.workEndMinutes -
            totalMinutes
    );
}

/* =========================================================
   OVERTIME
========================================================= */

function calculateOvertimeHours(
    checkOut: Date
): number {
    if (!POLICY.overtimeEnabled) {
        return 0;
    }

    const { totalMinutes } =
        getTimeParts(checkOut);

    const overtimeMinutes =
        Math.max(
            0,
            totalMinutes -
                POLICY.workEndMinutes
        );

    return round(
        overtimeMinutes / 60
    );
}

/* =========================================================
   CHECK-IN STATUS
========================================================= */

function calculateCheckInStatus(
    checkIn: Date
): {
    status: AttendanceStatus;
    lateMinutes: number;
} {
    const { totalMinutes } =
        getTimeParts(checkIn);

    const lateMinutes =
        calculateLateMinutes(
            checkIn
        );

    /*
      Before 09:10
        PRESENT

      09:10 - 11:59
        LATE

      12:00 - 13:59
        HALF DAY

      14:00 onward
        ABSENT
    */

    if (
        totalMinutes >=
        POLICY.absentCutoffMinutes
    ) {
        return {
            status: "absent",
            lateMinutes,
        };
    }

    if (
        totalMinutes >=
        POLICY.halfDayCutoffMinutes
    ) {
        return {
            status: "half_day",
            lateMinutes,
        };
    }

    return {
        status:
            lateMinutes > 0
                ? "late"
                : "present",
        lateMinutes,
    };
}

/* =========================================================
   IP HANDLING
========================================================= */

function normalizeIp(
    ip: string
): string {
    const trimmed =
        ip.trim();

    if (
        trimmed.startsWith(
            "::ffff:"
        )
    ) {
        return trimmed.substring(
            7
        );
    }

    if (
        trimmed === "::1"
    ) {
        return "127.0.0.1";
    }

    return trimmed;
}

/* =========================================================
   IP → NUMBER
========================================================= */

function ipToNumber(
    ip: string
): number | null {
    const parts =
        ip.split(".");

    if (
        parts.length !== 4
    ) {
        return null;
    }

    const numbers =
        parts.map(Number);

    if (
        numbers.some(
            (part) =>
                !Number.isInteger(
                    part
                ) ||
                part < 0 ||
                part > 255
        )
    ) {
        return null;
    }

    return (
      
        numbers[0] *
            256 ** 3 +
        numbers[1] *
            256 ** 2 +
        numbers[2] *
            256 +
        numbers[3]
    );
}

/* =========================================================
   CIDR CHECK
========================================================= */

function isIpInCidr(
    ip: string,
    cidr: string
): boolean {
    const [
        network,
        bitsString,
    ] = cidr
        .trim()
        .split("/");

    const ipNumber =
        ipToNumber(ip);

    const networkNumber =
        ipToNumber(network);

    if (
        ipNumber === null ||
        networkNumber === null
    ) {
        return false;
    }

    const bits =
        Number(bitsString);

    if (
        !Number.isInteger(bits) ||
        bits < 0 ||
        bits > 32
    ) {
        return false;
    }

    if (bits === 0) {
        return true;
    }

    const mask =
        (0xffffffff <<
            (32 - bits)) >>>
        0;

    return (
        (ipNumber & mask) ===
        (networkNumber & mask)
    );
}

/* =========================================================
   CLIENT IP
========================================================= */

/*
  We use the actual socket IP.

  For a direct LAN connection:

  Employee Device
        ↓
  Office Wi-Fi
        ↓
  Backend Server

  Express receives the employee's LAN IP.
*/

function getClientIp(
    req: Request
): string {
    const socketIp =
        req.socket.remoteAddress;

    if (socketIp) {
        return normalizeIp(
            socketIp
        );
    }

    return normalizeIp(
        req.ip || ""
    );
}

/* =========================================================
   PRIVATE IP CHECK
========================================================= */

function isPrivateIp(
    ip: string
): boolean {
    const number =
        ipToNumber(ip);

    if (number === null) {
        return false;
    }

    const first =
        Math.floor(
            number /
                256 ** 3
        );

    const second =
        Math.floor(
            (number %
                256 ** 3) /
                256 ** 2
        );

    /*
      10.0.0.0/8
    */

    if (
        first === 10
    ) {
        return true;
    }

    /*
      172.16.0.0/12
    */

    if (
        first === 172 &&
        second >= 16 &&
        second <= 31
    ) {
        return true;
    }

    /*
      192.168.0.0/16
    */

    if (
        first === 192 &&
        second === 168
    ) {
        return true;
    }

    return false;
}

/* =========================================================
   AUTOMATIC SERVER NETWORK DETECTION
========================================================= */

/*
  No OFFICE_NETWORK_CIDRS required.

  Node checks the network interfaces of the
  machine running the backend.

  Example:

  Backend machine:
  192.168.1.20/24

  Office Wi-Fi:
  192.168.1.x

  Automatically detected network:
  192.168.1.0/24
*/

function getAutoDetectedNetworks(): string[] {
    const interfaces =
        os.networkInterfaces();

    const networks: string[] =
        [];

    for (
        const addresses of Object.values(
            interfaces
        )
    ) {
        if (!addresses) {
            continue;
        }

        for (
            const address of addresses
        ) {
            if (
                address.family !==
                "IPv4"
            ) {
                continue;
            }

            if (
                address.internal
            ) {
                continue;
            }

            const ip =
                normalizeIp(
                    address.address
                );

            if (
                !isPrivateIp(ip)
            ) {
                continue;
            }

            /*
              Node provides CIDR for
              the network interface.

              Example:
              192.168.1.20/24
            */

            if (
                address.cidr
            ) {
                networks.push(
                    address.cidr
                );
            }
        }
    }

    return [
        ...new Set(
            networks
        ),
    ];
}

/* =========================================================
   CONFIGURED NETWORKS
========================================================= */

function getConfiguredOfficeNetworks(): string[] {
    return (
        process.env
            .OFFICE_NETWORK_CIDRS
            ?.split(",")
            .map(
                (value) =>
                    value.trim()
            )
            .filter(Boolean) ||
        []
    );
}

/* =========================================================
   OFFICE NETWORK VERIFICATION
========================================================= */

function verifyOfficeNetwork(
    req: Request
): boolean {
    const clientIp =
        getClientIp(req);

    /*
      1. Explicit network configuration
         takes priority if available.
    */

    const configuredNetworks =
        getConfiguredOfficeNetworks();

    if (
        configuredNetworks.length >
        0
    ) {
        return configuredNetworks.some(
            (network) =>
                isIpInCidr(
                    clientIp,
                    network
                )
        );
    }

    /*
      2. Localhost.

      Useful when frontend and backend
      are running on the same machine
      during the hackathon.
    */

    if (
        clientIp ===
            "127.0.0.1" ||
        clientIp === "::1"
    ) {
        return true;
    }

    /*
      3. Automatically detect the
         backend machine's LAN networks.
    */

    const autoNetworks =
        getAutoDetectedNetworks();

    if (
        autoNetworks.length === 0
    ) {
        return false;
    }

    return autoNetworks.some(
        (network) =>
            isIpInCidr(
                clientIp,
                network
            )
    );
}

/* =========================================================
   PERFORM VERIFICATION
========================================================= */

function performVerification(
    req: Request
): VerificationResult {
    const clientIp =
        getClientIp(req);

    const officeNetwork =
        verifyOfficeNetwork(req);

    /*
      Final system requirement:

      OFFICE WI-FI ONLY

      Therefore presence verification
      depends on successful office
      network verification.

      No:
      - QR
      - BLE
      - GPS
      - Face scan
      - Browser location
    */

    const presenceVerified =
        officeNetwork;

    const secureSession =
        officeNetwork &&
        presenceVerified;

    return {
        officeNetwork,
        presenceVerified,
        secureSession,
        clientIp,
    };
}

/* =========================================================
   VALIDATE EMPLOYEE ID
========================================================= */

function validateEmployeeId(
    employeeId: unknown
): employeeId is string {
    return (
        typeof employeeId ===
            "string" &&
        mongoose.Types.ObjectId.isValid(
            employeeId
        )
    );
}

/* =========================================================
   GET VERIFICATION
   GET /api/attendance/verification
========================================================= */

router.get(
    "/verification",
    (
        req: Request,
        res: Response
    ) => {
        try {
            const verification =
                performVerification(
                    req
                );

            return res.status(200).json({
                success: true,

                verification: {
                    officeNetwork:
                        verification.officeNetwork,

                    presenceVerified:
                        verification.presenceVerified,

                    secureSession:
                        verification.secureSession,
                },

                message:
                    verification.secureSession
                        ? "Office network verified. Attendance is available."
                        : "Connect to the authorized office Wi-Fi to continue.",
            });
        } catch (error) {
            console.error(
                "Attendance verification error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to verify office network.",
            });
        }
    }
);

/* =========================================================
   CHECK-IN
   POST /api/attendance/check-in
========================================================= */

router.post(
    "/check-in",
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const employeeId =
                req.body?.employeeId;

            if (
                !validateEmployeeId(
                    employeeId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "A valid employeeId is required.",
                });
            }

            /*
              Verify office network
              before creating attendance.
            */

            const verification =
                performVerification(
                    req
                );

            if (
                !verification.officeNetwork
            ) {
                return res.status(403).json({
                    success: false,

                    code:
                        "OFFICE_NETWORK_REQUIRED",

                    message:
                        "Check-in is allowed only from the authorized office Wi-Fi.",

                    verification: {
                        officeNetwork:
                            false,

                        presenceVerified:
                            false,

                        secureSession:
                            false,
                    },
                });
            }

            /*
              Server-controlled time.
            */

            const serverNow =
                new Date();

            const date =
                getAttendanceDate(
                    serverNow
                );

            /*
              Prevent duplicate attendance.
            */

            const existing =
                await AttendanceModel.findOne(
                    {
                        employeeId,
                        date,
                    }
                );

            if (existing) {
                return res.status(409).json({
                    success: false,

                    code:
                        "ATTENDANCE_ALREADY_EXISTS",

                    message:
                        "Attendance already exists for today.",

                    attendance:
                        existing,
                });
            }

            const {
                status,
                lateMinutes,
            } =
                calculateCheckInStatus(
                    serverNow
                );

            /*
              Create attendance.
            */

            const record =
                await AttendanceModel.create({
                    employeeId,

                    date,

                    checkIn:
                        serverNow,

                    checkOut:
                        null,

                    workedHours:
                        0,

                    overtimeHours:
                        0,

                    status,

                    lateMinutes,

                    earlyCheckoutMinutes:
                        0,

                    verification: {
                        officeNetwork:
                            verification.officeNetwork,

                        presenceVerified:
                            verification.presenceVerified,

                        clientIp:
                            verification.clientIp,

                        verifiedAt:
                            serverNow,
                    },

                    notes:
                        status ===
                        "absent"
                            ? "Check-in occurred after the configured absent cutoff."
                            : undefined,
                });

            return res.status(201).json({
                success: true,

                message:
                    "Attendance check-in recorded successfully.",

                attendance:
                    record,
            });
        } catch (error) {
            console.error(
                "Check-in error:",
                error
            );

            if (
                error instanceof
                mongoose.Error.ValidationError
            ) {
                return res.status(400).json({
                    success: false,

                    message:
                        "Invalid attendance data.",

                    errors:
                        error.errors,
                });
            }

            return res.status(500).json({
                success: false,

                message:
                    "Unable to record attendance check-in.",
            });
        }
    }
);

/* =========================================================
   CHECK-OUT
   POST /api/attendance/check-out
========================================================= */

router.post(
    "/check-out",
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const employeeId =
                req.body?.employeeId;

            if (
                !validateEmployeeId(
                    employeeId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "A valid employeeId is required.",
                });
            }

            /*
              Employee must still be
              connected to office network.
            */

            const verification =
                performVerification(
                    req
                );

            if (
                !verification.officeNetwork
            ) {
                return res.status(403).json({
                    success: false,

                    code:
                        "OFFICE_NETWORK_REQUIRED",

                    message:
                        "Check-out is allowed only from the authorized office Wi-Fi.",

                    verification: {
                        officeNetwork:
                            false,

                        presenceVerified:
                            false,

                        secureSession:
                            false,
                    },
                });
            }

            const serverNow =
                new Date();

            const date =
                getAttendanceDate(
                    serverNow
                );

            const record =
                await AttendanceModel.findOne(
                    {
                        employeeId,
                        date,
                    }
                );

            if (!record) {
                return res.status(404).json({
                    success: false,

                    code:
                        "ATTENDANCE_NOT_FOUND",

                    message:
                        "Today's attendance record was not found.",
                });
            }

            if (!record.checkIn) {
                return res.status(400).json({
                    success: false,

                    message:
                        "Employee has not checked in.",
                });
            }

            if (record.checkOut) {
                return res.status(409).json({
                    success: false,

                    code:
                        "ALREADY_CHECKED_OUT",

                    message:
                        "Employee has already checked out.",

                    attendance:
                        record,
                });
            }

            if (
                serverNow.getTime() <=
                record.checkIn.getTime()
            ) {
                return res.status(400).json({
                    success: false,

                    message:
                        "Invalid checkout time.",
                });
            }

            const workedHours =
                calculateWorkedHours(
                    record.checkIn,
                    serverNow
                );

            const overtimeHours =
                calculateOvertimeHours(
                    serverNow
                );

            const earlyCheckoutMinutes =
                calculateEarlyCheckoutMinutes(
                    serverNow
                );

            let status:
                AttendanceStatus =
                record.status;

            /*
              Never overwrite ABSENT.
            */

            if (
                status !== "absent"
            ) {
                if (
                    record.status ===
                    "half_day"
                ) {
                    status =
                        "half_day";
                } else if (
                    earlyCheckoutMinutes >
                    0
                ) {
                    status =
                        "early_checkout";
                } else if (
                    record.lateMinutes >
                    0
                ) {
                    status =
                        "late";
                } else {
                    status =
                        "present";
                }
            }

            record.checkOut =
                serverNow;

            record.workedHours =
                workedHours;

            record.overtimeHours =
                overtimeHours;

            record.earlyCheckoutMinutes =
                earlyCheckoutMinutes;

            record.status =
                status;

            /*
              Save checkout verification.
            */

            record.verification = {
                ...(record.verification || {}),

                checkoutOfficeNetwork:
                    verification.officeNetwork,

                checkoutPresenceVerified:
                    verification.presenceVerified,

                checkoutClientIp:
                    verification.clientIp,

                checkoutVerifiedAt:
                    serverNow,
            };

            await record.save();

            return res.status(200).json({
                success: true,

                message:
                    "Attendance check-out recorded successfully.",

                attendance:
                    record,
            });
        } catch (error) {
            console.error(
                "Check-out error:",
                error
            );

            if (
                error instanceof
                mongoose.Error.ValidationError
            ) {
                return res.status(400).json({
                    success: false,

                    message:
                        "Invalid attendance data.",

                    errors:
                        error.errors,
                });
            }

            return res.status(500).json({
                success: false,

                message:
                    "Unable to record attendance check-out.",
            });
        }
    }
);

/* =========================================================
   TODAY
   GET /api/attendance/today/:employeeId
========================================================= */

router.get(
    "/today/:employeeId",
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const {
                employeeId,
            } = req.params;

            if (
                !validateEmployeeId(
                    employeeId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid employeeId.",
                });
            }

            const date =
                getAttendanceDate();

            const attendance =
                await AttendanceModel.findOne(
                    {
                        employeeId,
                        date,
                    }
                ).lean();

            return res.status(200).json({
                success: true,

                employeeId,

                date,

                attendance:
                    attendance || null,
            });
        } catch (error) {
            console.error(
                "Today's attendance error:",
                error
            );

            return res.status(500).json({
                success: false,

                message:
                    "Unable to load today's attendance.",
            });
        }
    }
);

/* =========================================================
   ALL ATTENDANCE
   GET /api/attendance
========================================================= */

router.get(
    "/",
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const {
                employeeId,
                date,
                startDate,
                endDate,
                status,
            } = req.query;

            const filter:
                Record<string, unknown> =
                {};

            if (employeeId) {
                if (
                    !validateEmployeeId(
                        employeeId
                    )
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Invalid employeeId.",
                    });
                }

                filter.employeeId =
                    employeeId;
            }

            if (date) {
                filter.date =
                    String(date);
            }

            if (
                startDate ||
                endDate
            ) {
                const dateFilter:
                    Record<
                        string,
                        string
                    > = {};

                if (startDate) {
                    dateFilter.$gte =
                        String(
                            startDate
                        );
                }

                if (endDate) {
                    dateFilter.$lte =
                        String(
                            endDate
                        );
                }

                filter.date =
                    dateFilter;
            }

            if (status) {
                filter.status =
                    String(status);
            }

            const records =
                await AttendanceModel.find(
                    filter
                )
                    .sort({
                        date: -1,
                        checkIn: -1,
                    })
                    .lean();

            return res.status(200).json({
                success: true,

                data: records,

                total:
                    records.length,
            });
        } catch (error) {
            console.error(
                "Get attendance error:",
                error
            );

            return res.status(500).json({
                success: false,

                message:
                    "Unable to load attendance records.",
            });
        }
    }
);

/* =========================================================
   EMPLOYEE ATTENDANCE
   GET /api/attendance/employee/:employeeId
========================================================= */

router.get(
    "/employee/:employeeId",
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const {
                employeeId,
            } = req.params;

            if (
                !validateEmployeeId(
                    employeeId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid employeeId.",
                });
            }

            const records =
                await AttendanceModel.find(
                    {
                        employeeId,
                    }
                )
                    .sort({
                        date: -1,
                        checkIn: -1,
                    })
                    .lean();

            return res.status(200).json({
                success: true,

                employeeId,

                data: records,

                total:
                    records.length,
            });
        } catch (error) {
            console.error(
                "Employee attendance error:",
                error
            );

            return res.status(500).json({
                success: false,

                message:
                    "Unable to load employee attendance.",
            });
        }
    }
);

/* =========================================================
   ANALYTICS
   GET /api/attendance/analytics
========================================================= */

router.get(
    "/analytics",
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const {
                employeeId,
                startDate,
                endDate,
            } = req.query;

            const filter:
                Record<string, unknown> =
                {};

            if (employeeId) {
                if (
                    !validateEmployeeId(
                        employeeId
                    )
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Invalid employeeId.",
                    });
                }

                filter.employeeId =
                    employeeId;
            }

            if (
                startDate ||
                endDate
            ) {
                const dateFilter:
                    Record<
                        string,
                        string
                    > = {};

                if (startDate) {
                    dateFilter.$gte =
                        String(
                            startDate
                        );
                }

                if (endDate) {
                    dateFilter.$lte =
                        String(
                            endDate
                        );
                }

                filter.date =
                    dateFilter;
            }

            const records =
                await AttendanceModel.find(
                    filter
                ).lean();

            const totalRecords =
                records.length;

            const present =
                records.filter(
                    (record) =>
                        record.status ===
                        "present"
                ).length;

            const late =
                records.filter(
                    (record) =>
                        record.status ===
                        "late"
                ).length;

            const halfDay =
                records.filter(
                    (record) =>
                        record.status ===
                        "half_day"
                ).length;

            const absent =
                records.filter(
                    (record) =>
                        record.status ===
                        "absent"
                ).length;

            const earlyCheckout =
                records.filter(
                    (record) =>
                        record.status ===
                        "early_checkout"
                ).length;

            const incomplete =
                records.filter(
                    (record) =>
                        record.status ===
                        "incomplete"
                ).length;

            const totalWorkedHours =
                round(
                    records.reduce(
                        (
                            sum,
                            record
                        ) =>
                            sum +
                            Number(
                                record.workedHours ||
                                    0
                            ),
                        0
                    )
                );

            const totalOvertimeHours =
                round(
                    records.reduce(
                        (
                            sum,
                            record
                        ) =>
                            sum +
                            Number(
                                record.overtimeHours ||
                                    0
                            ),
                        0
                    )
                );

            const attendanceRate =
                totalRecords > 0
                    ? round(
                          ((
                              present +
                              late +
                              halfDay *
                                  0.5
                          ) /
                              totalRecords) *
                              100
                      )
                    : 0;

            return res.status(200).json({
                success: true,

                analytics: {
                    totalRecords,

                    present,

                    late,

                    halfDay,

                    absent,

                    earlyCheckout,

                    incomplete,

                    attendanceRate,

                    totalWorkedHours,

                    totalOvertimeHours,
                },
            });
        } catch (error) {
            console.error(
                "Attendance analytics error:",
                error
            );

            return res.status(500).json({
                success: false,

                message:
                    "Unable to calculate attendance analytics.",
            });
        }
    }
);

/* =========================================================
   PAYROLL SUMMARY
   GET /api/attendance/payroll-summary
========================================================= */

router.get(
    "/payroll-summary",
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const {
                employeeId,
                startDate,
                endDate,
            } = req.query;

            if (
                !validateEmployeeId(
                    employeeId
                )
            ) {
                return res.status(400).json({
                    success: false,

                    message:
                        "A valid employeeId is required.",
                });
            }

            const filter:
                Record<string, unknown> =
                {
                    employeeId,
                };

            if (
                startDate ||
                endDate
            ) {
                const dateFilter:
                    Record<
                        string,
                        string
                    > = {};

                if (startDate) {
                    dateFilter.$gte =
                        String(
                            startDate
                        );
                }

                if (endDate) {
                    dateFilter.$lte =
                        String(
                            endDate
                        );
                }

                filter.date =
                    dateFilter;
            }

            const records =
                await AttendanceModel.find(
                    filter
                ).lean();

            const totalWorkedHours =
                round(
                    records.reduce(
                        (
                            sum,
                            record
                        ) =>
                            sum +
                            Number(
                                record.workedHours ||
                                    0
                            ),
                        0
                    )
                );

            const overtimeHours =
                round(
                    records.reduce(
                        (
                            sum,
                            record
                        ) =>
                            sum +
                            Number(
                                record.overtimeHours ||
                                    0
                            ),
                        0
                    )
                );

            const lateMinutes =
                records.reduce(
                    (
                        sum,
                        record
                    ) =>
                        sum +
                        Number(
                            record.lateMinutes ||
                                0
                        ),
                    0
                );

            const presentDays =
                records.filter(
                    (record) =>
                        record.status ===
                            "present" ||
                        record.status ===
                            "late"
                ).length;

            const halfDays =
                records.filter(
                    (record) =>
                        record.status ===
                        "half_day"
                ).length;

            const absentDays =
                records.filter(
                    (record) =>
                        record.status ===
                        "absent"
                ).length;

            const incompleteDays =
                records.filter(
                    (record) =>
                        record.checkIn &&
                        !record.checkOut
                ).length;

            return res.status(200).json({
                success: true,

                employeeId,

                period: {
                    startDate:
                        startDate ||
                        null,

                    endDate:
                        endDate ||
                        null,
                },

                payrollSummary: {
                    attendanceDays:
                        records.length,

                    presentDays,

                    halfDays,

                    absentDays,

                    incompleteDays,

                    totalWorkedHours,

                    overtimeHours,

                    lateMinutes,

                    lateHours:
                        round(
                            lateMinutes /
                                60
                        ),
                },
            });
        } catch (error) {
            console.error(
                "Payroll summary error:",
                error
            );

            return res.status(500).json({
                success: false,

                message:
                    "Unable to calculate payroll summary.",
            });
        }
    }
);

/* =========================================================
   EXPORT
========================================================= */

export default router;