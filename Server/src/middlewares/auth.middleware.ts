import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import { HttpStatus, MESSAGES } from '../constants/constants';
import { JWTPayload } from '../types/auth.type';

declare global {
    namespace Express {
        interface User extends JWTPayload {
            _id?: unknown;
            id?: string;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(" ")[1];

        if (!token) {
            console.log("[AuthMiddleware] 401: No token provided");
            res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: MESSAGES.ACCESS_TOKEN_MISSING,
            });
            return;
        }

        try {
            const decoded = verifyAccessToken(token);
            req.user = decoded;
            next();
        } catch (error: any) {
            console.log(`[AuthMiddleware] 401: Verification failed for token: ${token.substring(0, 10)}... Error: ${error.message}`);
            res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: MESSAGES.INVALID_ACCESS_TOKEN,
            });
        }
    } catch (error: any) {
        console.error("[AuthMiddleware] Critical error:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
}