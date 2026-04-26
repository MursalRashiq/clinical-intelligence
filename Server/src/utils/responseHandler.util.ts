import { Response } from "express";
import { HttpStatus } from "../constants/constants";
import { ApiResponse } from "../types/response.type";

export const sendSuccess = <T = unknown>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = HttpStatus.OK
): void => {
    const response : ApiResponse<T> = {
        success: true,
    };

    if (message) {
        response.message = message;
    }

    if (data !== undefined) {
        response.data = data;
    }

    res.status(statusCode).json(response);
}

export const sendError = (
    res: Response,
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
): void => {
    res.status(statusCode).json({
        success: false,
        message,
    });
};