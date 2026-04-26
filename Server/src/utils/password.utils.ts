import bcrypt from "bcrypt";
import { ValidationError } from "../errors/AppError";
import { MESSAGES } from "../constants/constants";

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
    password: string,
    hash: string
): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

export const validatePassword = (password: string): void => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if(!strongPasswordRegex.test(password)) {
        throw new ValidationError(MESSAGES.WEAK_PASSWORD);
    }
};

export const validatePasswordsMatch = (password: string, confirmPassword: string): void => {
    if(password !== confirmPassword) {
        throw new ValidationError(MESSAGES.PASSWORDS_DO_NOT_MATCH);
    }
};