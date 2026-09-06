import Express from "express"
import { prisma } from "../db/connection"
import jwt from "jsonwebtoken"
import type { AuthenticatedRequest } from "../middlewares/authMiddleware"

export const signin = async (req :Express.Request, res: Express.Response) => {
    const { email, password } = req.body
    const type = req.body.type || (String(req.body.userType || "").toLowerCase() === "manager" ? "manager" : "employee")
    if (!email || !password || !type) return res.status(200).json({
        success: false,
        message: "You have a missing field",
        msg: "You have a missing field"
    })
    if (type !== "employee" && type !== "manager") {
        return res.status(300).json({
            success: false,
            message: "Invalid user type",
            msg: "Invalid user type"
        })
    }

    try {   
        const user = type === "manager"? await prisma.manager.findFirst({
            where: {
                email: email
            }
        }) : await prisma.employee.findFirst({
            where: {
                email: email
            }
        })
        if (!user) return res.status(200).json({
            success: false,
            message: "No user found",
            msg: "No user found"
        })
        const verifyPassword = await Bun.password.verify(password, user.password)
        if (!verifyPassword) return res.status(200).json({
            success: false,
            message: "Incorrect password",
            msg: "Incorrect password"
        })
        const token = jwt.sign(
            { 
                user_id: user.id,
                type: user.type
            },
            process.env["JWT_SECRET"] || "default_secret",
            { expiresIn: '12h' }
        )
        res.cookie('jwt', token, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 12 * 60 * 60 * 1000
        })
        return res.status(200).json({
            success: true,
            message: "Login successful",
            userId: user?.id,
            user: {
                id: String(user.id),
                name: user.name,
                email: user.email,
                role: user.role,
                userType: type === "manager" ? "MANAGER" : "EMPLOYEE"
            }
        })
    } catch(e) {
        return res.status(400).json({
            success: false,
            message: "Error while fetching db",
            msg: "Error while fetching db"
        })
    }
}

export const signout = async (req: AuthenticatedRequest, res: Express.Response) => {
    const userid = req.userid
    const type = req.type
    console.log("USER_ID ===>  ",userid);
    console.log("TYPE ====> ", type);
    console.log(req);
    
    
    
    if (!type || !userid || type !== "employee") return res.status(400).json({
        msg: "Unauthorized request"
    })

    const currentTime = new Date()
    try {
        const timeStatus = await prisma.employeeWorkTiming.findFirst({
            where: {
                employeeId: userid
            }
        })
        
        if (!timeStatus?.working) return res.status(200).json({
            msg: "Already signed out"
        })
        const hoursWorked = (currentTime.getTime() - timeStatus.startTime.getTime()) / (1000 * 60 * 60)
        const attendanceStatus = hoursWorked > 8
            ? "present"
            : hoursWorked >= 5
                ? "halfday"
                : "absent"

        await prisma.employeeWorkTiming.update({
            where: {
                employeeId: userid
            },
            data: {
                endTime: currentTime,
                working: false
            }
        })

        await prisma.attendence.create({
            data: {
                employeeId: userid,
                date: currentTime,
                status: attendanceStatus,
                duration: hoursWorked
            }
        })

        res.clearCookie('jwt')
        return res.status(200).json({
            success: true,
            message: "Signout successful",
            msg: "Signout successful",
            attendanceStatus
        })
    } catch(e) {
        return res.status(500).json({
            msg: "Error while connecting DB",
            error: e
        })
    }
}

export const getDashboard = async (req: AuthenticatedRequest, res: Express.Response) => {
    const userid = req.userid
    const type = req.type
    if (!type || !userid || type !== "employee") return res.status(400).json({
        success: false,
        message: "Unauthorized request",
        msg: "Unauthorized request"
    })

    try {
        const employee = await prisma.employee.findUnique({
            where: {
                id: userid
            },
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                salary: {
                    include: {
                        allowances: true
                    }
                },
                tasks: {
                    orderBy: {
                        target: "asc"
                    },
                    take: 5
                },
                projects: {
                    orderBy: {
                        target: "asc"
                    },
                    take: 5
                },
                salarySlips: {
                    orderBy: {
                        date: "desc"
                    },
                    take: 5
                },
                workTime: true
            }
        })

        if (!employee) return res.status(200).json({
            success: false,
            message: "No employee found",
            msg: "No employee found"
        })

        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const todayEnd = new Date(todayStart)
        todayEnd.setDate(todayEnd.getDate() + 1)

        const [todayAttendance, recentAttendance, tickets] = await prisma.$transaction([
            prisma.attendence.findFirst({
                where: {
                    employeeId: userid,
                    date: {
                        gte: todayStart,
                        lt: todayEnd
                    }
                },
                orderBy: {
                    date: "desc"
                }
            }),
            prisma.attendence.findMany({
                where: {
                    employeeId: userid
                },
                orderBy: {
                    date: "desc"
                },
                take: 10
            }),
            prisma.tickets.findMany({
                where: {
                    employeeId: userid
                },
                orderBy: {
                    id: "desc"
                },
                take: 5
            })
        ])

        return res.status(200).json({
            success: true,
            employee,
            profile: employee,
            todayAttendance,
            recentAttendance,
            tickets,
            tasks: employee.tasks,
            projects: employee.projects,
            payslips: employee.salarySlips,
            workTime: employee.workTime,
            stats: {
                isWorking: Boolean(employee.workTime?.working),
                tasks: employee.tasks.length,
                projects: employee.projects.length,
                tickets: tickets.length,
                payslips: employee.salarySlips.length
            }
        })
    } catch(e) {
        return res.status(500).json({
            success: false,
            message: "Error while connecting DB",
            msg: "Error while connecting DB",
            error: e
        })
    }

}

export const raiseTicket = async(req: AuthenticatedRequest, res: Express.Response) => {
    const userid = req.userid
    const { title, description, managerId } = req.body

    const type = req.type
    if (!type || !userid || type !== "employee") return res.status(400).json({
        msg: "Unauthorized request"
    })
    if (!title || !description) return res.status(200).json({
        msg: "You have a missing field"
    })

    try {
        const employee = await prisma.employee.findFirst({
            where: {
                id: userid
            }
        })
        if (!employee) return res.status(200).json({
            msg: "No employee found"
        })

        const ticketManagerId = managerId ? Number(managerId) : employee.managerId
        if (!ticketManagerId) return res.status(200).json({
            msg: "No manager assigned"
        })

        const ticket = await prisma.tickets.create({
            data: {
                employeeId: userid,
                title,
                description,
                managerId: ticketManagerId
            }
        })

        return res.status(200).json({
            msg: "Ticket raised successfully",
            ticket
        })
    } catch(e) {
        return res.status(500).json({
            msg: "Error while connecting DB",
            error: e
        })
    }
}

export const myTickets = async (req: AuthenticatedRequest, res: Express.Response) => {
    const userid = req.userid
    const type = req.type
    if (!type || !userid || type !== "employee") return res.status(400).json({
        msg: "Unauthorized request"
    })

    try {
        const tickets = await prisma.tickets.findMany({
            where: {
                employeeId: userid
            }
        })

        return res.status(200).json({
            tickets
        })
    } catch(e) {
        return res.status(500).json({
            msg: "Error while connecting DB",
            error: e
        })
    }
}

export const myPaySlips = async (req: AuthenticatedRequest, res: Express.Response) => {
    const userid = req.userid
    const type = req.type
    if (!type || !userid || type !== "employee") return res.status(400).json({
        msg: "Unauthorized request"
    })

    try {
        const payslips = await prisma.salarySlipDocument.findMany({
            where: {
                employeeId: userid
            },
            orderBy: {
                date: "desc"
            }
        })

        return res.status(200).json({
            success: true,
            payslips
        })
    } catch(e) {
        return res.status(500).json({
            msg: "Error while connecting DB",
            error: e
        })
    }

}

export const myTasks = async (req: AuthenticatedRequest, res: Express.Response) => {
    const userid = req.userid
    const type = req.type
    if (!type || !userid || type !== "employee") return res.status(400).json({
        msg: "Unauthorized request"
    })

    try {
        const tasks = await prisma.task.findMany({
            where: {
                employeeId: userid
            }
        })

        return res.status(200).json({
            tasks
        })
    } catch(e) {
        return res.status(500).json({
            msg: "Error while connecting DB",
            error: e
        })
    }
}

export const myProjects = async (req: AuthenticatedRequest, res: Express.Response) => {
    const userid = req.userid
    const type = req.type
    if (!type || !userid || type !== "employee") return res.status(400).json({
        msg: "Unauthorized request"
    })

    try {
        const projects = await prisma.project.findMany({
            where: {
                employees: {
                    some: {
                        id: userid
                    }
                }
            }
        })

        return res.status(200).json({
            projects
        })
    } catch(e) {
        return res.status(500).json({
            msg: "Error while connecting DB",
            error: e
        })
    }
}

export const getAttendence = async (req: AuthenticatedRequest, res: Express.Response) => {
    const userid = req.userid
    const type = req.type
    if (!type || !userid || type !== "employee") return res.status(400).json({
        msg: "Unauthorized request"
    })

    try {
        const attendence = await prisma.attendence.findMany({
            where: {
                employeeId: userid
            },
            orderBy: {
                date: "desc"
            },
            take: 60
        })

        return res.status(200).json({
            attendence
        })
    } catch(e) {
        return res.status(500).json({
            msg: "Error while connecting DB",
            error: e
        })
    }
}
