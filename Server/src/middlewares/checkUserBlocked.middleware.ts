import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/user.model';
import { HttpStatus, MESSAGES } from '../constants/constants';

/**
 * Middleware to check if the authenticated user has been blocked/deactivated by an admin.
 * This should be placed AFTER authMiddleware to ensure req.user is populated.
 */
export const checkUserBlocked = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // JWTPayload uses `userId` — not `id`
        const userId = req.user?.userId;

        if (!userId) {
            res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: MESSAGES.UNAUTHORIZED,
            });
            return;
        }

        const user = await UserModel.findById(userId).select('isActive').lean();

        if (!user) {
            res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: MESSAGES.USER_NOT_FOUND,
            });
            return;
        }

        if (!user.isActive) {
            res.status(HttpStatus.FORBIDDEN).json({
                success: false,
                message: "Your account has been deactivated. Please contact support.",
            });
            return;
        }

        next();
    } catch (error) {
        console.error("[Middleware] Error in checkUserBlocked:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
