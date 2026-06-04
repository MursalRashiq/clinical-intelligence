export interface UserProfile {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    phone?: string;
    role: 'patient' | 'doctor' | 'admin';
    profileImage?: string;
    specialty?: string;
    department?: string;
    experience?: number;
    consultationFee?: number;
    bio?: string;
    customId?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        pinCode?: string;
    };
    isVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
    doctorProfileId?: string;
    verificationStatus?: string;
    rejectionReason?: string;
    isActive?: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  duration: string;
  fee: number;
  rating: number;
  available: boolean;
  photo: string;
  specialtyColor: { bg: string; color: string };
  animDelay: string;
  emoji: string;
}
