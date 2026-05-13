import { ISlotService } from "./interface/ISlotService";
import { ISlotRepository } from "../repositories/interface/ISlot.repository";
import { IDoctorRepository } from "../repositories/interface/IDoctor.repository";
import {
    CreateScheduleDTO,
    UpdateScheduleDTO,
    BlockDatesDTO,
    ScheduleResponseDTO,
    AvailableSlotResponseDTO,
} from "../dtos/slot.dtos/slot.dto";
import { RecurringSlotsDTO, RecurringSlotsResponseDTO } from "../dtos/slot.dtos/recurringSlots.dto";
import { SlotValidator } from "../validators/slot.validator";
import { NotFoundError, AppError } from "../errors/AppError";
import { MESSAGES, HttpStatus, SLOT_DEFAULTS } from "../constants/constants";

import { DayOfWeek, IDoctorSchedule, IDoctorScheduleDocument } from "../types/slot.type";
import { IDGenerator } from "../utils/idGenerator.utils";

import { ILoggerService } from "./interface/ILogger.service";


export class SlotService implements ISlotService {
    constructor(
        private _slotRepository: ISlotRepository,
        private _doctorRepository: IDoctorRepository,
        private _logger: ILoggerService
    ) {
    }

    async createSchedule(
        userId: string,
        data: CreateScheduleDTO
    ): Promise<ScheduleResponseDTO> {
        this._logger.info("Creating schedule by user ID", { userId });

        const doctor = await this._doctorRepository.findByUserId(userId);
        if (!doctor) {
            throw new NotFoundError(MESSAGES.DOCTOR_NOT_FOUND);
        }


        const doctorId = doctor._id.toString();
        const existingSchedule = await this._slotRepository.findByDoctorId(doctorId);

        if (existingSchedule) {
            throw new AppError(
                MESSAGES.SCHEDULE_ALREADY_EXISTS,
                HttpStatus.CONFLICT
            );
        }

        data.doctorId = doctorId;

        if (data.weeklySchedule) {
            data.weeklySchedule.forEach(day => {
                if (day.enabled && day.slots && day.slots.length > 3) {
                    throw new AppError("Slot limit exceeded: max 3 slots per day allowed", HttpStatus.BAD_REQUEST);
                }
            });
        }

        SlotValidator.validateCreateSchedule(data);


        const weeklySchedule = data.weeklySchedule.map(day => ({
            ...day,
            slots: day.slots ? day.slots.map(slot => ({
                ...slot,
                customId: slot.customId || IDGenerator.generateSlotId()
            })) : []
        }));

        const schedule = await this._slotRepository.create({
            doctorId: doctor._id,
            weeklySchedule: weeklySchedule,
            blockedDates: [],
            defaultSlotDuration: data.defaultSlotDuration ?? SLOT_DEFAULTS.SLOT_DURATION_MINUTES,
            bufferTime: data.bufferTime ?? SLOT_DEFAULTS.BUFFER_TIME_MINUTES,
            maxPatientsPerSlot: data.maxPatientsPerSlot ?? SLOT_DEFAULTS.MAX_PATIENTS_PER_SLOT,
            isActive: true,
        });

        this._logger.info("Schedule created successfully", { doctorId, scheduleId: schedule._id });

        return this._mapToResponseDTO(schedule);
    }


    async getScheduleByDoctorId(doctorId: string): Promise<ScheduleResponseDTO | null> {
        this._logger.debug("Fetching schedule by doctor ID", { doctorId });

        const schedule = await this._slotRepository.findByDoctorId(doctorId);
        if (!schedule) {
            return null;
        }

        return this._mapToResponseDTO(schedule);
    }

    async getScheduleByUserId(userId: string): Promise<ScheduleResponseDTO | null> {
        this._logger.debug("Fetching schedule by user ID", { userId });

        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            this._logger.warn("Invalid userId provided", { userId });
            return null;
        }

        const doctor = await this._doctorRepository.findByUserId(userId);
        if (!doctor) {
            this._logger.warn("Doctor not found for userId", { userId });
            return null;
        }


        const schedule = await this._slotRepository.findByDoctorId(doctor._id.toString());
        if (!schedule) {
            this._logger.warn("Schedule not found for doctorId", { doctorId: doctor._id.toString() });
            return null;
        }

        return this._mapToResponseDTO(schedule);
    }

    async updateSchedule(
        doctorId: string,
        data: UpdateScheduleDTO
    ): Promise<ScheduleResponseDTO> {
        this._logger.info("Updating schedule", { doctorId });


        const doctor = await this._doctorRepository.findById(doctorId);
        if (!doctor) {
            throw new NotFoundError(MESSAGES.DOCTOR_NOT_FOUND);
        }


        const existingSchedule = await this._slotRepository.findByDoctorId(doctorId);
        if (!existingSchedule) {
            throw new NotFoundError(MESSAGES.SCHEDULE_NOT_FOUND);
        }

        SlotValidator.validateUpdateSchedule(data);


        const updateData: Partial<IDoctorSchedule> = {};
        if (data.weeklySchedule) {

            updateData.weeklySchedule = data.weeklySchedule.map(day => ({

                ...day,
                slots: day.slots ? day.slots.map(slot => ({
                    ...slot,
                    customId: slot.customId || IDGenerator.generateSlotId()
                })) : []
            }));
        }
        if (data.defaultSlotDuration !== undefined) {
            updateData.defaultSlotDuration = data.defaultSlotDuration;
        }
        if (data.bufferTime !== undefined) {
            updateData.bufferTime = data.bufferTime;
        }
        if (data.maxPatientsPerSlot !== undefined) {
            updateData.maxPatientsPerSlot = data.maxPatientsPerSlot;
        }
        if (data.isActive !== undefined) {
            updateData.isActive = data.isActive;
        }

        const updatedSchedule = await this._slotRepository.updateByDoctorId(
            doctorId,
            updateData
        );

        if (!updatedSchedule) {
            throw new NotFoundError(MESSAGES.SCHEDULE_UPDATE_FAILED);
        }

        this._logger.info("Schedule updated successfully", { doctorId });

        return this._mapToResponseDTO(updatedSchedule);
    }

    async updateScheduleByUserId(
        userId: string,
        data: UpdateScheduleDTO
    ): Promise<ScheduleResponseDTO> {
        this._logger.info("Updating schedule by user ID", { userId });

        const doctor = await this._doctorRepository.findByUserId(userId);
        if (!doctor) {
            throw new NotFoundError(MESSAGES.DOCTOR_NOT_FOUND);
        }

        return this.updateSchedule(doctor._id.toString(), data);
    }

    async blockDate(doctorId: string, data: BlockDatesDTO): Promise<ScheduleResponseDTO> {
        this._logger.info("Blocking date", { doctorId, date: data.date });

        const doctor = await this._doctorRepository.findById(doctorId);
        if (!doctor) {
            throw new NotFoundError(MESSAGES.DOCTOR_NOT_FOUND);
        }

        SlotValidator.validateBlockDate(data);

        const date = new Date(data.date);

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);


        const schedule = await this._slotRepository.addBlockedDate(
            doctorId,
            date,
            data.reason,
            data.slots
        );

        if (!schedule) {
            throw new NotFoundError(MESSAGES.SCHEDULE_NOT_FOUND);
        }

        this._logger.info("Date blocked successfully", { doctorId, date: data.date });

        return this._mapToResponseDTO(schedule);
    }

    async blockDateByUserId(userId: string, data: BlockDatesDTO): Promise<ScheduleResponseDTO> {
        this._logger.info("Blocking date by user ID", { userId, date: data.date });

        const doctor = await this._doctorRepository.findByUserId(userId);
        if (!doctor) {
            throw new NotFoundError(MESSAGES.DOCTOR_NOT_FOUND);
        }

        return this.blockDate(doctor._id.toString(), data);
    }

    async unblockDate(doctorId: string, date: Date | string): Promise<ScheduleResponseDTO> {
        this._logger.info("Unblocking date", { doctorId, date });

        const doctor = await this._doctorRepository.findById(doctorId);
        if (!doctor) {
            throw new NotFoundError(MESSAGES.DOCTOR_NOT_FOUND);
        }

        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            throw new AppError(MESSAGES.INVALID_DATE_FORMAT, HttpStatus.BAD_REQUEST);
        }

        const schedule = await this._slotRepository.removeBlockedDate(doctorId, dateObj);

        if (!schedule) {
            throw new NotFoundError(MESSAGES.SCHEDULE_NOT_FOUND);
        }

        this._logger.info("Date unblocked successfully", { doctorId, date });

        return this._mapToResponseDTO(schedule);
    }

    async unblockDateByUserId(userId: string, date: Date | string): Promise<ScheduleResponseDTO> {
        this._logger.info("Unblocking date by user ID", { userId, date });

        const doctor = await this._doctorRepository.findByUserId(userId);
        if (!doctor) {
            throw new NotFoundError(MESSAGES.DOCTOR_NOT_FOUND);
        }

        return this.unblockDate(doctor._id.toString(), date);
    }

    async getAvailableSlots(
        doctorId: string,
        date: Date | string
    ): Promise<AvailableSlotResponseDTO[]> {
        this._logger.debug("Getting available slots", { doctorId, date });

        const doctor = await this._doctorRepository.findById(doctorId);
        if (!doctor) {
            throw new NotFoundError(MESSAGES.DOCTOR_NOT_FOUND);
        }

        const schedule = await this._slotRepository.findByDoctorId(doctorId);
        if (!schedule || !schedule.isActive) {
            return [];
        }

        const dateObj = new Date(date);
        const dayOfWeek = this._getDayOfWeek(dateObj);

        let daySchedule = null;
        for (const day of schedule.weeklySchedule) {
            if (day.day === dayOfWeek) {
                daySchedule = day;
                break;
            }
        }

        if (!daySchedule || !daySchedule.enabled) {
            return [];
        }

        const dateStr = dateObj.toISOString().split("T")[0];

        let isBlocked = false;
        let blockedDaySlots: string[] = [];

        if (schedule.blockedDates) {
            for (const blocked of schedule.blockedDates) {
                if (blocked.date.toISOString().split("T")[0] === dateStr) {
                    if (!blocked.slots || blocked.slots.length === 0) {
                        isBlocked = true;
                    } else {
                        blockedDaySlots = blocked.slots;
                    }
                    break;
                }
            }
        }

        if (isBlocked) {
            return [];
        }

        const enabledSlots = [];
        if (daySchedule.slots) {
            for (const slot of daySchedule.slots) {
                if (slot.enabled !== false) {
                    enabledSlots.push(slot);
                }
            }
        }

        const availableSlots: AvailableSlotResponseDTO[] = [];
        for (const slot of enabledSlots) {
            if (blockedDaySlots.includes(slot.startTime)) {
                continue;
            }

            const isSlotBooked = slot.booked === true;

            // Define missing variables
            const isAvailable = !isSlotBooked;
            const bookedCount = isSlotBooked ? 1 : 0;

            availableSlots.push({
                date: dateObj,
                startTime: slot.startTime,
                endTime: slot.endTime,
                isAvailable: isAvailable,
                bookedCount: bookedCount,
                maxPatients: schedule.maxPatientsPerSlot,
                // Use spread to satisfy exactOptionalPropertyTypes
                ...(slot.customId ? { slotId: slot.customId } : {})
            });
        }


        return availableSlots;
    }

    async deleteSchedule(doctorId: string): Promise<void> {
        this._logger.info("Deleting schedule", { doctorId });


        const schedule = await this._slotRepository.findByDoctorId(doctorId);
        if (!schedule) {
            throw new NotFoundError(MESSAGES.SCHEDULE_NOT_FOUND);
        }

        await this._slotRepository.updateByDoctorId(doctorId, { isActive: false });

        this._logger.info("Schedule deleted successfully", { doctorId });
    }

    async deleteScheduleByUserId(userId: string): Promise<void> {
        this._logger.info("Deleting schedule by user ID", { userId });

        const doctor = await this._doctorRepository.findByUserId(userId);
        if (!doctor) {
            throw new NotFoundError(MESSAGES.DOCTOR_NOT_FOUND);
        }

        return this.deleteSchedule(doctor._id.toString());
    }

    async addRecurringSlots(
        userId: string,
        data: RecurringSlotsDTO
    ): Promise<RecurringSlotsResponseDTO> {
        this._logger.info("Adding recurring slots", { userId, data });

        const doctor = await this._doctorRepository.findByUserId(userId);
        if (!doctor) {
            throw new NotFoundError(MESSAGES.DOCTOR_NOT_FOUND);
        }

        const doctorId = doctor._id.toString();
        let existingSchedule = await this._slotRepository.findByDoctorId(doctorId);

        if (!existingSchedule) {
            this._logger.info("No existing schedule found, creating one for doctor", { doctorId });
            existingSchedule = await this._slotRepository.create({
                doctorId: doctor._id,
                weeklySchedule: [
                    { day: "Monday", enabled: true, slots: [] },
                    { day: "Tuesday", enabled: true, slots: [] },
                    { day: "Wednesday", enabled: true, slots: [] },
                    { day: "Thursday", enabled: true, slots: [] },
                    { day: "Friday", enabled: true, slots: [] },
                    { day: "Saturday", enabled: true, slots: [] },
                    { day: "Sunday", enabled: true, slots: [] }
                ],
                defaultSlotDuration: 30,
                bufferTime: 5,
                maxPatientsPerSlot: 1,
                isActive: true
            });
        }

        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) {
            throw new AppError(MESSAGES.INVALID_SLOT_TIME_FORMAT, HttpStatus.BAD_REQUEST);
        }


        const [startHours, startMinutes] = data.startTime.split(':').map(Number);
        const [endHours, endMinutes] = data.endTime.split(':').map(Number);
        if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
            throw new AppError(MESSAGES.INVALID_SLOT_TIME_FORMAT, HttpStatus.BAD_REQUEST);
        }
        const startTotal = startHours * 60 + startMinutes;
        const endTotal = endHours * 60 + endMinutes;

        if (startTotal >= endTotal) {
            throw new AppError("Start time must be before end time", HttpStatus.BAD_REQUEST);
        }

        if (endTotal - startTotal < 15) {
            throw new AppError("Slot duration must be at least 15 minutes", HttpStatus.BAD_REQUEST);
        }


        data.days.forEach(day => {
            const daySchedule = existingSchedule.weeklySchedule.find(d => d.day === day);
            if (daySchedule && daySchedule.slots && daySchedule.slots.length >= 3) {
                throw new AppError(`Slot limit exceeded: max 3 slots allowed per day (${day})`, HttpStatus.BAD_REQUEST);
            }
        });

        const overlappingDays: string[] = [];
        const nonOverlappingDays: string[] = [];

        data.days.forEach(day => {
            const daySchedule = existingSchedule.weeklySchedule.find(d => d.day === day);
            if (daySchedule && daySchedule.enabled && daySchedule.slots.length > 0) {
                let hasOverlap = false;

                for (const slot of daySchedule.slots) {
                    if (!slot.enabled) continue;

                    const [slotStartHours, slotStartMinutes] = slot.startTime.split(':').map(Number);
                    const [slotEndHours, slotEndMinutes] = slot.endTime.split(':').map(Number);
                    if (isNaN(slotStartHours) || isNaN(slotStartMinutes) || isNaN(slotEndHours) || isNaN(slotEndMinutes)) {
                        throw new AppError(MESSAGES.INVALID_SLOT_TIME_FORMAT, HttpStatus.BAD_REQUEST);
                    }
                    const slotStartTotal = slotStartHours * 60 + slotStartMinutes;
                    const slotEndTotal = slotEndHours * 60 + slotEndMinutes;

                    if ((startTotal < slotEndTotal && endTotal > slotStartTotal) ||
                        (slotStartTotal < endTotal && slotEndTotal > startTotal)) {
                        hasOverlap = true;
                        break;
                    }
                }

                if (hasOverlap) {
                    overlappingDays.push(day);
                } else {
                    nonOverlappingDays.push(day);
                }
            } else {
                nonOverlappingDays.push(day);
            }
        });


        let daysToUpdate: string[] = [];

        if (data.skipOverlappingDays) {
            daysToUpdate = nonOverlappingDays;
        } else {
            daysToUpdate = nonOverlappingDays;
        }


        if (daysToUpdate.length > 0) {

            const updatedWeeklySchedule = existingSchedule.weeklySchedule.map(day => {
                if (daysToUpdate.includes(day.day)) {
                    const newSlot = {
                        customId: IDGenerator.generateSlotId(),
                        startTime: data.startTime,
                        endTime: data.endTime,
                        enabled: true,
                        booked: false
                    };

                    this._logger.info("Creating new slot", {
                        day: day.day,
                        newSlot,
                        existingSlotsCount: day.slots?.length || 0
                    });

                    return {
                        ...day,
                        enabled: true,
                        slots: [...(day.slots || []), newSlot]
                    };
                }
                return { ...day };
            });

            this._logger.info("Updating schedule with new slots", {
                doctorId,
                daysToUpdate,
                totalDays: updatedWeeklySchedule.length
            });


            const updateResult = await this._slotRepository.updateByDoctorId(doctorId, {
                weeklySchedule: updatedWeeklySchedule
            });

            if (!updateResult) {
                this._logger.error("Failed to update schedule", { doctorId });
                throw new AppError(MESSAGES.FAILED_TO_UPDATE_SCHEDULE, HttpStatus.INTERNAL_SERVER_ERROR);
            }

            this._logger.info("Recurring slots added successfully", {
                doctorId,
                slotsAdded: daysToUpdate.length
            });


            const verifySchedule = await this._slotRepository.findByDoctorId(doctorId);
            if (verifySchedule) {
                const updatedDaysInfo = verifySchedule.weeklySchedule
                    .filter(day => daysToUpdate.includes(day.day))
                    .map(day => ({
                        day: day.day,
                        slotsCount: day.slots?.length || 0
                    }));

                this._logger.info("Schedule verification successful", {
                    doctorId,
                    updatedDays: updatedDaysInfo
                });
            }
        }

        return {
            success: true,
            overlappingDays,
            nonOverlappingDays,
            message: overlappingDays.length > 0
                ? `Found overlapping slots on ${overlappingDays.length} day(s). Slots added to ${nonOverlappingDays.length} day(s).`
                : `Recurring slots added to ${nonOverlappingDays.length} day(s).`
        };
    }

    async deleteRecurringSlotByTime(
        userId: string,
        startTime: string,
        endTime: string
    ): Promise<ScheduleResponseDTO> {
        this._logger.info("Deleting recurring slot by time range", { userId, startTime, endTime });

        const doctor = await this._doctorRepository.findByUserId(userId);
        if (!doctor) {
            throw new NotFoundError(MESSAGES.DOCTOR_NOT_FOUND);
        }

        const doctorId = doctor._id.toString();
        const existingSchedule = await this._slotRepository.findByDoctorId(doctorId);

        if (!existingSchedule) {
            throw new NotFoundError(MESSAGES.SCHEDULE_NOT_FOUND);
        }


        let deletedCount = 0;
        const updatedWeeklySchedule = existingSchedule.weeklySchedule.map(daySchedule => {
            const updatedSlots = daySchedule.slots.filter(slot =>
                !(slot.startTime === startTime && slot.endTime === endTime)
            );


            deletedCount += daySchedule.slots.length - updatedSlots.length;

            return {
                ...daySchedule,
                slots: updatedSlots,
                enabled: updatedSlots.length > 0 ? daySchedule.enabled : false
            };
        });

        const updatedSchedule = await this._slotRepository.updateByDoctorId(doctorId, {
            weeklySchedule: updatedWeeklySchedule
        });

        if (!updatedSchedule) {
            throw new NotFoundError(MESSAGES.SCHEDULE_UPDATE_FAILED);
        }

        this._logger.info("Recurring slots deleted successfully by time range", {
            doctorId,
            startTime,
            endTime,
            deletedCount
        });

        return this._mapToResponseDTO(updatedSchedule);
    }

    async deleteRecurringSlot(
        userId: string,
        day: string,
        slotId: string
    ): Promise<ScheduleResponseDTO> {
        this._logger.info("Deleting recurring slot", { userId, day, slotId });

        const doctor = await this._doctorRepository.findByUserId(userId);
        if (!doctor) {
            throw new NotFoundError(MESSAGES.DOCTOR_NOT_FOUND);
        }

        const doctorId = doctor._id.toString();
        const existingSchedule = await this._slotRepository.findByDoctorId(doctorId);

        if (!existingSchedule) {
            throw new NotFoundError(MESSAGES.SCHEDULE_NOT_FOUND);
        }


        const updatedWeeklySchedule = existingSchedule.weeklySchedule.map(daySchedule => {
            if (daySchedule.day === day) {
                const updatedSlots = daySchedule.slots.filter(slot =>
                    slot.customId !== slotId
                );

                return {
                    ...daySchedule,
                    slots: updatedSlots,
                    enabled: updatedSlots.length > 0 ? daySchedule.enabled : false
                };
            }
            return { ...daySchedule };
        });

        const updatedSchedule = await this._slotRepository.updateByDoctorId(doctorId, {
            weeklySchedule: updatedWeeklySchedule
        });

        if (!updatedSchedule) {
            throw new NotFoundError(MESSAGES.SCHEDULE_UPDATE_FAILED);
        }

        this._logger.info("Recurring slot deleted successfully", { doctorId, day, slotId });

        return this._mapToResponseDTO(updatedSchedule);
    }



    private _mapToResponseDTO(schedule: IDoctorScheduleDocument): ScheduleResponseDTO {
        return {
            id: schedule._id.toString(),
            doctorId: schedule.doctorId.toString(),
            weeklySchedule: schedule.weeklySchedule,
            blockedDates: schedule.blockedDates || [],
            defaultSlotDuration: schedule.defaultSlotDuration,
            bufferTime: schedule.bufferTime,
            maxPatientsPerSlot: schedule.maxPatientsPerSlot,
            isActive: schedule.isActive,
            createdAt: schedule.createdAt!,
            updatedAt: schedule.updatedAt!,
        };
    }



    private _getDayOfWeek(date: Date): DayOfWeek {
        const days: DayOfWeek[] = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];

        const dateCopy = new Date(date);
        // Adding offset to handle UTC date edge cases
        dateCopy.setUTCHours(dateCopy.getUTCHours() + 12);

        // Use non-null assertion since getUTCDay() is guaranteed 0-6
        return days[dateCopy.getUTCDay()]!;
    }

}
