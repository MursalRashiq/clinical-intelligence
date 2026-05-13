import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user.service";
import { UserRepository } from "../repositories/user.repository";
import { DoctorRepository } from "../repositories/doctor.repository";
import { LoggerService } from "../services/logger.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import { checkUserBlocked } from "../middlewares/checkUserBlocked.middleware";
import { upload } from "../middlewares/upload.middleware";

const userRepository = new UserRepository();
const doctorRepository = new DoctorRepository();
const logger = new LoggerService("UserService");

const userService = new UserService(userRepository, doctorRepository, logger);
const userController = new UserController(userService);

const router = Router();

router.get("/profile", authMiddleware, checkUserBlocked, userController.getProfile);
router.put("/profile", authMiddleware, checkUserBlocked, upload.single('profileImage'), userController.updateProfile);

export default router;
