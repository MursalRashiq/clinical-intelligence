import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { checkUserBlocked } from '../middlewares/check-user-blocked.middleware';
import { requirePatient } from '../middlewares/role.middleware';
import { PAYMENT_ROUTES } from '../constants/routes.constants';
import { PaymentController } from '../controllers/payment.controller';
import { PaymentService } from '../services/payment.service';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { DoctorRepository } from '../repositories/doctor.repository';
import { UserRepository } from '../repositories/user.repository';

const paymentRouter = Router();

const appointmentRepository = new AppointmentRepository();
const doctorRepository = new DoctorRepository();
const userRepository = new UserRepository();

import { LoggerService } from '../services/logger.service';

const paymentServiceLogger = new LoggerService('PaymentService');

const paymentService = new PaymentService(
  appointmentRepository,
  doctorRepository,
  userRepository,
  paymentServiceLogger,
);

const paymentController = new PaymentController(paymentService);

console.log('paymentRoutes file loaded');

paymentRouter.post(
  PAYMENT_ROUTES.RAZORPAY_ORDER,
  (req, res, next) => {
    console.log('Route hit 1');
    next();
  },
  authMiddleware,
  (req, res, next) => {
    console.log('Route hit 2');
    next();
  },
  checkUserBlocked,
  (req, res, next) => {
    console.log('Route hit 3');
    next();
  },
  requirePatient,
  (req, res, next) => {
    console.log('Route hit 4');
    next();
  },
  paymentController.createRazorpayOrder,
);

paymentRouter.post(
  PAYMENT_ROUTES.RAZORPAY_VERIFY,
  authMiddleware,
  checkUserBlocked,
  requirePatient,
  paymentController.verifyRazorpayPayment,
);

paymentRouter.post(
  PAYMENT_ROUTES.UNLOCK_SLOT,
  authMiddleware,
  checkUserBlocked,
  requirePatient,
  paymentController.unlockSlot,
);

export default paymentRouter;
