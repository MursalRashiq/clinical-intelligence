import { Types, Document } from 'mongoose';

export interface userData {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  googleId?: string;
}
