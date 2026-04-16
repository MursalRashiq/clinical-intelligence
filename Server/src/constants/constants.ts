import { StatusCodes } from 'http-status-codes';
import { env } from '../config/env';


export const ROLES = {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    PATIENT: 'patient'
} as const;

export const GENDER = {
    MALE: 'male',
    FEMALE: 'female',
    OTHER: 'other'
} as const;


export enum HttpStatus {
    OK = StatusCodes.OK,
    CREATED = StatusCodes.CREATED,
    BAD_REQUEST = StatusCodes.BAD_REQUEST,
    UNAUTHORIZED = StatusCodes.UNAUTHORIZED,
    FORBIDDEN = StatusCodes.FORBIDDEN,
    NOT_FOUND = StatusCodes.NOT_FOUND,
    CONFLICT = StatusCodes.CONFLICT,
    INTERNAL_SERVER_ERROR = StatusCodes.INTERNAL_SERVER_ERROR,
    GONE = StatusCodes.GONE,
    UNPROCESSABLE_ENTITY = StatusCodes.UNPROCESSABLE_ENTITY,
    TOO_MANY_REQUESTS = StatusCodes.TOO_MANY_REQUESTS,
    SERVICE_UNAVAILABLE = StatusCodes.SERVICE_UNAVAILABLE,
    NOT_IMPLEMENTED = StatusCodes.NOT_IMPLEMENTED,
    BAD_GATEWAY = StatusCodes.BAD_GATEWAY,
    REQUEST_TIMEOUT = StatusCodes.REQUEST_TIMEOUT
}