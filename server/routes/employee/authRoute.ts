import { Router } from "express";
import { getDashboard, getAttendence, myPaySlips, myProjects, myTasks, myTickets, raiseTicket, signin, signout } from "../../controllers/employeeController";
import { checkIn, checkOut, todayAttendance, verifyOfficeNetwork } from "../../controllers/attendanceController";
import { authMiddleware } from "../../middlewares/authMiddleware";

const authRouter = Router()
authRouter.post('/signin', signin)
authRouter.post('/signout', authMiddleware, signout)
authRouter.post('/logout', authMiddleware, signout)
authRouter.get('/me', authMiddleware, getDashboard)
authRouter.get('/dashboard', authMiddleware, getDashboard)
authRouter.get('/attendance', authMiddleware, getAttendence)
authRouter.get('/attendance/today', authMiddleware, todayAttendance)
authRouter.post('/attendance/check-in', authMiddleware, checkIn)
authRouter.post('/attendance/check-out', authMiddleware, checkOut)
authRouter.get('/attendance/verification', verifyOfficeNetwork)
authRouter.post('/tickets', authMiddleware, raiseTicket)
authRouter.get('/tickets', authMiddleware, myTickets)
authRouter.get('/payslips', authMiddleware, myPaySlips)
authRouter.get('/tasks', authMiddleware, myTasks)
authRouter.get('/projects', authMiddleware, myProjects)

export { authRouter }
