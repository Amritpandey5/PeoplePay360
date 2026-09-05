import express from 'express'
import cors from "cors";
import morgan from "morgan";
import authRoute from "./routes/authRoutes"
import cookieParser from "cookie-parser";
const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(morgan("dev"));

app.use('/auth',authRoute);
app.get("/", (_, res) => {

    res.send("PeoplePay360 Backend Running111");

});

export default app;