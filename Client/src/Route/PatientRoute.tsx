import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../redux/user/userSlice";
import { FRONTEND_ROUTES } from "../utils/constants";

interface Props {
    children: React.ReactElement;
    /** If true, user must be logged in as a patient. If false, any logged-out user or patient can view (doctors still redirected). */
    requireAuth?: boolean;
}

/**
 * PatientRoute — allows only patients (role "patient" or "user") through.
 * Doctors are redirected to their dashboard.
 * If requireAuth=true, unauthenticated users are sent to /login.
 */
const PatientRoute: React.FC<Props> = ({ children, requireAuth = false }) => {
    const currentUser = useSelector(selectCurrentUser);

    // If a doctor is logged in, redirect them to the doctor dashboard
    if (currentUser?.role === "doctor") {
        return <Navigate to={FRONTEND_ROUTES.DOCTOR_DASHBOARD} replace />;
    }

    // If auth is required and user is not logged in, redirect to login
    if (requireAuth && !currentUser) {
        return <Navigate to={FRONTEND_ROUTES.LOGIN} replace />;
    }

    return children;
};

export default PatientRoute;
