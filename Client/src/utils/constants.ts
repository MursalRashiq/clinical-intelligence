import axios from 'axios';

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
export const AUTH_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const USER_API_ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  VERIFY_OTP: "/auth/verify-otp",
  VERIFY_OTP_PASSWORD: "/auth/forgot-password-verify-otp",
  RESEND_OTP: "/auth/resend-otp",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  CHANGE_PASSWORD: "/auth/change-password",
} as const;

export const FRONTEND_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_OTP: "/verify-otp",
  FORGOT_PASSWORD: "/forgot-password",
  FORGOT_PASSWORD_OTP: "/forgot-password/otp",
  FORGOT_PASSWORD_RESET: "/forgot-password/reset",
  RESET_PASSWORD_LOGGED_IN: "/reset-password",
  PATIENT_PROFILE: "/profile",
  PATIENT_DETAILS: "/patient-details",


  DOCTOR_REGISTER: "/doctor/register",
  DOCTOR_LOGIN: "/doctor/login",
  DOCTOR_VERIFY_OTP: "/doctor/verify-otp",
  DOCTOR_PENDING: "/doctor/pending",

  DOCTOR_DASHBOARD: "/doctor/dashboard",
  DOCTOR_PROFILE: "/doctor/profile",
  DOCTOR_SLOTS: "/doctor/slots",
  DOCTOR_FORGOT_PASSWORD: "/doctor/forgot-password",
  DOCTOR_FORGOT_PASSWORD_OTP: "/doctor/forgot-password/otp",
  DOCTOR_FORGOT_PASSWORD_RESET: "/doctor/forgot-password/reset",
  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_PATIENTS: "/admin/patients",
  ADMIN_DOCTOR_VERIFICATION: "/admin/doctor-verification",
  ADMIN_DOCTOR_REQUESTS: "/admin/doctor-requests",
  ADMIN_DOCTOR_REQUEST_DETAILS: (id: string) => `/admin/doctor-requests/${id}`,
  FORGOT_PASSWORD_EMAIL: "admin/forgot/email",

  ADMIN_DOCTORS: "/admin/doctors",
  ADMIN_DOCTOR_DETAILS: (id: string) => `/admin/doctors/${id}`,
  ERROR_PAGE_404: "/patient/404",
  ADMIN_PATIENT_DETAILS: (id: string) => `/admin/patients/${id}`,
  DOCTORS: "/doctors",
};

export const AUTH_ROUTES = {
  USER_GOOGLE_LOGIN: "/auth/google",
  USER_GOOGLE_CALLBACK: "/auth/google/callback",
  DOCTOR_GOOGLE_LOGIN: "/auth/google/doctor",
  DOCTOR_GOOGLE_CALLBACK: "/auth/google/doctor/callback",
  LOGOUT: "/auth/logout",
} as const;

export const DOCTOR_API_ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  VERIFY_OTP: "/auth/verify-otp",
  VERIFY_OTP_PASSWORD: "/auth/forgot-password-verify-otp",
  RESEND_OTP: "/auth/resend-otp",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFICATION: "/doctors/verification",
  SUBMIT_VERIFICATION: "/doctors/submit-verification",
  GET_PROFILE: "/doctors/profile",
  RESUBMIT_VERIFICATION: "/doctors/resubmit-verification",
  UPDATE_DOCUMENTS: "/doctors/documents",
  GET_DOCUMENT_URL: (index: number) => `/doctors/document-url/${index}`,
  CHANGE_PASSWORD: "/auth/change-password",
  LIST_DOCTORS: "/doctors",
  SCHEDULE: "/doctors/schedule",

  SCHEDULE_BY_ID: (doctorId: string): string => `/doctors/schedule/${doctorId}`,
  BLOCK_DATE: (doctorId?: string): string => doctorId ? `/doctors/schedule/${doctorId}/block-date` : "/doctors/schedule/block-date",
  UNBLOCK_DATE: (doctorId?: string): string => doctorId ? `/doctors/schedule/${doctorId}/block-date` : "/doctors/schedule/block-date",
  AVAILABLE_SLOTS: (doctorId: string): string => `/doctors/schedule/${doctorId}/available-slots`,
  RECURRING_SLOTS: "/doctors/schedule/recurring-slots",
  DELETE_RECURRING_SLOT: (day: string, slotId: string): string => `/doctors/schedule/recurring-slots/${day}/${slotId}`,
  DELETE_RECURRING_SLOT_BY_TIME: (startTime: string, endTime: string): string => `/doctors/schedule/recurring-slots/by-time/${startTime}/${endTime}`,
  RELATED_DOCTORS: (doctorId: string): string => `/doctors/${doctorId}/related`,
} as const;

export const ADMIN_API_ROUTES = {
  LOGIN: "/admin/login",
  DASHBOARD: "/admin/dashboard",
  GET_PATIENTS: "/admin/patients",
  GET_USER_BY_ID: (userId: string) => `/admin/patients/${userId}`,
  UPDATE_USER: (userId: string) => `/admin/patients/${userId}`,
  BLOCK_USER: (userId: string) => `/admin/patients/${userId}/block`,
  UNBLOCK_USER: (userId: string) => `/admin/patients/${userId}/unblock`,
  GET_DOCTOR_REQUESTS: "/admin/doctor-requests",
  GET_DOCTOR_REQUEST_DETAILS: (doctorId: string) => `/admin/doctor-requests/${doctorId}`,
  APPROVE_DOCTOR: (doctorId: string) => `/admin/doctor-requests/${doctorId}/approve`,
  REJECT_DOCTOR: (doctorId: string) => `/admin/doctor-requests/${doctorId}/reject`,
  GET_DOCTORS: "/admin/doctors",
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;


export const USER_ROLES = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  ADMIN: "admin",
} as const;

export const SESSION_STATUS = {
  ACTIVE: 'ACTIVE',
  WAITING_FOR_DOCTOR: 'WAITING_FOR_DOCTOR',
  CONTINUED_BY_DOCTOR: 'CONTINUED_BY_DOCTOR',
  ENDED: 'ENDED',
  TEST_NEEDED: 'TEST_NEEDED',
} as const;

export type SessionStatus = typeof SESSION_STATUS[keyof typeof SESSION_STATUS];

export const isSessionActive = (status: SessionStatus): boolean => {
  return status === SESSION_STATUS.ACTIVE ||
    status === SESSION_STATUS.CONTINUED_BY_DOCTOR ||
    status === SESSION_STATUS.TEST_NEEDED;
};

export const canExtendSession = (status: SessionStatus): boolean => {
  return status === SESSION_STATUS.WAITING_FOR_DOCTOR;
};

export const isSessionLocked = (status: SessionStatus): boolean => {
  return status === SESSION_STATUS.ENDED;
};

