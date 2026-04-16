import dotenv from 'dotenv';
dotenv.config(); 


export const env = {

    get MONGODB_URI() {
        return process.env.MONGODB_URI || '';
    },

    get PORT() {
        return process.env.PORT || '5000';
    },

    get NODE_ENV() {
        return process.env.NODE_ENV || 'development';
    }
}