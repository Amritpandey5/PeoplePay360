import type { AuthenticatedAdminRequest } from "../middlewares/adminMiddleware";
import Express from "express"
import { prisma } from "../db/connection";
import jwt from "jsonwebtoken";

const toGender = (gender: string) => {
    const normalizedGender = String(gender || "").toLowerCase()
    if (normalizedGender === "female") return "Female"
    if (normalizedGender === "other" || normalizedGender === "prefer_not_to_say") return "Other"
    return "Male"
}

const toEmployeeRole = (role: string) => {
    const normalizedRole = String(role || "").toLowerCase()
    if (normalizedRole.includes("developer")) return "Developer"
    if (normalizedRole.includes("designer")) return "Designer"
    return "Staff"
}

const toManagerType = (role: string) => {
    const normalizedRole = String(role || "").toLowerCase()
    if (normalizedRole.includes("payroll manager")) return "Hr_Payroll_Manager"
    if (normalizedRole.includes("payroll")) return "Hr_Payroll"
    return "Hr_Manager"
}

const isManagerRole = (role: string) => {
    const normalizedRole = String(role || "").toLowerCase()
    return normalizedRole.includes("hr") || normalizedRole.includes("manager") || normalizedRole.includes("payroll")
}

const toEmployeeStatus = (status?: string) => {
    const normalizedStatus = String(status || "").toLowerCase()
    if (normalizedStatus === "inactive") return "Inactive"
    if (normalizedStatus === "onleave" || normalizedStatus === "on leave") return "OnLeave"
    if (normalizedStatus === "resigned") return "Resigned"
    if (normalizedStatus === "onboarding") return "Onboarding"
    return "Active"
}

const toClientEmployee = (employee: any) => {
    const base = employee.salary?.base || 0
    const allowanceTotal = employee.salary?.allowances?.reduce((total: number, allowance: any) => total + allowance.amount, 0) || 0

    return {
        id: String(employee.id),
        employeeId: `EMP-${String(employee.id).padStart(4, "0")}`,
        name: employee.name,
        email: employee.email,
        phone: "",
        gender: String(employee.gender).toLowerCase(),
        dateOfJoining: employee.joining?.toISOString?.().split("T")[0] || "",
        dateOfBirth: employee.dob?.toISOString?.().split("T")[0] || "",
        paymentBasis: "monthly",
        workingHours: 8,
        workingDays: 5,
        basicSalary: base,
        hra: 0,
        allowances: allowanceTotal,
        deductions: 0,
        location: employee.location || "",
        role: employee.role,
        jobPosition: employee.role,
        department: "Workforce",
        status: String(employee.status).toLowerCase(),
        isActive: employee.status === "Active",
        createdAt: employee.joining?.toISOString?.() || new Date().toISOString()
    }
}

const toClientManager = (manager: any) => ({
    id: `MGR-${manager.id}`,
    name: manager.name,
    email: manager.email,
    role: manager.type,
    employeeId: `MGR-${String(manager.id).padStart(4, "0")}`,
    isActive: manager.status === "Active",
    createdAt: manager.joining?.toISOString?.() || new Date().toISOString(),
    department: manager.department,
    jobPosition: manager.role
})

export const signin = async (req: Express.Request, res: Express.Response) => {
    const { email, password } = req.body
        if (!email || !password) return res.status(200).json({
            success: false,
            message: "You have a missing field",
            msg: "You have a missing field"
        })
    
        try {   
            const admin = await prisma.company.findFirst({
                where: {
                    email: email
                }
            })
            if (!admin) return res.status(200).json({
                success: false,
                message: "No user found",
                msg: "No user found"
            })
            const verifyPassword = await Bun.password.verify(password, admin.password)
            if (!verifyPassword) return res.status(200).json({
                success: false,
                message: "Incorrect password",
                msg: "Incorrect password"
            })
            const token = jwt.sign(
                { 
                    admin_id: admin.id,
                    type: "admin"
                },
                process.env["JWT_SECRET"] || "default_secret",
                { expiresIn: '2h' }
            )
            res.cookie('admin_jwt', token, {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                maxAge: 2 * 60 * 60 * 1000
            })
            return res.status(200).json({
                success: true,
                message: "Login successful",
                admin_id: admin?.id,
                user: {
                    id: String(admin.id),
                    name: admin.name,
                    email: admin.email,
                    role: "admin",
                    userType: "ADMIN"
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

export const signup = async (req: Express.Request, res: Express.Response) => {
    const { name, location, email, password } = req.body

    if (!name || !location || !email || !password) return res.status(200).json({
        success: false,
        message: "You have a missing field",
        msg: "You have a missing field"
    })

    try {
        const hashedPassword = await Bun.password.hash(password)
        const company = await prisma.company.create({
            data: {
                name,
                location,
                email,
                password: hashedPassword
            }
        })

        return res.status(200).json({
            success: true,
            message: "Company created successfully",
            companyId: company.id
        })
    } catch(e) {
        return res.status(400).json({
            success: false,
            message: "Unable to create company",
            msg: "Unable to create company",
            error: e
        })
    }
}

export const dashboard = async (req: AuthenticatedAdminRequest, res: Express.Response) => {
    const adminId = req.adminid

    if (!adminId) return res.status(400).json({
        msg: "Unauthorized request"
    })

    try {
        const [
            totalEmployees,
            activeEmployees,
            inactiveEmployees,
            totalManagers,
            activeManagers
        ] = await prisma.$transaction([
            prisma.employee.count({
                where: {
                    companyId: adminId
                }
            }),
            prisma.employee.count({
                where: {
                    companyId: adminId,
                    status: "Active"
                }
            }),
            prisma.employee.count({
                where: {
                    companyId: adminId,
                    status: "Inactive"
                }
            }),
            prisma.manager.count({
                where: {
                    companyId: adminId
                }
            }),
            prisma.manager.count({
                where: {
                    companyId: adminId,
                    status: "Active"
                }
            })
        ])

        const activeUsers = activeEmployees + activeManagers
        const totalUsers = totalEmployees + totalManagers

        return res.status(200).json({
            totalEmployees,
            activeEmployees,
            inactiveEmployees,
            totalUsers,
            activeUsers,
            stats: {
                totalEmployees,
                activeEmployees,
                activeUsers,
                inactiveEmployees
            }
        })
    } catch (e) {
        return res.status(400).json({
            msg: "Error while fetching dashboard data"
        })
    }

}

export const listEmployees = async (req: AuthenticatedAdminRequest, res: Express.Response) => {
    const adminId = req.adminid
    if (!adminId) return res.status(400).json({
        success: false,
        message: "Unauthorized request",
        msg: "Unauthorized request"
    })

    try {
        const employees = await prisma.employee.findMany({
            where: {
                companyId: adminId
            },
            include: {
                salary: {
                    include: {
                        allowances: true
                    }
                },
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                id: "desc"
            }
        })

        return res.status(200).json({
            success: true,
            employees: employees.map(toClientEmployee)
        })
    } catch(e) {
        return res.status(500).json({
            success: false,
            message: "Error while fetching employees",
            msg: "Error while fetching employees",
            error: e
        })
    }
}

export const createEmployee = async (req: AuthenticatedAdminRequest, res: Express.Response) => {
    const adminId = req.adminid
    if (!adminId) return res.status(400).json({
        success: false,
        message: "Unauthorized request",
        msg: "Unauthorized request"
    })

    const { name, email, password, gender, dateOfBirth, dob, dateOfJoining, joining, role, status, location, basicSalary, allowances, hra } = req.body

    if (!name || !email || !password || !gender || !(dateOfBirth || dob) || !(dateOfJoining || joining) || !role) return res.status(200).json({
        success: false,
        message: "You have a missing field",
        msg: "You have a missing field"
    })

    try {
        const hashedPassword = await Bun.password.hash(password)
        const salaryBase = Number(basicSalary || 0)
        const allowanceAmount = Number(allowances || 0) + Number(hra || 0)

        if (isManagerRole(role)) {
            const manager = await prisma.manager.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    gender: toGender(gender),
                    dob: new Date(dateOfBirth || dob),
                    joining: new Date(dateOfJoining || joining),
                    department: "Development",
                    role: "Manager",
                    status: toEmployeeStatus(status),
                    location,
                    ip: req.ip || "",
                    type: toManagerType(role),
                    companyId: adminId,
                    salary: salaryBase > 0 || allowanceAmount > 0
                        ? {
                            create: {
                                ctc: salaryBase + allowanceAmount,
                                base: salaryBase,
                                allowances: allowanceAmount > 0
                                    ? {
                                        create: [
                                            {
                                                name: "Allowances",
                                                amount: allowanceAmount
                                            }
                                        ]
                                    }
                                    : undefined
                            }
                        }
                        : undefined
                }
            })

            return res.status(200).json({
                success: true,
                message: "Manager added successfully",
                manager,
                user: toClientManager(manager)
            })
        }

        const employee = await prisma.employee.create({
            data: {
                name,
                email,
                password: hashedPassword,
                gender: toGender(gender),
                dob: new Date(dateOfBirth || dob),
                joining: new Date(dateOfJoining || joining),
                role: toEmployeeRole(role),
                status: toEmployeeStatus(status),
                location,
                ip: req.ip || "",
                companyId: adminId,
                salary: salaryBase > 0 || allowanceAmount > 0
                    ? {
                        create: {
                            ctc: salaryBase + allowanceAmount,
                            base: salaryBase,
                            allowances: allowanceAmount > 0
                                ? {
                                    create: [
                                        {
                                            name: "Allowances",
                                            amount: allowanceAmount
                                        }
                                    ]
                                }
                                : undefined
                        }
                    }
                    : undefined
            },
            include: {
                salary: {
                    include: {
                        allowances: true
                    }
                }
            }
        })

        return res.status(200).json({
            success: true,
            message: "Employee added successfully",
            employee: toClientEmployee(employee)
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

export const updateEmployee = async (req: AuthenticatedAdminRequest, res: Express.Response) => {
    const adminId = req.adminid
    const employeeId = Number(req.params.id)

    if (!adminId || !employeeId) return res.status(400).json({
        success: false,
        message: "Unauthorized request",
        msg: "Unauthorized request"
    })

    const { name, email, gender, dateOfBirth, dob, dateOfJoining, joining, role, status, location, basicSalary, allowances, hra } = req.body

    try {
        const existingEmployee = await prisma.employee.findFirst({
            where: {
                id: employeeId,
                companyId: adminId
            }
        })

        if (!existingEmployee) return res.status(200).json({
            success: false,
            message: "No employee found",
            msg: "No employee found"
        })

        const employee = await prisma.employee.update({
            where: {
                id: employeeId
            },
            data: {
                ...(name ? { name } : {}),
                ...(email ? { email } : {}),
                ...(gender ? { gender: toGender(gender) } : {}),
                ...(dateOfBirth || dob ? { dob: new Date(dateOfBirth || dob) } : {}),
                ...(dateOfJoining || joining ? { joining: new Date(dateOfJoining || joining) } : {}),
                ...(role ? { role: toEmployeeRole(role) } : {}),
                ...(status ? { status: toEmployeeStatus(status) } : {}),
                ...(location !== undefined ? { location } : {}),
                ...(basicSalary !== undefined || allowances !== undefined || hra !== undefined
                    ? {
                        salary: {
                            upsert: {
                                create: {
                                    ctc: Number(basicSalary || 0) + Number(allowances || 0) + Number(hra || 0),
                                    base: Number(basicSalary || 0)
                                },
                                update: {
                                    ctc: Number(basicSalary || 0) + Number(allowances || 0) + Number(hra || 0),
                                    base: Number(basicSalary || 0)
                                }
                            }
                        }
                    }
                    : {})
            },
            include: {
                salary: {
                    include: {
                        allowances: true
                    }
                }
            }
        })

        return res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            employee: toClientEmployee(employee)
        })
    } catch(e) {
        return res.status(500).json({
            success: false,
            message: "Unable to update employee",
            msg: "Unable to update employee",
            error: e
        })
    }
}

export const listUsers = async (req: AuthenticatedAdminRequest, res: Express.Response) => {
    const adminId = req.adminid
    if (!adminId) return res.status(400).json({
        success: false,
        message: "Unauthorized request",
        msg: "Unauthorized request"
    })

    try {
        const [employees, managers, company] = await prisma.$transaction([
            prisma.employee.findMany({
                where: {
                    companyId: adminId
                },
                orderBy: {
                    id: "desc"
                }
            }),
            prisma.manager.findMany({
                where: {
                    companyId: adminId
                },
                orderBy: {
                    id: "desc"
                }
            }),
            prisma.company.findUnique({
                where: {
                    id: adminId
                }
            })
        ])

        const users = [
            ...(company
                ? [{
                    id: `ADM-${company.id}`,
                    name: company.name,
                    email: company.email,
                    role: "admin",
                    isActive: true,
                    createdAt: new Date().toISOString()
                }]
                : []),
            ...managers.map(toClientManager),
            ...employees.map((employee) => ({
                id: String(employee.id),
                name: employee.name,
                email: employee.email,
                role: "employee",
                employeeId: `EMP-${String(employee.id).padStart(4, "0")}`,
                isActive: employee.status === "Active",
                createdAt: employee.joining.toISOString(),
                department: "Workforce",
                jobPosition: employee.role
            }))
        ]

        return res.status(200).json({
            success: true,
            users
        })
    } catch(e) {
        return res.status(500).json({
            success: false,
            message: "Error while fetching users",
            msg: "Error while fetching users",
            error: e
        })
    }
}
