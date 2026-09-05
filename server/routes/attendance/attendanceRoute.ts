import { Router } from "express"
import { checkIn, checkOut, todayAttendance, verifyOfficeNetwork } from "../../controllers/attendanceController"
import { authMiddleware } from "../../middlewares/authMiddleware"

const attendanceRouter = Router()

attendanceRouter.get("/verification", verifyOfficeNetwork)
attendanceRouter.get("/today/:employeeId", todayAttendance)
attendanceRouter.get("/today", authMiddleware, todayAttendance)
attendanceRouter.post("/check-in", authMiddleware, checkIn)
attendanceRouter.post("/check-out", authMiddleware, checkOut)

export { attendanceRouter }
