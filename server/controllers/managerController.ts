import Express from "express";
import { prisma } from "../db/connection";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const addEmployee = async (req: AuthenticatedRequest, res: Express.Response) => {
    const managerId = req.userid
    const type = req.type
    if (!type || !managerId || type === "employee") return res.status(400).json({
        msg: "Unauthorized request"
    })
    const { name, email, password, gender, dob, joining, role, status, location } = req.body

    if (!managerId) return res.status(400).json({
        msg: "Unauthorized request"
    })
    if (!name || !email || !password || !gender || !dob || !joining || !role || !status) return res.status(200).json({
        msg: "You have a missing field"
    })

    try {
        const manager = await prisma.manager.findFirst({
            where: {
                id: managerId
            }
        })
        if (!manager) return res.status(200).json({
            msg: "No manager found"
        })

        const hashedPassword = await Bun.password.hash(password)
        const employee = await prisma.employee.create({
            data: {
                name,
                email,
                password: hashedPassword,
                gender,
                dob: new Date(dob),
                joining: new Date(joining),
                role,
                status,
                location,
                ip: req.ip || "",
                companyId: manager.companyId,
                managerId
            }
        })

        return res.status(200).json({
            msg: "Employee added successfully",
            employee
        })
    } catch(e) {
        return res.status(500).json({
            msg: "Error while connecting DB",
            error: e
        })
    }
}

export const fetchTickets = async (req: AuthenticatedRequest, res: Express.Response) => {
    const managerId = req.userid
    const type = req.type
    if (!type || !managerId || type === "employee") return res.status(400).json({
        msg: "Unauthorized request"
    })

    try {
        const tickets = await prisma.tickets.findMany({
            where: {
                managerId
            },
            include: {
                employee: true
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

export const resolveTicket = async (req: AuthenticatedRequest, res: Express.Response) => {
    const managerId = req.userid
    const type = req.type
    if (!type || !managerId || type === "employee") return res.status(400).json({
        msg: "Unauthorized request"
    })
    const ticketId = Number(req.body.ticketId || req.params.id)

    if (!ticketId) return res.status(200).json({
        msg: "Ticket id is required"
    })

    try {
        const ticket = await prisma.tickets.findFirst({
            where: {
                id: ticketId,
                managerId
            }
        })
        if (!ticket) return res.status(200).json({
            msg: "No ticket found"
        })

        await prisma.tickets.delete({
            where: {
                id: ticketId
            }
        })

        return res.status(200).json({
            msg: "Ticket resolved successfully"
        })
    } catch(e) {
        return res.status(500).json({
            msg: "Error while connecting DB",
            error: e
        })
    }
}

export const assignProject = async (req: AuthenticatedRequest, res: Express.Response) => {
    const managerId = req.userid
    const type = req.type
    if (!type || !managerId || type === "employee") return res.status(400).json({
        msg: "Unauthorized request"
    })
    const { employeeIds, target, name, description } = req.body

    if (!Array.isArray(employeeIds) || employeeIds.length === 0 || !target || !name || !description) return res.status(200).json({
        msg: "You have a missing field"
    })

    try {
        const project = await prisma.project.create({
            data: {
                assignedById: managerId,
                target: new Date(target),
                name,
                description,
                employees: {
                    connect: employeeIds.map((employeeId: number | string) => ({
                        id: Number(employeeId)
                    }))
                }
            }
        })

        return res.status(200).json({
            msg: "Project assigned successfully",
            project
        })
    } catch(e) {
        return res.status(500).json({
            msg: "Error while connecting DB",
            error: e
        })
    }
}

export const assignTask = async (req: AuthenticatedRequest, res: Express.Response) => {
    const managerId = req.userid
    const type = req.type
    if (!type || !managerId || type === "employee") return res.status(400).json({
        msg: "Unauthorized request"
    })
    const { employeeId, target, name, description } = req.body

    if (!employeeId || !target || !name || !description) return res.status(200).json({
        msg: "You have a missing field"
    })

    try {
        const task = await prisma.task.create({
            data: {
                assignedById: managerId,
                employeeId: Number(employeeId),
                target: new Date(target),
                name,
                description
            }
        })

        return res.status(200).json({
            msg: "Task assigned successfully",
            task
        })
    } catch(e) {
        return res.status(500).json({
            msg: "Error while connecting DB",
            error: e
        })
    }
}

export const fetchTasks = async (req: AuthenticatedRequest, res: Express.Response) => {
    const managerId = req.userid
    const type = req.type
    if (!type || !managerId || type === "employee") return res.status(400).json({
        msg: "Unauthorized request"
    })

    try {
        const tasks = await prisma.task.findMany({
            where: {
                assignedById: managerId
            },
            include: {
                employee: true
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

export const getDashboard = async (req: AuthenticatedRequest, res: Express.Response) => {
    const managerId = req.userid
    const type = req.type
    if (!type || !managerId || type === "employee") return res.status(400).json({
        success: false,
        message: "Unauthorized request",
        msg: "Unauthorized request"
    })

    try {
        const manager = await prisma.manager.findUnique({
            where: {
                id: managerId
            },
            include: {
                employees: {
                    orderBy: {
                        id: "desc"
                    },
                    take: 8
                },
                tasks: {
                    include: {
                        employee: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    },
                    orderBy: {
                        target: "asc"
                    },
                    take: 8
                },
                projects: {
                    include: {
                        employees: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    },
                    orderBy: {
                        target: "asc"
                    },
                    take: 8
                },
                tickets: {
                    include: {
                        employee: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    },
                    orderBy: {
                        id: "desc"
                    },
                    take: 8
                }
            }
        })

        if (!manager) return res.status(200).json({
            success: false,
            message: "No manager found",
            msg: "No manager found"
        })

        const [totalEmployees, activeEmployees, openTickets, assignedTasks, projects] = await prisma.$transaction([
            prisma.employee.count({
                where: {
                    managerId
                }
            }),
            prisma.employee.count({
                where: {
                    managerId,
                    status: "Active"
                }
            }),
            prisma.tickets.count({
                where: {
                    managerId
                }
            }),
            prisma.task.count({
                where: {
                    assignedById: managerId
                }
            }),
            prisma.project.count({
                where: {
                    assignedById: managerId
                }
            })
        ])

        return res.status(200).json({
            success: true,
            manager,
            employees: manager.employees,
            tasks: manager.tasks,
            projects: manager.projects,
            tickets: manager.tickets,
            stats: {
                totalEmployees,
                activeEmployees,
                openTickets,
                assignedTasks,
                projects
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
