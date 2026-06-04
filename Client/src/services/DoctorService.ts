import axiosInstance from "../api/axiosInstance";
import { DOCTOR_API_ROUTES } from "../utils/constants";

export class DoctorServiceClass {
    async getAllDoctors(filters: {
      search?: string;
      specialty?: string;
      hasSlots?: boolean;

      minRating?: number;

      sortBy?: string;
      sortOrder?: "asc" | "desc";

      page?: number;
      limit?: number;
   } = {}) {
        try {
            console.log(DOCTOR_API_ROUTES.LIST_DOCTORS, filters, "Fetching doctors with filters");
            const res = await axiosInstance.get(DOCTOR_API_ROUTES.LIST_DOCTORS, {
                params: filters
            });
            return res.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || error.message || "Error fetching doctors",
                data: { doctors: [], total: 0 }
            };
        }
    }

    async getSchedule(doctorId?: string) {
        try {
            const url = doctorId ? DOCTOR_API_ROUTES.SCHEDULE_BY_ID(doctorId) : DOCTOR_API_ROUTES.SCHEDULE;
            const res = await axiosInstance.get(url);
            return res.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async getAvailableSlots(doctorId: string, date: string) {
        try {
            const url = DOCTOR_API_ROUTES.AVAILABLE_SLOTS(doctorId);
            const res = await axiosInstance.get(url, { params: { date } });
            return res.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async createSchedule(scheduleData: any) {
        try {
            const res = await axiosInstance.post(DOCTOR_API_ROUTES.SCHEDULE, scheduleData);
            return res.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async addRecurringSlots(data: any) {
        try {
            const res = await axiosInstance.post(DOCTOR_API_ROUTES.RECURRING_SLOTS, data);
            return res.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async updateSchedule(scheduleData: any, doctorId?: string) {
        try {
            const url = doctorId ? DOCTOR_API_ROUTES.SCHEDULE_BY_ID(doctorId) : DOCTOR_API_ROUTES.SCHEDULE;
            const res = await axiosInstance.put(url, scheduleData);
            return res.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async blockDate(data: { date: string, reason?: string, slots?: string[] }, doctorId?: string) {
        try {
            const url = DOCTOR_API_ROUTES.BLOCK_DATE(doctorId);
            const res = await axiosInstance.post(url, data);
            return res.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async unblockDate(date: string, doctorId?: string) {
        try {
            const url = DOCTOR_API_ROUTES.UNBLOCK_DATE(doctorId);
            const res = await axiosInstance.post(url, { date });
            return res.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async deleteRecurringSlot(day: string, slotId: string) {
        try {
            const url = DOCTOR_API_ROUTES.DELETE_RECURRING_SLOT(day, slotId);
            const res = await axiosInstance.delete(url);
            return res.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async deleteRecurringSlotByTime(startTime: string, endTime: string) {
        try {
            const url = DOCTOR_API_ROUTES.DELETE_RECURRING_SLOT_BY_TIME(startTime, endTime);
            const res = await axiosInstance.delete(url);
            return res.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async deleteSchedule(doctorId?: string) {
        try {
            const url = DOCTOR_API_ROUTES.DELETE_SCHEDULE(doctorId);
            const res = await axiosInstance.delete(url);
            return res.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async addSpecificDateSlots(data: any) {
        try {
            const res = await axiosInstance.post(DOCTOR_API_ROUTES.SPECIFIC_DATE_SLOTS, data);
            return res.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async deleteSpecificDateSlot(date: string, slotId: string) {
        try {
            const url = DOCTOR_API_ROUTES.DELETE_SPECIFIC_DATE_SLOT(date, slotId);
            const res = await axiosInstance.delete(url);
            return res.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async getDoctorDetailsById(doctorId: string) {
        try {
            const res = await axiosInstance.get(`/api/v1/users/doctors/${doctorId}`);
            return res.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }
}

export const doctorService = new DoctorServiceClass();
export default doctorService;
