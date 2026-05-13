import axiosInstance from "../api/axiosInstance";

class PatientService {
    private readonly BASE_URL = "/patients";

    async getProfile() {
        try {
            const response = await axiosInstance.get(`${this.BASE_URL}/profile`);
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
            // Re-throw so callers can handle 403 etc.
            throw error;
        }
    }
}

export default new PatientService();
