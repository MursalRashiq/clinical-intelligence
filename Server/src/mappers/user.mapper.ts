import { IUser, IUserDocument } from '../types/user.type';
import { BaseUserResponseDTO } from '../dtos/common.dto';
import {
  UserResponseDTO,
  UnifiedUserProfileResponseDTO,
} from '../dtos/user.dtos/user.dto';
import { PatientListItem } from '../types/common';
import { IDoctorDocument } from '../types/doctor.type';

export class UserMapper {
  static toDTO(user: IUserDocument): BaseUserResponseDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone ?? null,
      profileImage: user.profileImage ?? null,
      customId: user.customId,
      isActive: user.isActive,
    };
  }

  static toPatientListItem(user: IUserDocument): PatientListItem {
    return {
      id: user._id.toString(),
      customId: user.customId,
      name: user.name,
      email: user.email,
      phone: user.phone ?? null,
      profileImage: user.profileImage ?? null,
      gender: user.gender ?? null,
      dob: user.dob ?? null,
      bloodGroup: user.bloodGroup ?? null,
      address: user.address ?? null,
      city: user.city ?? null,
      state: user.state ?? null,
      country: user.country ?? null,
      pincode: user.pincode ?? null,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
      isActive: user.isActive,
    };
  }

  static toUserProfileDTO(user: IUserDocument): UserResponseDTO {
    const base = this.toDTO(user);
    return {
      ...base,
      gender: user.gender || null,
      dob: user.dob || null,
      customId: user.customId,
      bloodGroup: user.bloodGroup || null,
      address: user.address || null,
      city: user.city || null,
      state: user.state || null,
      country: user.country || null,
      pincode: user.pincode || null,
    };
  }

  static toUnifiedDTO(
    user: IUserDocument,
    doctor?: IDoctorDocument | null,
  ): UnifiedUserProfileResponseDTO {
    const userProfile = this.toUserProfileDTO(user);

    if (doctor) {
      return {
        ...userProfile,
        doctorProfileId: doctor._id.toString(),
        specialty: doctor.specialty ?? null,
        qualifications: doctor.qualifications,
        experienceYears: doctor.experienceYears,
        VideoFees: doctor.VideoFees,
        ChatFees: doctor.ChatFees,
        languages: doctor.languages,
        licenseNumber: doctor.licenseNumber,
        about: doctor.about,
        verificationStatus: doctor.verificationStatus,
      } as UnifiedUserProfileResponseDTO;
    }

    return userProfile;
  }
}
