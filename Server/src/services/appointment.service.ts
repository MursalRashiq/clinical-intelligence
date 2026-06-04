import { ILoggerService } from './interface/ILogger.service';
import { parseAppointmentTime } from '../utils/time.util';
import { Types, UpdateQuery } from 'mongoose';
import {
  IAppointmentDocument,
  AppointmentStatus,
} from '../types/appointment.type';
import { IAppointmentRepository } from '../repositories/interface/IAppointment.repository';
import { IDoctorRepository } from '../repositories/interface/IDoctor.repository';
import { IUserRepository } from '../repositories/interface/IUser.repository';
import { ISlotRepository } from '../repositories/interface/ISlot.repository';
import { IAppointmentService } from './interface/IAppointment.service';
import { AppError } from '../errors/AppError';

import {
  APPOINTMENT_STATUS,
  MESSAGES,
  HttpStatus,
  PAYMENT_STATUS,
  PAYMENT_COMMISSION,
  CANCELLATION_RULES,
  ROLES,
  APPOINTMENT_LOCKS,
  APPOINTMENT_RULES,
} from '../constants/constants';

import {
  CreateAppointmentDTO,
  AppointmentResponseDTO,
  RescheduleAppointmentDTO,
} from '../dtos/appointment.dto/appointment.dto';
import { SESSION_STATUS, SessionStatus } from '../utils/sessionStatus.util';
import { AppointmentMapper } from '../mappers/appointment.mapper';
import { runInTransaction } from '../utils/transaction.util';
import { ClientSession } from 'mongoose';

export class AppointmentService implements IAppointmentService {
  constructor(
    private _appointmentRepository: IAppointmentRepository,
    private _userRepository: IUserRepository,
    private _doctorRepository: IDoctorRepository,
    private _slotRepository: ISlotRepository,
    private _logger: ILoggerService,
  ) {}

  private async _requireDoctorByUserId(doctorUserId: string): Promise<string> {
    const doctor = await this._doctorRepository.findByUserId(doctorUserId);
    if (!doctor) {
      throw new AppError(MESSAGES.DOCTOR_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return doctor._id.toString();
  }

  // ----------------------- PATIENT --------------------------

  async createAppointment(
    patientId: string,
    appointmentData: CreateAppointmentDTO,
  ): Promise<AppointmentResponseDTO> {
    this._logger.info('Service: createAppointment attempt', {
      patientId,
      doctorId: appointmentData.doctorId,
      slotId: appointmentData.slotId,
      date: appointmentData.appointmentDate,
      time: appointmentData.appointmentTime,
    });

    return await runInTransaction(
      async (session: ClientSession | undefined) => {
        const doctor = await this._doctorRepository.findById(
          appointmentData.doctorId,
        );
        if (!doctor) {
          throw new AppError(MESSAGES.DOCTOR_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        const patient = await this._userRepository.findById(patientId);
        if (!patient) {
          throw new AppError(MESSAGES.PATIENT_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        if (!doctor.isActive) {
          throw new AppError(
            MESSAGES.DOCTOR_NOT_AVAILABLE,
            HttpStatus.BAD_REQUEST,
          );
        }

        const consultationFees =
          appointmentData.appointmentType === 'video'
            ? doctor.VideoFees || 0
            : doctor.ChatFees || 0;

        if (consultationFees === 0) {
          throw new AppError(
            MESSAGES.DOCTOR_FEES_NOT_SET.replace(
              '{type}',
              appointmentData.appointmentType,
            ),
            HttpStatus.BAD_REQUEST,
          );
        }

        const adminCommission =
          (consultationFees * PAYMENT_COMMISSION.ADMIN_PERCENT) / 100;
        const doctorEarnings =
          (consultationFees * PAYMENT_COMMISSION.DOCTOR_PERCENT) / 100;

        if (appointmentData.slotId) {
          const schedule = await this._slotRepository.findByDoctorId(
            appointmentData.doctorId,
            session,
          );
          if (schedule) {
            const slot = schedule.weeklySchedule
              .flatMap((day) => day.slots)
              .find((s) => s.customId === appointmentData.slotId);

            if (slot && slot.booked) {
              this._logger.info(
                'Slot marked as booked. Searching for existing PENDING appointment to reuse.',
                {
                  patientId,
                  doctorId: appointmentData.doctorId,
                  slotId: appointmentData.slotId,
                  date: appointmentData.appointmentDate,
                },
              );

              let pId, dId;
              try {
                pId =
                  typeof patientId === 'string'
                    ? new Types.ObjectId(patientId)
                    : patientId;
                dId =
                  typeof appointmentData.doctorId === 'string'
                    ? new Types.ObjectId(appointmentData.doctorId)
                    : appointmentData.doctorId;
              } catch (_err) {
                this._logger.error('Error converting IDs for search', {
                  patientId,
                  doctorId: appointmentData.doctorId,
                });
                throw new AppError(
                  MESSAGES.INVALID_ID_FORMAT,
                  HttpStatus.BAD_REQUEST,
                );
              }

              const searchDate = new Date(appointmentData.appointmentDate);
              if (isNaN(searchDate.getTime())) {
                this._logger.error('Invalid appointment date provided', {
                  date: appointmentData.appointmentDate,
                });
                throw new AppError(
                  'Invalid appointment date',
                  HttpStatus.BAD_REQUEST,
                );
              }

              const startDate = new Date(searchDate);
              startDate.setHours(
                startDate.getHours() -
                  APPOINTMENT_LOCKS.DUPLICATE_DETECTION_HOURS,
              );
              const endDate = new Date(searchDate);
              endDate.setHours(
                endDate.getHours() +
                  APPOINTMENT_LOCKS.DUPLICATE_DETECTION_HOURS,
              );

              const existingAppointment =
                await this._appointmentRepository.findOne(
                  {
                    patientId: pId,
                    doctorId: dId,
                    appointmentDate: {
                      $gte: startDate,
                      $lte: endDate,
                    },
                    slotId: appointmentData.slotId,
                    status: APPOINTMENT_STATUS.PENDING,
                  },
                  session,
                );

              if (existingAppointment) {
                const now = new Date();

                if (
                  existingAppointment.checkoutLockUntil &&
                  existingAppointment.checkoutLockUntil > now
                ) {
                  this._logger.warn(
                    'Prevented duplicate checkout session - active lock found',
                    {
                      patientId,
                      slotId: appointmentData.slotId,
                      lockUntil: existingAppointment.checkoutLockUntil,
                    },
                  );
                  throw new AppError(
                    MESSAGES.PAYMENT_SESSION_ACTIVE,
                    HttpStatus.CONFLICT,
                  );
                }

                this._logger.info(
                  'Found existing PENDING appointment. reusing.',
                  {
                    appointmentId: existingAppointment._id.toString(),
                    previousStatus: existingAppointment.status,
                  },
                );

                const lockTime = new Date(
                  now.getTime() +
                    APPOINTMENT_LOCKS.CHECKOUT_LOCK_SECONDS * 1000,
                );

                const updated = await this._appointmentRepository.updateById(
                  existingAppointment._id.toString(),
                  {
                    appointmentType: appointmentData.appointmentType,
                    consultationFees,
                    adminCommission,
                    doctorEarnings,
                    reason:
                      appointmentData.reason || existingAppointment.reason,
                    appointmentTime: appointmentData.appointmentTime,
                    appointmentDate: new Date(appointmentData.appointmentDate),
                    checkoutLockUntil: lockTime,
                  },
                  session,
                );

                const populatedAppointment =
                  await this._appointmentRepository.findByIdPopulated(
                    updated!._id.toString(),
                    session,
                  );
                return AppointmentMapper.toResponseDTO(populatedAppointment);
              }

              this._logger.warn(
                'Slot is booked but no matching PENDING appointment found for this user.',
                {
                  patientId,
                  slotId: appointmentData.slotId,
                  doctorId: appointmentData.doctorId,
                },
              );

              throw new AppError(
                MESSAGES.APPOINTMENT_SLOT_NOT_AVAILABLE,
                HttpStatus.BAD_REQUEST,
              );
            }
          }
        }

        const appointmentToCreate = {
          patientId,
          doctorId: appointmentData.doctorId,
          appointmentType: appointmentData.appointmentType,
          appointmentDate: new Date(appointmentData.appointmentDate),
          appointmentTime: appointmentData.appointmentTime,
          slotId: appointmentData.slotId || null,
          status: APPOINTMENT_STATUS.PENDING,
          consultationFees,
          adminCommission,
          doctorEarnings,
          reason: appointmentData.reason || null,
          paymentStatus: PAYMENT_STATUS.PENDING,
          paymentId: null,
          paymentMethod: null,
          checkoutLockUntil: new Date(
            Date.now() + APPOINTMENT_LOCKS.CHECKOUT_LOCK_SECONDS * 1000,
          ),
        };

        if (appointmentData.slotId) {
          const startTime = parseAppointmentTime(
            appointmentData.appointmentTime,
          );
          const slotUpdated = await this._slotRepository.updateSlotBookedStatus(
            appointmentData.doctorId,
            appointmentData.slotId,
            true,
            new Date(appointmentData.appointmentDate),
            startTime,
            session,
          );

          if (!slotUpdated) {
            this._logger.warn(
              'Failed to mark slot as booked - possibly already taken',
              {
                slotId: appointmentData.slotId,
                doctorId: appointmentData.doctorId,
              },
            );
            throw new AppError(
              MESSAGES.APPOINTMENT_SLOT_NOT_AVAILABLE,
              HttpStatus.BAD_REQUEST,
            );
          }
        }

        const appointment = await this._appointmentRepository.create(
          appointmentToCreate as unknown as Partial<IAppointmentDocument>,
          session,
        );

        const populatedAppointment =
          await this._appointmentRepository.findByIdPopulated(
            appointment._id.toString(),
            session,
          );
        return AppointmentMapper.toResponseDTO(populatedAppointment);
      },
    );
  }

  async listAppointments(
    userId: string,
    userRole: string,
    filters: import('../dtos/admin.dto/admin.dto').AppointmentFilterDTO,
  ): Promise<{
    appointments: AppointmentResponseDTO[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    counts?:
      | {
          upcoming: number;
          completed: number;
          cancelled: number;
          missed: number;
        }
      | undefined;
  }> {
    await this._appointmentRepository.updateExpiredAppointments();
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const repoFilters: Record<string, unknown> = {
      status: filters.status,
      search: filters.search,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      doctorId: filters.doctorId,
      patientId: filters.patientId,
    };

    if (userRole === ROLES.PATIENT) {
      repoFilters.patientId = userId;
    } else if (userRole === ROLES.DOCTOR) {
      const doctor = await this._doctorRepository.findByUserId(userId);
      if (!doctor) {
        throw new AppError(MESSAGES.DOCTOR_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      repoFilters.doctorId = doctor._id.toString();
    } else if (userRole !== ROLES.ADMIN) {
      throw new AppError(MESSAGES.INVALID_ROLE, HttpStatus.FORBIDDEN);
    }

    const result = await this._appointmentRepository.findAll(
      repoFilters,
      skip,
      limit,
    );

    let counts;
    if (userRole === ROLES.PATIENT) {
      counts = await this._appointmentRepository.getStatusCounts({
        patientId: userId,
      });
    } else if (userRole === ROLES.DOCTOR && repoFilters.doctorId) {
      counts = await this._appointmentRepository.getStatusCounts({
        doctorId: repoFilters.doctorId.toString(),
      });
    }

    return {
      appointments: result.appointments.map(AppointmentMapper.toResponseDTO),
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
      counts,
    };
  }

  async getAppointmentById(
    appointmentId: string,
    userId: string,
    userRole: string,
  ): Promise<AppointmentResponseDTO> {
    const appointment =
      await this._appointmentRepository.findByIdPopulated(appointmentId);

    if (!appointment) {
      throw new AppError(MESSAGES.APPOINTMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const getIdString = (value: unknown): string | null => {
      if (!value) return null;
      if (typeof value === 'string') return value;
      if (value instanceof Types.ObjectId) return value.toString();
      if (typeof value === 'object' && value !== null) {
        const v = value as { _id?: unknown; id?: unknown };
        if (v._id) return String(v._id);
        if (v.id) return String(v.id);
      }
      return null;
    };

    const appointmentPatientId = getIdString(appointment.patientId);
    const appointmentDoctorId = getIdString(appointment.doctorId);

    const isPatient = appointmentPatientId === userId;
    let isDoctor = false;

    if (userRole === 'doctor') {
      const doctor = await this._doctorRepository.findByUserId(userId);
      isDoctor = doctor?._id.toString() === appointmentDoctorId;
    }

    if (!isPatient && !isDoctor && userRole !== ROLES.ADMIN) {
      throw new AppError(MESSAGES.UNAUTHORIZED_ACCESS, HttpStatus.FORBIDDEN);
    }

    return AppointmentMapper.toResponseDTO(appointment);
  }

  async cancelAppointment(
    appointmentId: string,
    userId: string,
    userRole: string,
    cancellationReason: string,
  ): Promise<AppointmentResponseDTO> {
    this._logger.info('cancelAppointment started', {
      appointmentId,
      userId,
      userRole,
    });

    return runInTransaction(async (session) => {
      const appointment = await this._appointmentRepository.findById(
        appointmentId,
        session,
      );

      if (!appointment) {
        throw new AppError(
          MESSAGES.APPOINTMENT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
        throw new AppError(
          MESSAGES.APPOINTMENT_ALREADY_CANCELLED,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (appointment.status === APPOINTMENT_STATUS.COMPLETED) {
        throw new AppError(
          MESSAGES.APPOINTMENT_ALREADY_COMPLETED,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (appointment.status === APPOINTMENT_STATUS.REJECTED) {
        throw new AppError(
          'Cannot cancel an appointment that has already been rejected',
          HttpStatus.BAD_REQUEST,
        );
      }

      const getIdString = (value: unknown): string | null => {
        if (!value) return null;
        if (typeof value === 'string') return value;
        if (value instanceof Types.ObjectId) return value.toString();
        if (typeof value === 'object' && value !== null) {
          const v = value as { _id?: unknown; id?: unknown };
          if (v._id) return String(v._id);
          if (v.id) return String(v.id);
        }
        return null;
      };

      const appointmentPatientId = getIdString(appointment.patientId);
      const appointmentDoctorId = getIdString(appointment.doctorId);

      const isPatient = appointmentPatientId === userId;
      let isDoctor = false;

      if (userRole === ROLES.DOCTOR) {
        const doctor = await this._doctorRepository.findByUserId(userId);
        isDoctor = doctor?._id.toString() === appointmentDoctorId;
      }

      if (!isPatient && !isDoctor && userRole !== ROLES.ADMIN) {
        throw new AppError(MESSAGES.UNAUTHORIZED_ACCESS, HttpStatus.FORBIDDEN);
      }

      const updatedAppointment = await this._appointmentRepository.updateById(
        appointmentId,
        {
          status: APPOINTMENT_STATUS.CANCELLED,
          cancelledBy:
            userRole === ROLES.PATIENT
              ? ROLES.PATIENT
              : userRole === ROLES.ADMIN
                ? ROLES.ADMIN
                : ROLES.DOCTOR,
          cancellationReason,
          cancelledAt: new Date(),
        },
        session,
      );

      if (appointment.paymentStatus === PAYMENT_STATUS.PAID) {
        const totalFee = appointment.consultationFees;
        const doctor = await this._doctorRepository.findById(
          appointment.doctorId.toString(),
        );
        const patient = await this._userRepository.findById(
          appointment.patientId.toString(),
        );

        let refundAmount = 0;

        if (userRole === ROLES.PATIENT) {
          refundAmount =
            (totalFee * CANCELLATION_RULES.USER_CANCEL_REFUND_PERCENT) / 100;
          const adminKeeps =
            (totalFee * CANCELLATION_RULES.USER_CANCEL_ADMIN_COMMISSION) / 100;
          const doctorKeeps =
            (totalFee * CANCELLATION_RULES.USER_CANCEL_DOCTOR_COMMISSION) / 100;

          const doctorDeduction = appointment.doctorEarnings - doctorKeeps;
          const adminDeduction = appointment.adminCommission - adminKeeps;

          const admins = await this._userRepository.findByRole(ROLES.ADMIN);
          const adminUser = admins[0];
        }

        await this._appointmentRepository.updateById(
          appointmentId,
          {
            paymentStatus: PAYMENT_STATUS.REFUNDED,
          },
          session,
        );
      }

      if (appointment.slotId) {
        const startTime = parseAppointmentTime(appointment.appointmentTime);
        const docId = getIdString(appointment.doctorId);
        if (docId) {
          await this._slotRepository.updateSlotBookedStatus(
            docId,
            appointment.slotId,
            false,
            new Date(appointment.appointmentDate),
            startTime,
            session,
          );
        }
      }

      if (!updatedAppointment) {
        throw new AppError(
          'Failed to update appointment',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const populatedAppointment =
        await this._appointmentRepository.findByIdPopulated(
          appointmentId,
          session,
        );
      return AppointmentMapper.toResponseDTO(populatedAppointment);
    });
  }

  async rescheduleAppointment(
    appointmentId: string,
    userId: string,
    userRole: string,
    rescheduleData: RescheduleAppointmentDTO,
  ): Promise<AppointmentResponseDTO> {
    this._logger.info('rescheduleAppointment started', {
      appointmentId,
      userId,
      userRole,
    });

    return runInTransaction(async (session) => {
      const appointment = await this._appointmentRepository.findById(
        appointmentId,
        session,
      );

      if (!appointment) {
        throw new AppError(
          MESSAGES.APPOINTMENT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (
        (appointment.rescheduleCount ?? 0) >=
        APPOINTMENT_RULES.MAX_RESCHEDULE_COUNT
      ) {
        throw new AppError(
          MESSAGES.APPOINTMENT_MAX_RESCHEDULE,
          HttpStatus.BAD_REQUEST,
        );
      }

      let isDoctor = false;
      if (userRole === ROLES.DOCTOR) {
        const doctor = await this._doctorRepository.findByUserId(userId);
        isDoctor = doctor?._id.toString() === appointment.doctorId.toString();
      }

      const isPatient = appointment.patientId.toString() === userId;
      if (!isPatient && !isDoctor && userRole !== ROLES.ADMIN) {
        throw new AppError(MESSAGES.UNAUTHORIZED_ACCESS, HttpStatus.FORBIDDEN);
      }

      const allowedStatuses: AppointmentStatus[] = [
        APPOINTMENT_STATUS.PENDING,
        APPOINTMENT_STATUS.CONFIRMED,
        APPOINTMENT_STATUS.UPCOMING,
        APPOINTMENT_STATUS.RESCHEDULE_REQUESTED,
      ];
      if (!allowedStatuses.includes(appointment.status)) {
        throw new AppError(
          MESSAGES.APPOINTMENT_CANNOT_MODIFY,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (rescheduleData.slotId) {
        const schedule = await this._slotRepository.findByDoctorId(
          appointment.doctorId.toString(),
          session,
        );
        if (schedule) {
          const slot = schedule.weeklySchedule
            .flatMap((day) => day.slots)
            .find((s) => s.customId === rescheduleData.slotId);

          if (slot && slot.booked && slot.customId !== appointment.slotId) {
            throw new AppError(
              MESSAGES.APPOINTMENT_SLOT_NOT_AVAILABLE,
              HttpStatus.BAD_REQUEST,
            );
          }
        }
      }

      if (isDoctor) {
        if (rescheduleData.slotId) {
          const newStartTime = parseAppointmentTime(
            rescheduleData.appointmentTime,
          );
          await this._slotRepository.updateSlotBookedStatus(
            appointment.doctorId.toString(),
            rescheduleData.slotId,
            true,
            new Date(rescheduleData.appointmentDate),
            newStartTime,
            session,
          );
        }

        await this._appointmentRepository.updateById(
          appointmentId,
          {
            status: APPOINTMENT_STATUS.RESCHEDULE_REQUESTED,
            rescheduleRequest: {
              appointmentDate: new Date(rescheduleData.appointmentDate),
              appointmentTime: rescheduleData.appointmentTime,
              slotId: rescheduleData.slotId || null,
            },
            rescheduleRejectReason: null,
          },
          session,
        );

        const populated = await this._appointmentRepository.findByIdPopulated(
          appointmentId,
          session,
        );
        return AppointmentMapper.toResponseDTO(populated);
      } else {
        if (appointment.slotId) {
          const oldStartTime = parseAppointmentTime(
            appointment.appointmentTime,
          );
          await this._slotRepository.updateSlotBookedStatus(
            appointment.doctorId.toString(),
            appointment.slotId,
            false,
            new Date(appointment.appointmentDate),
            oldStartTime,
            session,
          );
        }

        if (rescheduleData.slotId) {
          const newStartTime = parseAppointmentTime(
            rescheduleData.appointmentTime,
          );
          const slotUpdated = await this._slotRepository.updateSlotBookedStatus(
            appointment.doctorId.toString(),
            rescheduleData.slotId,
            true,
            new Date(rescheduleData.appointmentDate),
            newStartTime,
            session,
          );

          if (!slotUpdated) {
            throw new AppError(
              MESSAGES.APPOINTMENT_SLOT_NOT_AVAILABLE,
              HttpStatus.BAD_REQUEST,
            );
          }
        }

        await this._appointmentRepository.updateById(
          appointmentId,
          {
            appointmentDate: new Date(rescheduleData.appointmentDate),
            appointmentTime: rescheduleData.appointmentTime,
            slotId: rescheduleData.slotId || null,
            status: APPOINTMENT_STATUS.PENDING,
            rescheduleCount: (appointment.rescheduleCount || 0) + 1,
            rescheduleRequest: null,
          },
          session,
        );

        const populated = await this._appointmentRepository.findByIdPopulated(
          appointmentId,
          session,
        );
        return AppointmentMapper.toResponseDTO(populated);
      }
    });
  }

  async acceptReschedule(appointmentId: string, userId: string): Promise<void> {
    return runInTransaction(async (session) => {
      const appointment = await this._appointmentRepository.findById(
        appointmentId,
        session,
      );
      if (!appointment)
        throw new AppError(
          MESSAGES.APPOINTMENT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );

      if (appointment.patientId.toString() !== userId) {
        throw new AppError('Unauthorized', HttpStatus.FORBIDDEN);
      }

      if (
        appointment.status !== APPOINTMENT_STATUS.RESCHEDULE_REQUESTED ||
        !appointment.rescheduleRequest
      ) {
        throw new AppError(
          'No active reschedule request found',
          HttpStatus.BAD_REQUEST,
        );
      }

      const { appointmentDate, appointmentTime, slotId } =
        appointment.rescheduleRequest;

      if (appointment.slotId) {
        const oldStartTime = parseAppointmentTime(appointment.appointmentTime);
        await this._slotRepository.updateSlotBookedStatus(
          appointment.doctorId.toString(),
          appointment.slotId,
          false,
          new Date(appointment.appointmentDate),
          oldStartTime,
          session,
        );
        this._logger.info(
          `Released old slot ${appointment.slotId} as reschedule to ${slotId} was accepted.`,
        );
      }

      await this._appointmentRepository.updateById(
        appointmentId,
        {
          appointmentDate,
          appointmentTime,
          slotId,
          status: APPOINTMENT_STATUS.CONFIRMED,
          rescheduleRequest: null,
          rescheduleCount: (appointment.rescheduleCount || 0) + 1,
        },
        session,
      );
    });
  }

  async rejectReschedule(
    appointmentId: string,
    userId: string,
    reason: string,
  ): Promise<void> {
    return runInTransaction(async (session) => {
      const appointment = await this._appointmentRepository.findById(
        appointmentId,
        session,
      );
      if (!appointment)
        throw new AppError(
          MESSAGES.APPOINTMENT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );

      if (appointment.patientId.toString() !== userId) {
        throw new AppError('Unauthorized', HttpStatus.FORBIDDEN);
      }

      if (
        appointment.status !== APPOINTMENT_STATUS.RESCHEDULE_REQUESTED ||
        !appointment.rescheduleRequest
      ) {
        throw new AppError(
          'No active reschedule request found',
          HttpStatus.BAD_REQUEST,
        );
      }

      const currentRescheduleRequest = appointment.rescheduleRequest;

      if (currentRescheduleRequest.slotId) {
        const startTime = parseAppointmentTime(
          currentRescheduleRequest.appointmentTime,
        );
        await this._slotRepository.updateSlotBookedStatus(
          appointment.doctorId.toString(),
          currentRescheduleRequest.slotId,
          false,
          new Date(currentRescheduleRequest.appointmentDate),
          startTime,
          session,
        );
      }

      await this._appointmentRepository.updateById(
        appointmentId,
        {
          status: APPOINTMENT_STATUS.PENDING,
          rescheduleRequest: null,
          rescheduleRejectReason: reason,
        },
        session,
      );
    });
  }

  // ==================== DOCTOR SIDE ====================

  async approveAppointmentRequest(
    appointmentId: string,
    doctorUserId: string,
  ): Promise<void> {
    this._logger.info('approveAppointmentRequest started', {
      appointmentId,
      doctorUserId,
    });

    return runInTransaction(async (session) => {
      const doctorId = await this._requireDoctorByUserId(doctorUserId);
      const appointment = await this._appointmentRepository.findById(
        appointmentId,
        session,
      );

      if (!appointment) {
        throw new AppError(
          MESSAGES.APPOINTMENT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      if (appointment.doctorId.toString() !== doctorId) {
        throw new AppError(MESSAGES.UNAUTHORIZED_ACCESS, HttpStatus.FORBIDDEN);
      }
      if (appointment.status !== APPOINTMENT_STATUS.PENDING) {
        throw new AppError(
          MESSAGES.APPOINTMENT_NOT_PENDING,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (appointment.paymentStatus !== PAYMENT_STATUS.PAID) {
        throw new AppError(
          MESSAGES.APPOINTMENT_ONLY_PAID_APPROVED,
          HttpStatus.BAD_REQUEST,
        );
      }

      await this._appointmentRepository.updateById(
        appointmentId,
        {
          status: APPOINTMENT_STATUS.CONFIRMED,
        },
        session,
      );
    });
  }

  async rejectAppointmentRequest(
    appointmentId: string,
    doctorUserId: string,
    rejectionReason: string,
  ): Promise<void> {
    this._logger.info('rejectAppointmentRequest started', {
      appointmentId,
      doctorUserId,
    });

    return runInTransaction(async (session) => {
      const doctorId = await this._requireDoctorByUserId(doctorUserId);
      const appointment = await this._appointmentRepository.findById(
        appointmentId,
        session,
      );

      if (!appointment) {
        throw new AppError(
          MESSAGES.APPOINTMENT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      if (appointment.doctorId.toString() !== doctorId) {
        throw new AppError(MESSAGES.UNAUTHORIZED_ACCESS, HttpStatus.FORBIDDEN);
      }
      if (appointment.status !== APPOINTMENT_STATUS.PENDING) {
        throw new AppError(
          MESSAGES.APPOINTMENT_NOT_PENDING,
          HttpStatus.BAD_REQUEST,
        );
      }

      await this._appointmentRepository.updateById(
        appointmentId,
        {
          status: APPOINTMENT_STATUS.REJECTED,
          rejectionReason,
        },
        session,
      );

      if (appointment.slotId) {
        const startTime = parseAppointmentTime(appointment.appointmentTime);

        const getIdString = (value: unknown): string | null => {
          if (!value) return null;
          if (typeof value === 'string') return value;
          if (value instanceof Types.ObjectId) return value.toString();
          if (typeof value === 'object') {
            const v = value as { _id?: unknown; id?: unknown };
            if (v._id) return String(v._id);
            if (v.id && typeof v.id === 'string') return v.id;
          }
          return null;
        };
        const docId = getIdString(appointment.doctorId);
        if (docId) {
          await this._slotRepository.updateSlotBookedStatus(
            docId,
            appointment.slotId,
            false,
            new Date(appointment.appointmentDate),
            startTime,
            session,
          );
        }
      }
    });
  }

  async completeAppointment(
    appointmentId: string,
    doctorUserId: string,
    prescriptionUrl?: string,
  ): Promise<void> {
    const doctorId = await this._requireDoctorByUserId(doctorUserId);
    const appointment =
      await this._appointmentRepository.findById(appointmentId);

    if (!appointment) {
      throw new AppError(MESSAGES.APPOINTMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (appointment.doctorId.toString() !== doctorId) {
      throw new AppError(MESSAGES.UNAUTHORIZED_ACCESS, HttpStatus.FORBIDDEN);
    }
    if (appointment.status !== APPOINTMENT_STATUS.CONFIRMED) {
      throw new AppError(
        MESSAGES.APPOINTMENT_NOT_CONFIRMED,
        HttpStatus.BAD_REQUEST,
      );
    }

    const updateData: UpdateQuery<IAppointmentDocument> = {
      status: APPOINTMENT_STATUS.COMPLETED,
      prescriptionUrl: prescriptionUrl || null,
      sessionEndTime: new Date(),
    };

    await this._appointmentRepository.updateById(appointmentId, updateData);

    if (appointment.slotId) {
      const startTime = parseAppointmentTime(appointment.appointmentTime);
      await this._slotRepository.updateSlotBookedStatus(
        appointment.doctorId.toString(),
        appointment.slotId,
        false,
        new Date(appointment.appointmentDate),
        startTime,
      );
      this._logger.info(
        `Released slot ${appointment.slotId} after completion of appointment ${appointmentId}`,
      );
    }
  }
}
