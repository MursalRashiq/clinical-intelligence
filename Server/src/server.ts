import express from "express";
import dotenv from "dotenv";
import logger from "./utils/logger";
import connectDB from "./config/db";
import morgan from "morgan";
import { env } from "./config/env";
import cookieParser from "cookie-parser";
import session from 'express-session';
import cors from 'cors'
import passport from 'passport';


import authRouter from './routes/auth.router';
import adminRouter from './routes/admin.route'
import { CONFIG } from "./constants/constants";
import { BASE_ROUTES } from "./constants/routes.constants";


dotenv.config()

const sessionSecret = env.SESSION_SECRET
if (!sessionSecret) {
    throw new Error("SESSION_SECRET is required")
}

connectDB();
const app = express()

const corsOptions = {
  origin: (requestOrigin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {

    if (!requestOrigin) return callback(null, true);

    const allowedOrigins = [env.CLIENT_URL, env.CLIENT_URL_1, env.CLIENT_URL_2];

    if (allowedOrigins.includes(requestOrigin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(morgan('dev'))
app.use(cookieParser())
app.use(express.json({ limit: "50mb"}))
app.use(express.urlencoded({ limit: "50mb", extended: true}))

app.use(
    session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: CONFIG.SESSION_MAX_AGE
        }
    })
)

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Clinical Intelligence API is running...",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
    })
})

app.use(BASE_ROUTES.AUTH, authRouter);
app.use(BASE_ROUTES.ADMIN, adminRouter);

import { errorHandler } from "./middlewares/error.handler.middleware";
app.use(errorHandler);


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

