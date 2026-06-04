export const API_VERSION = '/api/v1';

export const BASE_ROUTES = {
  AUTH: `${API_VERSION}/auth`,
  ADMIN: `${API_VERSION}/admin`,
  DOCTORS: `${API_VERSION}/doctors`,
  USERS: `${API_VERSION}/users`,
  PATIENTS: `${API_VERSION}/patients`,
  APPOINTMENTS: `${API_VERSION}/appointments`,
  PAYMENTS: `${API_VERSION}/payments`,
} as const;

export const USER_ROUTES = {
  ME: '/me',
  DOCTORS: '/doctors',
  DOCTOR_DETAILS: '/doctors/:id',
  UPDATE_PROFILE: '/update-profile',
  DELETE_PROFILE: '/delete-profile',
};

export const AUTH_ROUTES = {
  GOOGLE: '/google',
  GOOGLE_CALLBACK: '/google/callback',
  GOOGLE_DOCTOR: '/google/doctor',
  REGISTER: '/register',
  VERIFY_OTP: '/verify-otp',
  RESEND_OTP: '/resend-otp',
  LOGIN: '/login',
  LOGOUT: '/logout',

  FORGOT_PASSWORD: '/forgot-password',
  FORGOT_PASSWORD_VERIFY_OTP: '/forgot-password-verify-otp',
  RESET_PASSWORD: '/reset-password',

  CHANGE_PASSWORD: '/change-password',
  REFRESH_TOKEN: '/refresh-token',
} as const;

export const ADMIN_ROUTES = {
  LOGIN: '/login',

  ALL_PATIENTS: '/patients',
  PATIENT_BY_ID: '/patients/:patientId',
  PATIENT_BLOCK: '/patients/:patientId/block',
  PATIENT_UNBLOCK: '/patients/:patientId/unblock',

  DOCTOR_REQUESTS: '/doctor-requests',
  DOCTOR_REQUEST_DETAILS: '/doctor-requests/:doctorId',
  APPROVE_DOCTOR: '/doctor-requests/:doctorId/approve',
  REJECT_DOCTOR: '/doctor-requests/:doctorId/reject',
  ALL_DOCTORS: '/doctors',
} as const;

export const PAYMENT_ROUTES = {
  RAZORPAY_ORDER: '/razorpay/order',
  RAZORPAY_VERIFY: '/razorpay/verify',
  UNLOCK_SLOT: '/unlock-slot',
} as const;

export const APPOINTMENT_ROUTES = {
  CREATE: '/',
  MY_APPOINTMENTS: '/my-appointments',
  GET_BY_ID: '/:id',
  CANCEL: '/:id/cancel',
  DOCTOR_REQUESTS: '/doctor/requests',
  DOCTOR_APPOINTMENTS: '/doctor/list',
  APPROVE: '/:id/approve',
  REJECT: '/:id/reject',
  COMPLETE: '/:id/complete',
  RESCHEDULE: '/:id/reschedule',
  ACCEPT_RESCHEDULE: '/:id/reschedule/accept',
  REJECT_RESCHEDULE: '/:id/reschedule/reject',
  ADMIN_ALL: '/admin/all',
  START_CONSULTATION: '/:id/start-consultation',
  UPDATE_SESSION_STATUS: '/:id/session-status',
  ENABLE_CHAT: '/:id/enable-chat',
  DISABLE_CHAT: '/:id/disable-chat',
  UPDATE_NOTES: '/:id/notes',
} as const;
