import { IBaseRepository } from "./IBase.repository";
import { IOTPDocument } from "../../models/otp.model";


export interface IOTPRepository extends IBaseRepository<IOTPDocument> {
    findByEmailAndOtp(email: string, otp: string): Promise<IOTPDocument | null>;
    updateOtp(email: string, data: { otp: string | null; otpExpiresAt?: Date; expiresAt?: Date }): Promise<IOTPDocument | null>;
    deleteByEmaill(email: string): Promise<void>;
    isValid(email: string, otp: string): Promise<boolean>;
    findAll(): Promise<IOTPDocument[]>;
    count(): Promise<number>; 
}