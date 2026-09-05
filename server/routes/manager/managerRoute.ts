import { Router } from "express"
import { addEmployee, assignProject, assignTask, fetchTasks, fetchTickets, getDashboard, resolveTicket } from "../../controllers/managerController"
import { authMiddleware } from "../../middlewares/authMiddleware"

const managerRouter = Router()

managerRouter.get("/dashboard", authMiddleware, getDashboard)
managerRouter.post("/employees", authMiddleware, addEmployee)
managerRouter.get("/tickets", authMiddleware, fetchTickets)
managerRouter.delete("/tickets/:id", authMiddleware, resolveTicket)
managerRouter.post("/tickets/resolve", authMiddleware, resolveTicket)
managerRouter.post("/projects", authMiddleware, assignProject)
managerRouter.post("/tasks", authMiddleware, assignTask)
managerRouter.get("/tasks", authMiddleware, fetchTasks)

export { managerRouter }
