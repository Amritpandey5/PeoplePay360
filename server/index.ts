import express from "express";
import cors from "cors";
import morgan from "morgan";

import attendanceRoutes from "./routes/attendanceRoutes.ts";

const app = express();

/*
  Required when the application is behind a proxy.
  This allows Express to correctly read
  x-forwarded-for.

  For production, configure this according
  to your actual proxy/load balancer.
*/
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

app.use(morgan("dev"));

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/", (_, res) => {
    res.send("PeoplePay360 Backend Running");
});

/* =========================================================
   ATTENDANCE
========================================================= */

app.use(
    "/api/attendance",
    attendanceRoutes
);

export default app;