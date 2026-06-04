import type {
  CreateScheduleDTO,
  UpdateScheduleDTO,
  BlockDatesDTO,
  ScheduleResponseDTO,
  AvailableSlotResponseDTO,
  SpecificDateSlotsDTO,
} from '../../dtos/slot.dtos/slot.dto';
import {
  RecurringSlotsDTO,
  RecurringSlotsResponseDTO,
} from '../../dtos/slot.dtos/recurringSlots.dto';

export interface ISlotService {
  createSchedule(
    userId: string,
    data: CreateScheduleDTO,
  ): Promise<ScheduleResponseDTO>;
  getScheduleByDoctorId(doctorId: string): Promise<ScheduleResponseDTO | null>;
  getScheduleByUserId(userId: string): Promise<ScheduleResponseDTO | null>;
  updateSchedule(
    doctorId: string,
    data: UpdateScheduleDTO,
  ): Promise<ScheduleResponseDTO>;
  updateScheduleByUserId(
    userId: string,
    data: UpdateScheduleDTO,
  ): Promise<ScheduleResponseDTO>;
  blockDate(
    doctorId: string,
    data: BlockDatesDTO,
  ): Promise<ScheduleResponseDTO>;
  blockDateByUserId(
    userId: string,
    data: BlockDatesDTO,
  ): Promise<ScheduleResponseDTO>;
  unblockDate(
    doctorId: string,
    date: Date | string,
  ): Promise<ScheduleResponseDTO>;
  unblockDateByUserId(
    userId: string,
    date: Date | string,
  ): Promise<ScheduleResponseDTO>;
  getAvailableSlots(
    doctorId: string,
    date: Date | string,
  ): Promise<AvailableSlotResponseDTO[]>;
  deleteSchedule(doctorId: string): Promise<void>;
  deleteScheduleByUserId(userId: string): Promise<void>;
  addRecurringSlots(
    userId: string,
    data: RecurringSlotsDTO,
  ): Promise<RecurringSlotsResponseDTO>;
  deleteRecurringSlot(
    userId: string,
    day: string,
    slotId: string,
  ): Promise<ScheduleResponseDTO>;
  deleteRecurringSlotByTime(
    userId: string,
    startTime: string,
    endTime: string,
  ): Promise<ScheduleResponseDTO>;
  addSpecificDateSlots(
    userId: string,
    data: SpecificDateSlotsDTO,
  ): Promise<RecurringSlotsResponseDTO>;
  deleteSpecificDateSlot(
    userId: string,
    date: string,
    slotId: string,
  ): Promise<ScheduleResponseDTO>;
}
