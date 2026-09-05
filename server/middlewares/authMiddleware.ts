import Express from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"

export interface AuthenticatedRequest extends Express.Request {
    userid?: number,
    type?: "employee" | "Hr_Manager" | "Hr_Payroll" | "Hr_Payroll_Manager"
}

export const employeeAuthMiddleware = (req: AuthenticatedRequest, res: Express.Response, next: Express.NextFunction) => {
    const user = getEmployeeIdFromRequest(req)
    if (!user?.user_id) return res.status(400).json({
        msg: "Unauthorized request"
    })
    req.userid = user.user_id
    req.type = user.type
    next()
}

export const authMiddleware = employeeAuthMiddleware

const getEmployeeIdFromRequest = (req: Express.Request): {
    user_id: number,
    type: "employee" | "Hr_Manager" | "Hr_Payroll" | "Hr_Payroll_Manager"
} | null => {
    const token = req.cookies?.jwt
    if (!token) {
        return null
    }
    try {
        const decoded = jwt.verify(
            token,
            process.env["JWT_SECRET"] || "default_secret"
        ) as JwtPayload
        const parsedTokenUserId = Number(decoded.user_id)
        const type = String(decoded.type)

        if (Number.isInteger(parsedTokenUserId) && parsedTokenUserId > 0 && (type === "employee" || type === "Hr_Manager" || type === "Hr_Payroll" || type === "Hr_Payroll_Manager")) {
            return {
                user_id: parsedTokenUserId,
                type: type as "employee" | "Hr_Manager" | "Hr_Payroll" | "Hr_Payroll_Manager"
            }
        }
    } catch {
        return null
    }
    return null
}
