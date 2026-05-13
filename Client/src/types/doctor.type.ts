export interface DoctorResponseDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "doctor";
  profileImage?: string | null;
  gender?: "male" | "female" | "other" | null;
  dob?: string | null;
  verificationStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string | null;
  licenseNumber?: string | null;
  qualifications: string[];
  specialty?: string | null;
  speciality?: string | null; // Alias
  experienceYears?: number | null;
  VideoFees?: number | null;
  ChatFees?: number | null;
  languages?: string[];
  ratingAvg?: number;
  ratingCount?: number;
  image?: string | null; // Alias
  signature?: string | null;
}



export interface SubmitVerificationDTO {
  degree: string;
  experience: string;
  speciality: string;
  videoFees: string;
  chatFees: string;
  certificateFile?: File | null;
}

export interface FormData {
  Name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  // Step 2 – Verification
  licenseNumber: string;
  degree: string;
  yearsOfPractice: string;
  primarySpecialty: string;
  customSpecialty: string;
  about: string;
  // Step 3 – Specialty (reuses Step 2 specialty fields, step 3 is just specialty)
  // Step 4 – Fees
  videoFee: string;
  videoEnabled: boolean;
  chatFee: string;
  chatEnabled: boolean;
  // Step 5 – Documents
  medicalLicense: File | null;
  degreeCertificate: File | null;
}