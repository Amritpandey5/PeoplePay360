import Express from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"

export interface AuthenticatedAdminRequest extends Express.Request {
    adminid?: number
}

export const adminAuthMiddleware = (req: AuthenticatedAdminRequest, res: Express.Response, next: Express.NextFunction) => {
    const adminid = getAdminIdFromRequest(req)
    if (!adminid) return res.status(400).json({
        msg: "Unauthorized request"
    })
    req.adminid = adminid
    next()
}

export const employeeAuthMiddleware = adminAuthMiddleware

const getAdminIdFromRequest = (req: Express.Request): number | null => {
    const token = req.cookies?.admin_jwt
    if (!token) {
        return null
    }
    try {
        const decoded = jwt.verify(
            token,
            process.env["JWT_SECRET"] || "default_secret"
        ) as JwtPayload
        const parsedTokenAdminId = Number(decoded.admin_id)
        const type = String(decoded.type)

        if (Number.isInteger(parsedTokenAdminId) && parsedTokenAdminId > 0 && type === "admin") {
            return parsedTokenAdminId
        }
    } catch {
        return null
    }
    return null
}
