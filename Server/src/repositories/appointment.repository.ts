import { IAppointmentRepository } from './interface/IAppointment.repository';
import {
  IAppointmentDocument,
  IAppointmentPopulated,
} from '../types/appointment.type';
import AppointmentModel from '../models/appointment.modal';
import { ClientSession, UpdateQuery, PipelineStage, Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { APPOINTMENT_STATUS } from '../constants/constants';

type AppointmentListQuery = {
  status?: string | { $in: string[] };
  doctorId?: Types.ObjectId;
  patientId?: Types.ObjectId;
  sessionStatus?: string | { $in: string[] };
  appointmentDate?: {
    $gte?: Date;
    $lte?: Date;
  };
  $or?: (
    | Record<string, unknown>
    | {
        customId?: RegExp;
        status?: RegExp;
        appointmentTime?: RegExp;
      }
  )[];
};

export class AppointmentRepository
  extends BaseRepository<IAppointmentDocument>
  implements IAppointmentRepository
{
  constructor() {
    super(AppointmentModel);
  }

  async create(
    appointmentData: Partial<IAppointmentDocument>,
    session?: ClientSession | undefined,
  ): Promise<IAppointmentDocument> {
    const doc = new this.model(appointmentData);
    return await doc.save({ session: session || null });
  }

  async findById(
    appointmentId: string,
    session?: ClientSession | undefined,
  ): Promise<IAppointmentDocument | null> {
    const query = Types.ObjectId.isValid(appointmentId)
      ? { _id: new Types.ObjectId(appointmentId) }
      : { customId: appointmentId };

    const result = await this.model
      .findOne(query)
      .session(session || null)
      .exec();
    return result;
  }

  async findByIdPopulated(
    appointmentId: string,
    session?: ClientSession | undefined,
  ): Promise<IAppointmentPopulated | null> {
    let query: Record<string, unknown>;
    if (Types.ObjectId.isValid(appointmentId)) {
      query = { _id: appointmentId };
    } else {
      query = { customId: appointmentId };
    }

    const doc = await this.model
      .findOne(query)
      .session(session || null)
      .populate({
        path: 'patientId',
        select: 'customId name email phone profileImage userId',
      })
      .populate({
        path: 'doctorId',
        select: 'customId userId specialty experienceYears VideoFees ChatFees',
        populate: {
          path: 'userId',
          select: 'customId name email phone profileImage',
        },
      })
      .lean<IAppointmentPopulated>();

    return doc;
  }

  async findByPatientId(
    patientId: string,
    status?: string,
    skip: number = 0,
    limit: number = 10,
    _session?: ClientSession | undefined,
  ): Promise<{ appointments: IAppointmentPopulated[]; total: number }> {
    const query: Record<string, unknown> = {
      patientId: new Types.ObjectId(patientId),
    };

    if (status) {
      query.status = status;
    }

    const [appointments, total] = await Promise.all([
      this.model
        .find(query)
        .select(
          'customId patientId doctorId appointmentType appointmentDate appointmentTime slotId status consultationFees reason cancelledBy cancellationReason cancelledAt rejectionReason createdAt updatedAt',
        )
        .populate({
          path: 'patientId',
          select: 'customId name email phone profileImage',
        })
        .populate({
          path: 'doctorId',
          select:
            'customId userId specialty experienceYears VideoFees ChatFees',
          populate: {
            path: 'userId',
            select: 'customId name email phone profileImage',
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IAppointmentPopulated[]>(),
      this.model.countDocuments(query),
    ]);

    return { appointments, total };
  }

  async findByDoctorId(
    doctorId: string,
    status?: string,
    skip: number = 0,
    limit: number = 10,
    _session?: ClientSession | undefined,
  ): Promise<{ appointments: IAppointmentPopulated[]; total: number }> {
    const query: Record<string, unknown> = {
      doctorId: new Types.ObjectId(doctorId),
    };

    if (status) {
      query.status = status;
    }

    const [appointments, total] = await Promise.all([
      this.model
        .find(query)
        .select(
          'customId patientId doctorId appointmentType appointmentDate appointmentTime slotId status consultationFees reason cancelledBy cancellationReason cancelledAt rejectionReason createdAt updatedAt',
        )
        .populate({
          path: 'patientId',
          select: 'customId name email phone profileImage',
        })
        .populate({
          path: 'doctorId',
          select:
            'customId userId specialty experienceYears VideoFees ChatFees',
          populate: {
            path: 'userId',
            select: 'customId name email phone profileImage',
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IAppointmentPopulated[]>(),
      this.model.countDocuments(query),
    ]);

    return { appointments, total };
  }

  async findAll(
    filters: {
      status?: string;
      search?: string;
      startDate?: Date;
      endDate?: Date;
      doctorId?: string;
      patientId?: string;
      sessionStatus?: string | { $in: string[] };
    },
    skip: number = 0,
    limit: number = 10,
  ): Promise<{ appointments: IAppointmentPopulated[]; total: number }> {
    const query: AppointmentListQuery = {};

    if (filters.status) {
      if (filters.status.includes(',')) {
        query.status = { $in: filters.status.split(',').map((s) => s.trim()) };
      } else {
        query.status = filters.status;
      }
    }

    if (filters.doctorId) {
      query.doctorId = new Types.ObjectId(filters.doctorId);
    }

    if (filters.patientId) {
      query.patientId = new Types.ObjectId(filters.patientId);
    }

    if (filters.sessionStatus) {
      query.sessionStatus = filters.sessionStatus;
    }

    if (filters.startDate || filters.endDate) {
      query.appointmentDate = {};
      if (filters.startDate) {
        query.appointmentDate.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.appointmentDate.$lte = filters.endDate;
      }
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [
        { customId: searchRegex },
        { status: searchRegex },
        { appointmentTime: searchRegex },
      ];
    }

    const [appointments, total] = await Promise.all([
      this.model
        .find(query)
        .populate({
          path: 'patientId',
          select: 'customId name email phone profileImage gender dob',
        })
        .populate({
          path: 'doctorId',
          select: 'userId specialty experienceYears VideoFees ChatFees',
          populate: {
            path: 'userId',
            select: 'name email phone profileImage',
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IAppointmentPopulated[]>(),
      this.model.countDocuments(query),
    ]);

    return { appointments, total };
  }

  async updateById(
    appointmentId: string,
    updateData: UpdateQuery<IAppointmentDocument>,
    session?: ClientSession | undefined,
  ): Promise<IAppointmentDocument | null> {
    if (!Types.ObjectId.isValid(appointmentId)) {
      process.stderr.write(
        `[AppointmentRepository] Invalid ObjectId: ${appointmentId}\n`,
      );
      return null;
    }

    const update = Object.keys(updateData).some((key) => key.startsWith('$'))
      ? updateData
      : { $set: updateData };

    const result = await this.model
      .findByIdAndUpdate(appointmentId, update, {
        new: true,
        runValidators: true,
        session: session || null,
      })
      .exec();

    return result;
  }

  async deleteById(
    appointmentId: string,
    session?: ClientSession | undefined,
  ): Promise<IAppointmentDocument | null> {
    if (!Types.ObjectId.isValid(appointmentId)) {
      return null;
    }
    return await this.model
      .findByIdAndDelete(appointmentId)
      .session(session || null)
      .exec();
  }

  async countByStatus(status: string): Promise<number> {
    return await this.model.countDocuments({ status });
  }

  async countByDoctorId(doctorId: string, status?: string): Promise<number> {
    const query: Record<string, unknown> = {
      doctorId: new Types.ObjectId(doctorId),
    };
    if (status) query.status = status;
    return await this.model.countDocuments(query);
  }

  async countByPatientId(patientId: string, status?: string): Promise<number> {
    const query: Record<string, unknown> = {
      patientId: new Types.ObjectId(patientId),
    };
    if (status) query.status = status;
    return await this.model.countDocuments(query);
  }

  async getStatusCounts(filter: {
    doctorId?: string;
    patientId?: string;
  }): Promise<{ upcoming: number; completed: number; cancelled: number }> {
    const match: Record<string, unknown> = {};
    if (filter.doctorId) match.doctorId = new Types.ObjectId(filter.doctorId);
    if (filter.patientId)
      match.patientId = new Types.ObjectId(filter.patientId);

    const counts = await this.model.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          upcoming: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$status',
                    [
                      APPOINTMENT_STATUS.PENDING,
                      APPOINTMENT_STATUS.CONFIRMED,
                      APPOINTMENT_STATUS.RESCHEDULE_REQUESTED,
                    ],
                  ],
                },
                1,
                0,
              ],
            },
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', APPOINTMENT_STATUS.COMPLETED] }, 1, 0],
            },
          },
          cancelled: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$status',
                    [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.REJECTED],
                  ],
                },
                1,
                0,
              ],
            },
          },
          missed: {
            $sum: {
              $cond: [{ $eq: ['$status', APPOINTMENT_STATUS.NO_SHOW] }, 1, 0],
            },
          },
        },
      },
    ]);

    return counts[0] || { upcoming: 0, completed: 0, cancelled: 0, missed: 0 };
  }

  async updateExpiredAppointments(): Promise<number> {
    const result = await this.model.updateMany(
      {
        status: APPOINTMENT_STATUS.PENDING,
        appointmentDate: { $lt: new Date() },
      },
      {
        $set: {
          status: APPOINTMENT_STATUS.NO_SHOW,
        },
      },
    );

    return result.modifiedCount;
  }
}
