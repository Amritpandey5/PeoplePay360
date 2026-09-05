import express from "express"
import cookieParser from "cookie-parser"
import { authRouter } from "./routes/employee/authRoute"
import { adminRouter } from "./routes/admin/adminRoute"
import { managerRouter } from "./routes/manager/managerRoute"
import { attendanceRouter } from "./routes/attendance/attendanceRoute"

const app = express()

app.use((req, res, next) => {
    const origin = req.headers.origin
    if (origin) {
        res.header("Access-Control-Allow-Origin", origin)
    }
    res.header("Access-Control-Allow-Credentials", "true")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")

    if (req.method === "OPTIONS") {
        return res.sendStatus(204)
    }

    next()
})

app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRouter)
app.use('/employee', authRouter)
app.use('/admin', adminRouter)
app.use('/manager', managerRouter)
app.use('/api/admin', adminRouter)
app.use('/api/attendance', attendanceRouter)

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Server is running in port ${port}`)
})
