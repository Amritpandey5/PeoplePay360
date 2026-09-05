import { Router } from "express"
import { createEmployee, dashboard, listEmployees, listUsers, signin, signup, updateEmployee } from "../../controllers/adminController"
import { adminAuthMiddleware } from "../../middlewares/adminMiddleware"

const adminRouter = Router()

adminRouter.post("/signin", signin)
adminRouter.post("/signup", signup)
adminRouter.get("/dashboard", adminAuthMiddleware, dashboard)
adminRouter.get("/employees", adminAuthMiddleware, listEmployees)
adminRouter.post("/employees", adminAuthMiddleware, createEmployee)
adminRouter.patch("/employees/:id", adminAuthMiddleware, updateEmployee)
adminRouter.get("/users", adminAuthMiddleware, listUsers)

export { adminRouter }
