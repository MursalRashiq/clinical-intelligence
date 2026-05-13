// SYNC CHECK: Latest version with blockedDates and slots fix applied.
import { BaseRepository } from "./base.repository";
import { IDoctorScheduleDocument } from "../types/slot.type";
import { ISlotRepository } from "./interface/ISlot.repository";
import { Types, ClientSession } from 'mongoose';
import DoctorScheduleModel from "../models/doctorSchedule.model";

export class SlotRepository extends BaseRepository<IDoctorScheduleDocument> implements ISlotRepository {
    constructor() {
        super(DoctorScheduleModel);
    }

    async create(scheduleData: Partial<IDoctorScheduleDocument>, session?: ClientSession | undefined): Promise<IDoctorScheduleDocument> {
        const schedule = new this.model(scheduleData);
        return await schedule.save({ session: session || null });
    }

    async findByDoctorId(doctorId: string | Types.ObjectId, session?: ClientSession | undefined): Promise<IDoctorScheduleDocument | null> {
        const id = typeof doctorId === "string" ? new Types.ObjectId(doctorId) : doctorId;
        return await this.model.findOne({ doctorId: id }).session(session || null).exec();
    }

    async updateByDoctorId(
        doctorId: string | Types.ObjectId,
        update: Partial<IDoctorScheduleDocument>,
        session?: ClientSession | undefined
    ): Promise<IDoctorScheduleDocument | null> {
        const id = typeof doctorId === "string" ? new Types.ObjectId(doctorId) : doctorId;

        const schedule = await this.model.findOne({ doctorId: id }).session(session || null);
        if (!schedule) return null;

        Object.assign(schedule, update);

        if (update.weeklySchedule) {
            schedule.markModified('weeklySchedule');
        }
        if (update.blockedDates) {
            schedule.markModified('blockedDates');
        }

        return await schedule.save({ session: session || null });
    }

    async addBlockedDate(
        doctorId: string | Types.ObjectId,
        date: Date,
        reason?: string,
        slots?: string[],
        session?: ClientSession | undefined
    ): Promise<IDoctorScheduleDocument | null> {
        const id = typeof doctorId === "string" ? new Types.ObjectId(doctorId) : doctorId;

        const schedule = await this.model.findOne({ doctorId: id }).session(session || null).exec();
        if (!schedule) {
            return null;
        }

        const dateStr = date.toISOString().split("T")[0];

        const blockedDates = schedule.blockedDates || [];
        schedule.blockedDates = blockedDates;

        const existingIndex = blockedDates.findIndex(
            (blocked) => blocked.date.toISOString().split("T")[0] === dateStr
        );

        if (existingIndex >= 0) {
            const existingBlocked = blockedDates[existingIndex];
            if (existingBlocked) {
                existingBlocked.reason = reason || existingBlocked.reason || null;
                existingBlocked.slots = slots || [];
            }
        } else {
            blockedDates.push({
                date,
                reason: reason || null,
                slots: slots || []
            });
        }

        schedule.markModified('blockedDates');

        return await schedule.save({ session: session || null });
    }

    async removeBlockedDate(
        doctorId: string | Types.ObjectId,
        date: Date,
        session?: ClientSession | undefined
    ): Promise<IDoctorScheduleDocument | null> {
        const id = typeof doctorId === "string" ? new Types.ObjectId(doctorId) : doctorId;
        return await this.model.findOneAndUpdate(
            { doctorId: id },
            {
                $pull: {
                    blockedDates: { date: date }
                }
            },
            { new: true, session: session || null }
        ).exec();
    }

    async findById(id: string | Types.ObjectId, session?: ClientSession | undefined): Promise<IDoctorScheduleDocument | null> {
        return await this.model.findById(id).session(session || null).exec();
    }

    async existsByDoctorId(doctorId: string | Types.ObjectId, session?: ClientSession | undefined): Promise<boolean> {
        const id = typeof doctorId === "string" ? new Types.ObjectId(doctorId) : doctorId;
        const count = await this.model.countDocuments({ doctorId: id }).session(session || null).exec();
        return count > 0;
    }

    async updateSlotBookedStatus(
        doctorId: string | Types.ObjectId,
        slotId: string,
        isBooked: boolean,
        _appointmentDate?: Date,
        _startTime?: string,
        session?: ClientSession | undefined
    ): Promise<boolean> {
        const id = typeof doctorId === "string" ? new Types.ObjectId(doctorId) : doctorId;

        const query: Record<string, unknown> = { doctorId: id };

        if (isBooked) {

            query.weeklySchedule = {
                $elemMatch: {
                    slots: {
                        $elemMatch: {
                            customId: slotId,
                            booked: { $ne: true }
                        }
                    }
                }
            };
        } else {

            query["weeklySchedule.slots.customId"] = slotId;
        }

        const result = await this.model.updateOne(
            query as any,
            { $set: { "weeklySchedule.$[day].slots.$[slot].booked": isBooked } },
            {
                arrayFilters: [
                    { "day.slots.customId": slotId },
                    { "slot.customId": slotId }
                ],
                ...(session ? { session } : {})
            }
        );


        return result.modifiedCount > 0;
    }
}
