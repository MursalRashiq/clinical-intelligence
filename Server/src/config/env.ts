import dotenv from 'dotenv';
dotenv.config(); 


export const env = {

    get MONGODB_URI() {
        return process.env.MONGO_URI || '';
    },

    get PORT() {
        return process.env.PORT || '3000';
    },

    get NODE_ENV() {
        return process.env.NODE_ENV || 'development';
    },

    get ACCESS_TOKEN_SECRET() {
        return process.env.ACCESS_TOKEN_SECRET || '';
    },

    get REFRESH_TOKEN_SECRET() {
        return process.env.REFRESH_TOKEN_SECRET || '';
    },

    get ACCESS_TOKEN_EXPIRES_IN(){
        return process.env.ACCESS_TOKEN_EXPIRE || "30m"
    },

    get REFRESH_TOKEN_EXPIRES_IN() {
        return process.env.REFRESH_TOKEN_EXPIRES_IN || "30d"
    },

    get REFRESH_TOKEN_MAX_AGE() {
        return Number(process.env.REFRESH_TOKEN_MAX_AGE);
    },

    get SESSION_MAX_AGE() {
        return Number(process.env.SESSION_MAX_AGE);
    },

    get SMTP_HOST() {
        return process.env.SMTP_HOST || "";
    },

    get SMTP_PORT() {
        return process.env.SMTP_PORT || "";
    },

    get SMTP_USER() {
        return process.env.SMTP_USER || "";
    },

    get SMTP_PASS() {
        return process.env.SMTP_PASS || "";
    },

    get SESSION_SECRET() {
        return process.env.SESSION_SECRET;
    },

    get CLIENT_URL() {
        return process.env.CLIENT_URL;
    },

    get CLIENT_URL_1() {
        return process.env.CLIENT_URL_1
    },

    get CLIENT_URL_2() {
        return process.env.CLIENT_URL_2
    },

    get GOOGLE_CLIENT_ID() {
        return process.env.GOOGLE_CLIENT_ID ||  ""
    },

    get GOOGLE_CLIENT_SECRET() {
        return process.env.GOOGLE_CLIENT_SECRET ||  ""
    },

    get GOOGLE_CALLBACK_URL() {
        return process.env.GOOGLE_CALLBACK_URL ||  ""
    },
}