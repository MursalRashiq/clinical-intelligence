import express from "express";
import dotenv from "dotenv";
import logger from "./utils/logger";
import connectDB from "./config/db";
import morgan from "morgan";
import { env } from "./config/env";


dotenv.config()

connectDB();

const app = express()

app.use(morgan('dev'))

app.use(express.json({ limit: "50mb"}))
app.use(express.urlencoded({ limit: "50mb", extended: true}))


const PORT = env.PORT;
app.listen(PORT, () => {
    logger.info(`
=================================
 Server Started
 URL: http://localhost:${PORT}
 Mode: ${process.env.NODE_ENV}
=================================
`);
})

