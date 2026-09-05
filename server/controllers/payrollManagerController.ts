import type { AuthenticatedRequest } from "../middlewares/authMiddleware"
import Express from "express"

export const getDashboard = async (req: AuthenticatedRequest, res: Express.Response) => {
    
}

export const getSalaryStructure = async (req: AuthenticatedRequest, res: Express.Response) => {
    const userid = req.userid
    const type = req.type
    if (!userid || !type || type === "employee" || type === "Hr_Manager") {
        return res.status(400).json({
            msg: "unauthorized request"
        })
    }
    return res.status(200).json({
        msg: "Salary Structure fetched successfully",
        data: SalaryStructure
    })
}

export const getSalaryRules = async (req: AuthenticatedRequest, res: Express.Response) => {
    const userid = req.userid
    const type = req.type
    if (!userid || !type || type === "employee" || type === "Hr_Manager") {
        return res.status(400).json({
            msg: "unauthorized request"
        })
    }
    return res.status(200).json({
        msg: "Salary Structure fetched successfully",
        data: SalaryRules
    })
}

export interface SalaryStructureType {
    role: string,
    allowances: Allowance
}

export type Allowance =  {
    hospital?: {
        maxAmount: number
    },
    travelMonthly?: {
        maxAmount: number
    },
    SportsAllowance?: {
        maxAmount: number
    },
    foodAllowance?:{
        maxAmount: number
    }
}

const SalaryStructure: SalaryStructureType[] = []

let SalaryRules

