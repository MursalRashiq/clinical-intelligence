import { Types } from "mongoose";


export interface JsonTransformReturnType {
    id: string;
    [key: string]: unknown;
}