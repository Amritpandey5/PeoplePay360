import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./db/db.ts";
connectDB();
console.log("Hello via Bun!");