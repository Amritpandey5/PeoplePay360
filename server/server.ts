import app from "./index";
import { connectDB } from "./db/db";
import { ENV } from "./db/env";

async function startServer() {

    await connectDB();

    app.listen(ENV.PORT, () => {

        console.log(`🚀 Server running on port ${ENV.PORT}`);

    });

}

startServer();