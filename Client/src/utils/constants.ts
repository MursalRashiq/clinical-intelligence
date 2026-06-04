export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
export const AUTH_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const USER_API_ROUTES = {
  LOGIN: "api/v1/auth/login",
  REGISTER: "api/v1/auth/register",
  VERIFY_OTP: "api/v1/auth/verify-otp",
  VERIFY_OTP_PASSWORD: "api/v1/auth/forgot-password-verify-otp",
  RESEND_OTP: "api/v1/auth/resend-otp",
  FORGOT_PASSWORD: "api/v1/auth/forgot-password",
  RESET_PASSWORD: "api/v1/auth/reset-password",
  CHANGE_PASSWORD: "api/v1/auth/change-password",
  GET_AllDOCTORS: "api/v1/users/doctors",
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
  DOCTOR_REQUESTS: "/doctor/requests",
  DOCTOR_APPOINTMENTS: "/doctor/appointments",
  APPOINTMENT_DETAILS: (id: string) => `/doctor/appointments/${id}`,
  DOCTOR_FORGOT_PASSWORD: "/doctor/forgot-password",
  DOCTOR_FORGOT_PASSWORD_OTP: "/doctor/forgot-password/otp",
  DOCTOR_FORGOT_PASSWORD_RESET: "/doctor/forgot-password/reset",
  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_PATIENTS: "/admin/patients",
  ADMIN_APPOINTMENTS: "/admin/appointments",
  ADMIN_DOCTOR_VERIFICATION: "/admin/doctor-verification",
  ADMIN_DOCTOR_REQUESTS: "/admin/doctor-requests",
  ADMIN_DOCTOR_REQUEST_DETAILS: (id: string) => `/admin/doctor-requests/${id}`,
  FORGOT_PASSWORD_EMAIL: "admin/forgot/email",

  ADMIN_DOCTORS: "/admin/doctors",
  ADMIN_DOCTOR_DETAILS: (id: string) => `/admin/doctors/${id}`,
  ERROR_PAGE_404: "/patient/404",
  ADMIN_PATIENT_DETAILS: (id: string) => `/admin/patients/${id}`,
  DOCTORS: "/doctors",
  DOCTOR_DETAILS: "/doctors/:id",
  APPOINTMENT_BOOKING: "/doctors/:id/book",
};

export const AUTH_ROUTES = {
  USER_GOOGLE_LOGIN: "/auth/google",
  USER_GOOGLE_CALLBACK: "/auth/google/callback",
  DOCTOR_GOOGLE_LOGIN: "/auth/google/doctor",
  DOCTOR_GOOGLE_CALLBACK: "/auth/google/doctor/callback",
  LOGOUT: "api/v1/auth/logout",
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
  UNBLOCK_DATE: (doctorId?: string): string => doctorId ? `/doctors/schedule/${doctorId}/unblock-date` : "/doctors/schedule/unblock-date",
  DELETE_SCHEDULE: (doctorId?: string): string => doctorId ? `/doctors/schedule/${doctorId}` : "/doctors/schedule",
  AVAILABLE_SLOTS: (doctorId: string): string => `/doctors/schedule/${doctorId}/available-slots`,
  RECURRING_SLOTS: "/doctors/schedule/recurring-slots",
  DELETE_RECURRING_SLOT: (day: string, slotId: string): string => `/doctors/schedule/recurring-slots/${day}/${slotId}`,
  DELETE_RECURRING_SLOT_BY_TIME: (startTime: string, endTime: string): string => `/doctors/schedule/recurring-slots/by-time/${startTime}/${endTime}`,
  SPECIFIC_DATE_SLOTS: "/doctors/schedule/specific-date-slots",
  DELETE_SPECIFIC_DATE_SLOT: (date: string, slotId: string): string => `/doctors/schedule/specific-date-slots/${date}/${slotId}`,
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


export const APPOINTMENT_API_ROUTES = {
  CREATE: "/appointments",
  MY_APPOINTMENTS: "/appointments/my-appointments",
  GET_BY_ID: (id: string): string => `/appointments/${id}`,
  CANCEL: (id: string): string => `/appointments/${id}/cancel`,
  DOCTOR_REQUESTS: "/appointments/doctor/requests",
  DOCTOR_LIST: "/appointments/doctor/list",
  APPROVE: (id: string): string => `/appointments/${id}/approve`,
  REJECT: (id: string): string => `/appointments/${id}/reject`,
  COMPLETE: (id: string): string => `/appointments/${id}/complete`,
  RESCHEDULE: (id: string): string => `/appointments/${id}/reschedule`,
  ACCEPT_RESCHEDULE: (id: string): string => `/appointments/${id}/reschedule/accept`,
  REJECT_RESCHEDULE: (id: string): string => `/appointments/${id}/reschedule/reject`,
  ADMIN_ALL: "/appointments/admin/all",
  START_CONSULTATION: (id: string): string => `/appointments/${id}/start-consultation`,
  UPDATE_SESSION_STATUS: (id: string): string => `/appointments/${id}/session-status`,
  ENABLE_CHAT: (id: string): string => `/appointments/${id}/enable-chat`,
  DISABLE_CHAT: (id: string): string => `/appointments/${id}/disable-chat`,
  UPDATE_NOTES: (id: string): string => `/appointments/${id}/notes`,
} as const;


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


export const APPOINTMENT_TYPE = {
  VIDEO: "video",
  CHAT: "chat",
} as const;

export const PAYMENT_API_ROUTES = {
  RAZORPAY_ORDER: "/payments/razorpay/order",
  RAZORPAY_VERIFY: "/payments/razorpay/verify",
  UNLOCK_SLOT: "/payments/unlock-slot",
} as const;

export type AppointmentType = typeof APPOINTMENT_TYPE[keyof typeof APPOINTMENT_TYPE];

export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  UPCOMING: "upcoming",
  RESCHEDULE_REQUESTED: "reschedule_requested",
} as const;

export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];

export const CANCELED_BY = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  ADMIN: "admin",
} as const;

export type CanceledBy = typeof CANCELED_BY[keyof typeof CANCELED_BY];

export const PAYMENT_METHOD = {
  CARD: "card",
  UPI: "upi",
  WALLET: "wallet",
  NETBANKING: "netbanking",
} as const;

export type PaymentMethod = typeof PAYMENT_METHOD[keyof typeof PAYMENT_METHOD];

export const DOC_NOTE_CATEGORY = {
  OBSERVATION: "observation",
  DIAGNOSIS: "diagnosis",
  MEDICINE: "medicine",
  LAB_TEST: "lab_test",
} as const;

export type DocNoteCategory = typeof DOC_NOTE_CATEGORY[keyof typeof DOC_NOTE_CATEGORY];

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  REFUNDED: "refunded",
  FAILED: "failed",
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
