import axiosInstance from "../api/axiosInstance";
import { USER_API_ROUTES } from "../utils/constants";

class PatientService {
    private readonly BASE_URL = "/api/v1/users";

    async getProfile() {
        try {
            const response = await axiosInstance.get(`${this.BASE_URL}/me`);
            return response.data;
        } catch (error: any) {
            console.error("[PatientService] getProfile error:", error?.response?.data || error?.message);
            return { success: false, message: error?.response?.data?.message || error?.message || "Failed to fetch profile" };
        }
    }

    async updateProfile(data: any) {
        try {
            const response = await axiosInstance.put(`${this.BASE_URL}/profile`, data);
            return response.data;
        } catch (error: any) {
            console.error("[PatientService] updateProfile error:", error?.response?.data || error?.message);
            throw error;
        }
    }

        async fetchActiveDays(doctorId: string) {
            try {
                const response = await axiosInstance.get(`${this.BASE_URL}/doctors/${doctorId}`);
                return response.data;
            } catch (error: any) {
                return { success: false, message: error?.response?.data?.message || error?.message || "Failed to fetch doctor details" };
            }
        }

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
            console.log(USER_API_ROUTES.GET_AllDOCTORS, filters, "Fetching doctors with filters");
            const res = await axiosInstance.get(USER_API_ROUTES.GET_AllDOCTORS, {
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
}

export default new PatientService();
