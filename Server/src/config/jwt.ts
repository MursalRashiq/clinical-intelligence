import { env } from "../config/env";

export const JWT_CONFIG = {
    SECRET: env.ACCESS_TOKEN_SECRET,
    expireIn: env.ACCESS_TOKEN_EXPIRES_IN,
    refreshExpireIn: env.REFRESH_TOKEN_EXPIRES_IN,
}