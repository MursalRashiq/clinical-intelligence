import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../utils/constants';


const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    withCredentials: true,
    headers: {
        "Content-type": "application/json"
    },
});

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const url = config.url || "";
        
        // Check if it's an admin route
        const isAdminRoute = url.startsWith("/admin") || url.includes("/admin/");
        
        let token = isAdminRoute 
            ? localStorage.getItem("adminToken") 
            : localStorage.getItem("authToken");

        // Clean up stringified null/undefined
        if (token === "null" || token === "undefined") {
            token = null;
        }

        // IMPORTANT: If sending FormData, remove the default Content-Type header
        // so the browser can set it with the correct multipart boundary automatically
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
            delete config.headers["Content-type"];
        }

        console.log(`[Axios Request] ${config.method?.toUpperCase()} ${url}`, {
            isAdminRoute,
            tokenValue: token ? `${token.substring(0, 10)}...` : "NONE",
            hasToken: !!token,
            authHeader: config.headers?.Authorization ? "Present" : "Missing"
        });

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error: AxiosError) => {
        console.error("Request Interceptor Error:", error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log("API Response:", {
            status: response.status,
            url: response.config.url,
            data: response.data,
        })

        return response;
    },

    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.warn('[Axios] 401 Unauthorized:', originalRequest.method?.toUpperCase(), originalRequest.url);

            // Skip refresh for login / auth endpoints — pass their original error straight back
            // so the UI can show the correct message (e.g. "Invalid credentials")
            const isLoginEndpoint = ['/auth/login', '/auth/doctor/login', '/auth/register',
                '/auth/verify-otp', '/auth/forgot-password', '/auth/reset-password']
                .some(path => originalRequest.url?.includes(path));
            if (isLoginEndpoint) {
                return Promise.reject(error);
            }

            // Avoid infinite loop if refresh token itself fails
            if (originalRequest.url?.includes('/refresh-token')) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                console.log("[Axios] Attempting token refresh...");
                const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
                    withCredentials: true,
                    headers: { "Content-Type": 'application/json' },
                });

                const newToken = res.data?.data?.accessToken;
                if (!newToken) {
                    throw new Error('No access token in refresh response');
                }

                const isAdminRoute = originalRequest.url?.startsWith("/admin") || originalRequest.url?.includes("/admin/");
                if (isAdminRoute) {
                    localStorage.setItem("adminToken", newToken);
                } else {
                    localStorage.setItem("authToken", newToken);
                }

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                console.log("[Axios] Token refreshed successfully. Retrying original request...");
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                console.error("[Axios] Refresh token failed:", refreshError);
                // Clear tokens on hard refresh failure
                localStorage.removeItem("authToken");
                localStorage.removeItem("adminToken");
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 403) {
            console.error('[Axios] 403 Forbidden — account may be blocked:', originalRequest.url);
            // Clear all tokens so the user is fully logged out
            localStorage.removeItem("authToken");
            localStorage.removeItem("adminToken");
            // Fire a global event so any component (e.g. profile page) can react
            window.dispatchEvent(new CustomEvent("user:blocked"));
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;