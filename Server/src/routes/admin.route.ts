import { Router } from 'express';
import { AdminRepository } from '../repositories/admin.repoitory';
import { UserRepository } from '../repositories/user.repository';
import { DoctorRepository } from '../repositories/doctor.repository';
import { LoggerService } from '../services/logger.service';
import { AdminController } from '../controllers/admin.controller';
import { AdminService } from '../services/admin.service';
import { ADMIN_ROUTES } from '../constants/routes.constants';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';
import { checkUserBlocked } from '../middlewares/check-user-blocked.middleware';
const router = Router();

const adminRepository = new AdminRepository();
const userRepository = new UserRepository();
const adminServiceLogger = new LoggerService();
const doctorRepository = new DoctorRepository();
const adminService = new AdminService(
  adminRepository,
  userRepository,
  doctorRepository,
  adminServiceLogger,
);
const adminController = new AdminController(adminService);

router.post(ADMIN_ROUTES.LOGIN, adminController.login);

router.get(
  ADMIN_ROUTES.ALL_PATIENTS,
  authMiddleware,
  checkUserBlocked,
  requireAdmin,
  adminController.getAllPatients,
);
router.get(
  ADMIN_ROUTES.PATIENT_BY_ID,
  authMiddleware,
  checkUserBlocked,
  requireAdmin,
  adminController.getPatientById,
);
router.post(
  ADMIN_ROUTES.PATIENT_BLOCK,
  authMiddleware,
  checkUserBlocked,
  requireAdmin,
  adminController.blockPatient,
);
router.post(
  ADMIN_ROUTES.PATIENT_UNBLOCK,
  authMiddleware,
  checkUserBlocked,
  requireAdmin,
  adminController.unblockPatient,
);
router.get(
  ADMIN_ROUTES.DOCTOR_REQUESTS,
  authMiddleware,
  checkUserBlocked,
  requireAdmin,
  adminController.getDoctorRequests,
);
router.get(
  ADMIN_ROUTES.DOCTOR_REQUEST_DETAILS,
  authMiddleware,
  checkUserBlocked,
  requireAdmin,
  adminController.getDoctorRequestDetails,
);
router.post(
  ADMIN_ROUTES.APPROVE_DOCTOR,
  authMiddleware,
  checkUserBlocked,
  requireAdmin,
  adminController.approveDoctorRequest,
);
router.post(
  ADMIN_ROUTES.REJECT_DOCTOR,
  authMiddleware,
  checkUserBlocked,
  requireAdmin,
  adminController.rejectDoctorRequest,
);
router.get(
  ADMIN_ROUTES.ALL_DOCTORS,
  authMiddleware,
  checkUserBlocked,
  requireAdmin,
  adminController.getAllDoctors,
);

export default router;
