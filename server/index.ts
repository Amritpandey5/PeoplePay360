import express from 'express'
import cors from "cors";
import morgan from "morgan";

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.get("/", (_, res) => {

    res.send("PeoplePay360 Backend Running111");

});

export default app;