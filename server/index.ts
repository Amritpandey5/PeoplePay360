import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import attendanceRoutes from "./routes/attendanceRoutes.ts";
import authRoute from "./routes/authRoutes";

const app = express();

app.set("trust proxy", true);

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(cookieParser());

app.use(morgan("dev"));

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/", (_, res) => {
    res.send("PeoplePay360 Backend Running");
});

/* =========================================================
   AUTH
========================================================= */

app.use("/auth", authRoute);

/* =========================================================
   ATTENDANCE
========================================================= */

app.use("/api/attendance", attendanceRoutes);

export default app;