import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../redux/user/userSlice";
import { selectCurrentAdmin } from "../redux/admin/adminSlice";
import { FRONTEND_ROUTES } from "../utils/constants";

interface Props {
    children: React.ReactElement;
    role: "doctor" | "admin" | "patient";
}

const ProtectedRoute: React.FC<Props> = ({ children, role }) => {
    const currentUser = useSelector(selectCurrentUser);
    const currentAdmin = useSelector(selectCurrentAdmin);

    if (role === "admin") {
        if (!currentAdmin) {
            return <Navigate to={FRONTEND_ROUTES.ADMIN_LOGIN} replace />;
        }
        return children;
    }

    // For patient/doctor
    if (!currentUser) {
        return <Navigate to={FRONTEND_ROUTES.LOGIN} replace />;
    }

    // Normalize: backend may return "user" but the route expects "patient"
    const userRole = currentUser.role === "user" ? "patient" : currentUser.role;
    if (userRole !== role) {
        // Redirect doctors to their own dashboard, everyone else to home
        if (currentUser.role === "doctor") {
            return <Navigate to={FRONTEND_ROUTES.DOCTOR_DASHBOARD} replace />;
        }
        return <Navigate to={FRONTEND_ROUTES.HOME} replace />;
    }

    if (currentUser.isActive === false) {
        return <Navigate to={`${FRONTEND_ROUTES.LOGIN}?error=blocked`} replace />;
    }

    return children;
}

export default ProtectedRoute;