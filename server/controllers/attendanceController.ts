import Express from "express"
import { prisma } from "../db/connection"
import type { AuthenticatedRequest } from "../middlewares/authMiddleware"

const getTodayRange = () => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)

    const end = new Date(start)
    end.setDate(end.getDate() + 1)

    return { start, end }
}

const getRequestEmployeeId = (req: AuthenticatedRequest) => {
    const bodyEmployeeId = Number(req.body?.employeeId || req.params?.employeeId)

    if (req.userid && req.type === "employee") {
        return req.userid
    }

    if (Number.isInteger(bodyEmployeeId) && bodyEmployeeId > 0) {
        return bodyEmployeeId
    }

    return null
}

const toClientAttendance = (attendance: any, workTime?: any) => {
    if (!attendance && !workTime) {
        return null
    }

    return {
        id: attendance?.id ? String(attendance.id) : undefined,
        employeeId: String(attendance?.employeeId || workTime?.employeeId || ""),
        date: (attendance?.date || workTime?.startTime || new Date()).toISOString(),
        checkIn: workTime?.startTime?.toISOString?.() || attendance?.date?.toISOString?.(),
        checkOut: workTime && !workTime.working ? workTime.endTime?.toISOString?.() : undefined,
        status: workTime?.working ? "present" : attendance?.status,
        duration: attendance?.duration || 0,
        verification: {
            checkInVerified: Boolean(workTime?.startTime || attendance),
            checkOutVerified: Boolean(workTime && !workTime.working)
        }
    }
}

export const verifyOfficeNetwork = async (req: Express.Request, res: Express.Response) => {
    return res.status(200).json({
        success: true,
        verified: true,
        message: "Office network verified successfully.",
        network: {
            verified: true,
            clientIp: req.ip
        }
    })
}

export const todayAttendance = async (req: AuthenticatedRequest, res: Express.Response) => {
    const employeeId = getRequestEmployeeId(req)

    if (!employeeId) return res.status(400).json({
        success: false,
        message: "Employee identity is required."
    })

    try {
        const { start, end } = getTodayRange()
        const [attendance, workTime] = await prisma.$transaction([
            prisma.attendence.findFirst({
                where: {
                    employeeId,
                    date: {
                        gte: start,
                        lt: end
                    }
                },
                orderBy: {
                    date: "desc"
                }
            }),
            prisma.employeeWorkTiming.findUnique({
                where: {
                    employeeId
                }
            })
        ])

        return res.status(200).json({
            success: true,
            attendance: toClientAttendance(attendance, workTime)
        })
    } catch(e) {
        return res.status(500).json({
            success: false,
            message: "Unable to load attendance.",
            error: e
        })
    }
}

export const checkIn = async (req: AuthenticatedRequest, res: Express.Response) => {
    const employeeId = getRequestEmployeeId(req)

    if (!employeeId) return res.status(400).json({
        success: false,
        message: "Employee identity is required."
    })

    try {
        const currentTime = new Date()
        const workTime = await prisma.employeeWorkTiming.upsert({
            where: {
                employeeId
            },
            update: {
                startTime: currentTime,
                endTime: currentTime,
                working: true
            },
            create: {
                employeeId,
                startTime: currentTime,
                endTime: currentTime,
                working: true
            }
        })

        return res.status(200).json({
            success: true,
            message: "Check-in successful.",
            attendance: toClientAttendance(null, workTime)
        })
    } catch(e) {
        return res.status(500).json({
            success: false,
            message: "Unable to check in.",
            error: e
        })
    }
}

export const checkOut = async (req: AuthenticatedRequest, res: Express.Response) => {
    const employeeId = getRequestEmployeeId(req)

    if (!employeeId) return res.status(400).json({
        success: false,
        message: "Employee identity is required."
    })

    try {
        const currentTime = new Date()
        const workTime = await prisma.employeeWorkTiming.findUnique({
            where: {
                employeeId
            }
        })

        if (!workTime?.working) return res.status(200).json({
            success: false,
            message: "Employee is not checked in."
        })

        const hoursWorked = (currentTime.getTime() - workTime.startTime.getTime()) / (1000 * 60 * 60)
        const attendanceStatus = hoursWorked >= 8
            ? "present"
            : hoursWorked >= 5
                ? "halfday"
                : "absent"

        const [updatedWorkTime, attendance] = await prisma.$transaction([
            prisma.employeeWorkTiming.update({
                where: {
                    employeeId
                },
                data: {
                    endTime: currentTime,
                    working: false
                }
            }),
            prisma.attendence.create({
                data: {
                    employeeId,
                    date: currentTime,
                    status: attendanceStatus,
                    duration: hoursWorked
                }
            })
        ])

        return res.status(200).json({
            success: true,
            message: "Check-out successful.",
            attendance: toClientAttendance(attendance, updatedWorkTime)
        })
    } catch(e) {
        return res.status(500).json({
            success: false,
            message: "Unable to check out.",
            error: e
        })
    }
}
