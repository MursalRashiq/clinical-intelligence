import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { DoctorRepository } from '../repositories/doctor.repository';
import { LoggerService } from '../services/logger.service';
import { authMiddleware } from '../middlewares/auth.middleware';
import { checkUserBlocked } from '../middlewares/checkUserBlocked.middleware';
import { upload } from '../middlewares/upload.middleware';
import { USER_ROUTES } from '../constants/routes.constants';

const userRepository = new UserRepository();
const doctorRepository = new DoctorRepository();
const logger = new LoggerService('UserService');

const userService = new UserService(userRepository, doctorRepository, logger);
const userController = new UserController(userService);

const router = Router();

router.get(
  USER_ROUTES.ME,
  authMiddleware,
  checkUserBlocked,
  userController.getProfile,
);
router.put(
  USER_ROUTES.UPDATE_PROFILE,
  authMiddleware,
  checkUserBlocked,
  upload.single('profileImage'),
  userController.updateProfile,
);
router.get(
  USER_ROUTES.DOCTORS,
  (req, res, next) => {
    console.log('DOCTORS route hit');
    next();
  },
  authMiddleware,
  checkUserBlocked,
  userController.getDoctors,
);
router.get(
  USER_ROUTES.DOCTOR_DETAILS,
  authMiddleware,
  checkUserBlocked,
  userController.getDoctorDetailsById,
);

export default router;
