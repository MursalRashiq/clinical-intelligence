import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { AppointmentService } from '../services/appointment.service';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { DoctorRepository } from '../repositories/doctor.repository';
import { UserRepository } from '../repositories/user.repository';
import { SlotRepository } from '../repositories/slot.repository';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAdmin, requireRole } from '../middlewares/role.middleware';
import { APPOINTMENT_ROUTES } from '../constants/routes.constants';
import { LoggerService } from '../services/logger.service';

const appointmentRouter = Router();

const appointmentRepository = new AppointmentRepository();
const doctorRepository = new DoctorRepository();
const userRepository = new UserRepository();
const slotRepository = new SlotRepository();

const appointmentServiceLogger = new LoggerService('AppointmentService');
const appointmentControllerLogger = new LoggerService('AppointmentController');

const logger = new LoggerService('AppointmentRouter');

const appointmentService = new AppointmentService(
  appointmentRepository,
  userRepository,
  doctorRepository,
  slotRepository,
  logger,
);

const appointmentController = new AppointmentController(
  appointmentService,
  appointmentControllerLogger,
);

appointmentRouter.post(
  APPOINTMENT_ROUTES.CREATE,
  authMiddleware,
  appointmentController.createAppointment,
);

appointmentRouter.get(
  APPOINTMENT_ROUTES.MY_APPOINTMENTS,
  authMiddleware,
  appointmentController.getMyAppointments,
);

appointmentRouter.get(
  APPOINTMENT_ROUTES.DOCTOR_REQUESTS,
  authMiddleware,
  appointmentController.getDoctorAppointmentRequests,
);

appointmentRouter.get(
  APPOINTMENT_ROUTES.DOCTOR_APPOINTMENTS,
  authMiddleware,
  appointmentController.getDoctorAppointments,
);

appointmentRouter.get(
  APPOINTMENT_ROUTES.ADMIN_ALL,
  authMiddleware,
  requireAdmin,
  appointmentController.getAllAppointments,
);

appointmentRouter.put(
  APPOINTMENT_ROUTES.CANCEL,
  authMiddleware,
  requireRole('admin', 'doctor', 'patient'),
  appointmentController.cancelAppointment,
);

appointmentRouter.put(
  APPOINTMENT_ROUTES.RESCHEDULE,
  authMiddleware,
  requireRole('admin', 'patient', 'doctor'),
  appointmentController.rescheduleAppointment,
);

appointmentRouter.put(
  APPOINTMENT_ROUTES.ACCEPT_RESCHEDULE,
  authMiddleware,
  requireRole('patient'),
  appointmentController.acceptReschedule,
);

appointmentRouter.put(
  APPOINTMENT_ROUTES.REJECT_RESCHEDULE,
  authMiddleware,
  requireRole('patient'),
  appointmentController.rejectReschedule,
);

appointmentRouter.put(
  APPOINTMENT_ROUTES.APPROVE,
  authMiddleware,
  appointmentController.approveAppointmentRequest,
);

appointmentRouter.put(
  APPOINTMENT_ROUTES.REJECT,
  authMiddleware,
  appointmentController.rejectAppointmentRequest,
);

appointmentRouter.put(
  APPOINTMENT_ROUTES.COMPLETE,
  authMiddleware,
  appointmentController.completeAppointment,
);

appointmentRouter.get(
  APPOINTMENT_ROUTES.GET_BY_ID,
  authMiddleware,
  appointmentController.getAppointmentById,
);

export default appointmentRouter;
