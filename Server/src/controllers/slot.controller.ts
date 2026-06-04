import { Request, Response, NextFunction } from 'express';
import { ISlotService } from '../services/interface/ISlotService';
import { ISlotController } from './interface/ISlot.controller';
import { STATUS, MESSAGES } from '../constants/constants';
import { AppError } from '../types/error.type';
import { sendSuccess } from '../utils/responseHandler.util';
import {
  CreateScheduleDTO,
  UpdateScheduleDTO,
  BlockDatesDTO,
} from '../dtos/slot.dtos/slot.dto';
import { RecurringSlotsDTO } from '../dtos/slot.dtos/recurringSlots.dto';

export class SlotController implements ISlotController {
  constructor(private _slotService: ISlotService) {}

  private _getUserIdFromReq(req: Request): string | undefined {
    return req.user?.userId;
  }

  createSchedule = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this._getUserIdFromReq(req);
      if (!userId) {
        throw new AppError(MESSAGES.UNAUTHORIZED, STATUS.UNAUTHORIZED);
      }
      console.log('slot controller hit create schedule');

      // If schedule already exists and doctor is adding recurring slots, merge via addRecurringSlots
      if (req.body.days && Array.isArray(req.body.days)) {
        const existingSchedule =
          await this._slotService.getScheduleByUserId(userId);
        if (existingSchedule) {
          const dto: RecurringSlotsDTO = {
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            days: req.body.days,
            skipOverlappingDays: req.body.skipOverlappingDays ?? true,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
          };
          const result = await this._slotService.addRecurringSlots(userId, dto);
          return sendSuccess(res, result, MESSAGES.SCHEDULE_UPDATED, STATUS.OK);
        }
      }

      let weeklySchedule = req.body.weeklySchedule;

      // Handle simplified payload (days, startTime, endTime) from frontend
      if (!weeklySchedule && req.body.days && Array.isArray(req.body.days)) {
        const ALL_DAYS = [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ];
        weeklySchedule = ALL_DAYS.map((day) => {
          const isSelected = req.body.days.includes(day);
          return {
            day,
            enabled: isSelected,
            slots: isSelected
              ? [
                  {
                    startTime: req.body.startTime,
                    endTime: req.body.endTime,
                    enabled: true,
                    booked: false,
                    startDate: req.body.startDate,
                    endDate: req.body.endDate,
                  },
                ]
              : [],
          };
        });
      }

      const dto: CreateScheduleDTO = {
        doctorId: '',
        weeklySchedule,
        defaultSlotDuration: req.body.defaultSlotDuration,
        bufferTime: req.body.bufferTime,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        maxPatientsPerSlot: req.body.maxPatientsPerSlot,
      };
      console.log(dto, 'from slot.controller');

      const result = await this._slotService.createSchedule(userId, dto);

      sendSuccess(res, result, MESSAGES.SLOT_CREATED, STATUS.CREATED);
    } catch (error: unknown) {
      return next(error);
    }
  };

  getSchedule = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this._getUserIdFromReq(req);
      const { doctorId } = req.params;

      let result;
      if (doctorId) {
        if (typeof doctorId !== 'string') {
          throw new AppError(MESSAGES.INVALID_ID_FORMAT, STATUS.BAD_REQUEST);
        }
        result = await this._slotService.getScheduleByDoctorId(doctorId);
      } else if (userId) {
        if (typeof userId !== 'string' || userId.trim() === '') {
          throw new AppError(MESSAGES.INVALID_ID_FORMAT, STATUS.BAD_REQUEST);
        }

        result = await this._slotService.getScheduleByUserId(userId);
      } else {
        throw new AppError(
          MESSAGES.DOCTOR_ID_OR_AUTH_REQUIRED,
          STATUS.BAD_REQUEST,
        );
      }

      if (!result) {
        sendSuccess(res, null, MESSAGES.SCHEDULE_NOT_FOUND, STATUS.OK);
        return;
      }
      sendSuccess(res, result, MESSAGES.SCHEDULE_FETCHED, STATUS.OK);
    } catch (error: unknown) {
      return next(error);
    }
  };

  updateSchedule = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this._getUserIdFromReq(req);
      if (!userId) {
        throw new AppError(MESSAGES.UNAUTHORIZED, STATUS.UNAUTHORIZED);
      }

      const doctorId = req.params.doctorId;
      const dto: UpdateScheduleDTO = {
        weeklySchedule: req.body.weeklySchedule,
        defaultSlotDuration: req.body.defaultSlotDuration,
        bufferTime: req.body.bufferTime,
        maxPatientsPerSlot: req.body.maxPatientsPerSlot,
        isActive: req.body.isActive,
      };

      let result;
      if (doctorId) {
        if (typeof doctorId !== 'string') {
          throw new AppError(MESSAGES.INVALID_ID_FORMAT, STATUS.BAD_REQUEST);
        }
        result = await this._slotService.updateSchedule(doctorId, dto);
      } else {
        if (typeof userId !== 'string' || userId.trim() === '') {
          throw new AppError(MESSAGES.INVALID_ID_FORMAT, STATUS.BAD_REQUEST);
        }
        result = await this._slotService.updateScheduleByUserId(userId, dto);
      }

      sendSuccess(res, result, MESSAGES.SCHEDULE_UPDATED, STATUS.OK);
    } catch (error: unknown) {
      return next(error);
    }
  };

  blockDate = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this._getUserIdFromReq(req);
      if (!userId) {
        throw new AppError(MESSAGES.UNAUTHORIZED, STATUS.UNAUTHORIZED);
      }

      const doctorId = req.params.doctorId;
      const dto: BlockDatesDTO = {
        date: req.body.date,
        reason: req.body.reason,
        slots: req.body.slots,
      };

      let result;
      if (doctorId) {
        if (typeof doctorId !== 'string' || doctorId.trim() === '') {
          throw new AppError(MESSAGES.INVALID_ID_FORMAT, STATUS.BAD_REQUEST);
        }
        result = await this._slotService.blockDate(doctorId, dto);
      } else {
        if (typeof userId !== 'string' || userId.trim() === '') {
          throw new AppError(MESSAGES.INVALID_ID_FORMAT, STATUS.BAD_REQUEST);
        }
        result = await this._slotService.blockDateByUserId(userId, dto);
      }

      sendSuccess(res, result, MESSAGES.DATE_BLOCKED, STATUS.OK);
    } catch (error: unknown) {
      return next(error);
    }
  };

  unblockDate = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this._getUserIdFromReq(req);
      if (!userId) {
        throw new AppError(MESSAGES.UNAUTHORIZED, STATUS.UNAUTHORIZED);
      }

      const doctorId = req.params.doctorId;
      const date = req.body.date || req.params.date;

      if (!date) {
        throw new AppError(MESSAGES.DATE_REQUIRED, STATUS.BAD_REQUEST);
      }

      let result;
      if (doctorId) {
        if (typeof doctorId !== 'string' || doctorId.trim() === '') {
          throw new AppError(MESSAGES.INVALID_ID_FORMAT, STATUS.BAD_REQUEST);
        }
        result = await this._slotService.unblockDate(doctorId, date);
      } else {
        if (typeof userId !== 'string' || userId.trim() === '') {
          throw new AppError(MESSAGES.INVALID_ID_FORMAT, STATUS.BAD_REQUEST);
        }
        result = await this._slotService.unblockDateByUserId(userId, date);
      }

      sendSuccess(res, result, MESSAGES.DATE_UNBLOCKED, STATUS.OK);
    } catch (error: unknown) {
      return next(error);
    }
  };

  getAvailableSlots = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const doctorId = req.params.doctorId;
      const date = req.query.date as string;

      if (typeof doctorId !== 'string' || doctorId.trim() === '') {
        throw new AppError(MESSAGES.INVALID_ID_FORMAT, STATUS.BAD_REQUEST);
      }

      if (!date) {
        throw new AppError(MESSAGES.DATE_REQUIRED, STATUS.BAD_REQUEST);
      }

      const result = await this._slotService.getAvailableSlots(doctorId, date);
      console.log(
        JSON.stringify(result, null, 2),
        'Available slots fetched for doctorId:',
        doctorId,
        'and date:',
        date,
      );

      sendSuccess(res, result, MESSAGES.AVAILABLE_SLOTS_FETCHED, STATUS.OK);
    } catch (error: unknown) {
      return next(error);
    }
  };

  deleteSchedule = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this._getUserIdFromReq(req);
      if (!userId) {
        throw new AppError(MESSAGES.UNAUTHORIZED, STATUS.UNAUTHORIZED);
      }

      const doctorId = req.params.doctorId;

      if (doctorId) {
        if (typeof doctorId !== 'string' || doctorId.trim() === '') {
          throw new AppError(MESSAGES.INVALID_ID_FORMAT, STATUS.BAD_REQUEST);
        }
        await this._slotService.deleteSchedule(doctorId);
      } else {
        if (typeof userId !== 'string' || userId.trim() === '') {
          throw new AppError(MESSAGES.INVALID_ID_FORMAT, STATUS.BAD_REQUEST);
        }
        await this._slotService.deleteScheduleByUserId(userId);
      }

      sendSuccess(res, null, MESSAGES.SLOT_DELETED, STATUS.OK);
    } catch (error: unknown) {
      return next(error);
    }
  };

  addRecurringSlots = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this._getUserIdFromReq(req);
      if (!userId) {
        throw new AppError(MESSAGES.UNAUTHORIZED, STATUS.UNAUTHORIZED);
      }

      const dto: RecurringSlotsDTO = {
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        days: req.body.days,
        skipOverlappingDays: req.body.skipOverlappingDays,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
      };

      const result = await this._slotService.addRecurringSlots(userId, dto);

      sendSuccess(res, result, MESSAGES.SCHEDULE_UPDATED, STATUS.OK);
    } catch (error: unknown) {
      return next(error);
    }
  };

  deleteRecurringSlot = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this._getUserIdFromReq(req);
      if (!userId) {
        throw new AppError(MESSAGES.UNAUTHORIZED, STATUS.UNAUTHORIZED);
      }

      const { day, slotId } = req.params;

      // FIX: Ensure types are strings
      if (typeof day !== 'string' || typeof slotId !== 'string') {
        throw new AppError(MESSAGES.INVALID_ID_FORMAT, STATUS.BAD_REQUEST);
      }

      const result = await this._slotService.deleteRecurringSlot(
        userId,
        day,
        slotId,
      );

      sendSuccess(
        res,
        result,
        'Recurring slot deleted successfully',
        STATUS.OK,
      );
    } catch (error: unknown) {
      return next(error);
    }
  };

  deleteRecurringSlotByTime = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this._getUserIdFromReq(req);
      if (!userId) {
        throw new AppError(MESSAGES.UNAUTHORIZED, STATUS.UNAUTHORIZED);
      }

      const { startTime, endTime } = req.params;

      if (typeof startTime !== 'string' || typeof endTime !== 'string') {
        throw new AppError(MESSAGES.INVALID_ID_FORMAT, STATUS.BAD_REQUEST);
      }

      const result = await this._slotService.deleteRecurringSlotByTime(
        userId,
        startTime,
        endTime,
      );

      sendSuccess(
        res,
        result,
        'Recurring slots deleted successfully from all days',
        STATUS.OK,
      );
    } catch (error: unknown) {
      return next(error);
    }
  };

  addSpecificDateSlots = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this._getUserIdFromReq(req);
      if (!userId) {
        throw new AppError(MESSAGES.UNAUTHORIZED, STATUS.UNAUTHORIZED);
      }

      const dto = {
        date: req.body.date,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        skipOverlappingDays: req.body.skipOverlappingDays,
      };

      const result = await this._slotService.addSpecificDateSlots(userId, dto);
      sendSuccess(
        res,
        result,
        'Specific date slot added successfully',
        STATUS.OK,
      );
    } catch (error: unknown) {
      return next(error);
    }
  };

  deleteSpecificDateSlot = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this._getUserIdFromReq(req);
      if (!userId) {
        throw new AppError(MESSAGES.UNAUTHORIZED, STATUS.UNAUTHORIZED);
      }

      const { date, slotId } = req.params;

      if (typeof date !== 'string' || typeof slotId !== 'string') {
        throw new AppError(MESSAGES.INVALID_ID_FORMAT, STATUS.BAD_REQUEST);
      }

      const result = await this._slotService.deleteSpecificDateSlot(
        userId,
        date,
        slotId,
      );
      sendSuccess(
        res,
        result,
        'Specific date slot deleted successfully',
        STATUS.OK,
      );
    } catch (error: unknown) {
      return next(error);
    }
  };
}
