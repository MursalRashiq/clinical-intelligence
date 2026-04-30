import { Router } from "express";
import { AdminRepository } from "../repositories/admin.repoitory";
import { UserRepository } from "../repositories/user.repository";
import { LoggerService } from "../services/logger.service";
import { AdminController } from "../controllers/admin.controller";
import { AdminService } from "../services/admin.service";
import { ADMIN_ROUTES } from '../constants/routes.constants'
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { checkUserBlocked } from "../middlewares/check-user-blocked.middleware";
const router = Router()

const adminRepository = new AdminRepository();
const userRepository = new UserRepository();
const adminServiceLogger = new LoggerService();
const adminService = new AdminService(adminRepository, userRepository, adminServiceLogger);
const adminController = new AdminController(adminService)

router.post(ADMIN_ROUTES.LOGIN, adminController.login);

router.get(ADMIN_ROUTES.ALL_PATIENTS, authMiddleware, checkUserBlocked, requireAdmin, adminController.getAllPatients);
router.get(ADMIN_ROUTES.PATIENT_BY_ID, authMiddleware, checkUserBlocked, requireAdmin, adminController.getPatientById);
router.post(ADMIN_ROUTES.PATIENT_BLOCK, authMiddleware, checkUserBlocked, requireAdmin, adminController.blockPatient);
router.post(ADMIN_ROUTES.PATIENT_UNBLOCK, authMiddleware, checkUserBlocked, requireAdmin, adminController.unblockPatient);

export default router;