import app from "./index";
import { connectDB } from "./db/db";
import dotenv from "dotenv"

dotenv.config()

async function startServer() {

    await connectDB();

    app.listen(process.env.PORT, () => {

        console.log(`🚀 Server running on port ${process.env.PORT}`);

    });

}

startServer();