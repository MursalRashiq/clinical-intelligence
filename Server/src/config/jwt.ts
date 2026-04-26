import { env } from "../config/env";

export const JWT_CONFIG = {
    SECRET: env.ACCESS_TOKEN_SECRET,
    expireIn: "7d",
    refreshExpireIn: "30d",
}