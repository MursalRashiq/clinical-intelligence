import { Router } from "express";
import { DoctorController } from "../controllers/doctor.controller";
import { DoctorRepository } from "../repositories/doctor.repository";
import { LoggerService } from "../services/logger.service";
import { upload } from "../middlewares/upload.middleware";
import { DoctorService } from "../services/doctor.service";
import { SlotController } from "../controllers/slot.controller";
import { SlotService } from "../services/slot.service";
import { SlotRepository } from "../repositories/slot.repository";
import { authMiddleware } from "../middlewares/auth.middleware";
import { checkUserBlocked } from "../middlewares/checkUserBlocked.middleware";

const doctorRepository = new DoctorRepository();
const logger = new LoggerService("DoctorService");
const doctorService = new DoctorService(doctorRepository, logger);
const doctorController = new DoctorController(doctorService, new LoggerService("DoctorController"));

const slotRepository = new SlotRepository();
const slotService = new SlotService(slotRepository, doctorRepository, logger);
const slotController = new SlotController(slotService);

const router = Router();

router.post("/submit-verification", authMiddleware, checkUserBlocked, upload.fields([
  { name: 'medicalLicense', maxCount: 1 },
  { name: 'degreeCertificate', maxCount: 1 }
]), doctorController.submitVerification);

router.get("/profile", authMiddleware, checkUserBlocked, doctorController.getDoctorProfile);
router.post("/resubmit-verification", authMiddleware, checkUserBlocked, doctorController.resubmitVerification);
router.put("/documents", authMiddleware, checkUserBlocked, upload.fields([
  { name: 'medicalLicense', maxCount: 1 },
  { name: 'degreeCertificate', maxCount: 1 }
]), doctorController.updateDocuments);
router.get("/document-url/:index", authMiddleware, checkUserBlocked, doctorController.getDocumentUrl);
router.get("/", doctorController.getAllDoctors);

// Slot Routes
router.post("/schedule", authMiddleware, checkUserBlocked, slotController.createSchedule);
router.get("/schedule", authMiddleware, checkUserBlocked, slotController.getSchedule);
router.get("/schedule/:doctorId", authMiddleware, checkUserBlocked, slotController.getSchedule);
router.put("/schedule", authMiddleware, checkUserBlocked, slotController.updateSchedule);
router.put("/schedule/:doctorId", authMiddleware, checkUserBlocked, slotController.updateSchedule);
router.delete("/schedule", authMiddleware, checkUserBlocked, slotController.deleteSchedule);
router.delete("/schedule/:doctorId", authMiddleware, checkUserBlocked, slotController.deleteSchedule);
router.post("/schedule/block-date", authMiddleware, checkUserBlocked, slotController.blockDate);
router.post("/schedule/:doctorId/block-date", authMiddleware, checkUserBlocked, slotController.blockDate);
router.post("/schedule/unblock-date", authMiddleware, checkUserBlocked, slotController.unblockDate);
router.post("/schedule/:doctorId/unblock-date", authMiddleware, checkUserBlocked, slotController.unblockDate);
router.get("/schedule/:doctorId/available-slots", authMiddleware, checkUserBlocked, slotController.getAvailableSlots);
router.post("/schedule/recurring-slots", authMiddleware, checkUserBlocked, slotController.addRecurringSlots);
router.delete("/schedule/recurring-slots/:day/:slotId", authMiddleware, checkUserBlocked, slotController.deleteRecurringSlot);
router.delete("/schedule/recurring-slots/by-time/:startTime/:endTime", authMiddleware, checkUserBlocked, slotController.deleteRecurringSlotByTime);
export default router;
