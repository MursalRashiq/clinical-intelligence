import axiosInstance from "../api/axiosInstance";
import { ADMIN_API_ROUTES } from '../utils/constants'

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

export class AdminServiceClass {
    async loginAdmin(credentials: { email: string; password: string }) {
        try {
            const res = await axiosInstance.post(ADMIN_API_ROUTES.LOGIN, credentials);
            return res.data;
        } catch (error) {
            const err = error as ApiError;
            return { success: false, message: err.response?.data?.message || err.message || "Login failed" };
        }
    }

    async getAllPatients(page: number = 1, limit: number = 10, filters: { search?: string; isActive?: boolean | string } = {}) {
        try {
            const res = await axiosInstance.get(ADMIN_API_ROUTES.GET_PATIENTS, {
                params: {
                    page,
                    limit,
                    ...filters
                }
            })
            return res.data;
        } catch (error) {
            const err = error as ApiError;
            return { success: false, message: err.response?.data?.message || err.message || "Error fetching patients", data: [] }
        }
    }

    async getPatientById(patientId: string) {
        try {
            const res = await axiosInstance.get(ADMIN_API_ROUTES.GET_USER_BY_ID(patientId));
            return res.data;
        } catch (error) {
            const err = error as ApiError;
            return { success: false, message: err.response?.data?.message || err.message || "Error fetching patients", data: [] }
        }
    }

    async blockPatient(patientId: string) {
        try {
            const res = await axiosInstance.post(ADMIN_API_ROUTES.BLOCK_USER(patientId));
            return res.data;
        } catch (error) {
            const err = error as ApiError;
            return { success: false, message: err.response?.data?.message || err.message || "Error blocking patients", data: [] }
        }
    }

    async unblockPatient(patientId: string) {
        try {
            const res = await axiosInstance.post(ADMIN_API_ROUTES.UNBLOCK_USER(patientId));
            return res.data;
        } catch (error) {
            const err = error as ApiError;
            return { success: false, message: err.response?.data?.message || err.message || "Error unblocking patients", data: [] }
        }
    }

    async logoutAdmin() {
        try {
            await axiosInstance.post("/auth/logout");
        } catch (error) {
            console.error("Admin logout failed", error);
        } finally {
            localStorage.removeItem("adminToken");
        }
    }
}

export const adminService = new AdminServiceClass();
export default adminService;