import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../redux/user/userSlice";
import { FRONTEND_ROUTES } from "../utils/constants";

interface Props {
  children: React.ReactElement;
  requireApproved?: boolean;
}

const DoctorProtectedRoute: React.FC<Props> = ({ children, requireApproved = true }) => {
  const currentUser = useSelector(selectCurrentUser);
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to={FRONTEND_ROUTES.DOCTOR_LOGIN} state={{ from: location }} replace />;
  }

  if (currentUser.role !== "doctor") {
    return <Navigate to={FRONTEND_ROUTES.HOME} replace />;
  }

  if (currentUser.isActive === false) {
    return <Navigate to={`${FRONTEND_ROUTES.DOCTOR_LOGIN}?error=blocked`} replace />;
  }

  // If the route requires approval but the doctor is not approved, redirect to pending page
  const status = currentUser.verificationStatus?.toLowerCase();

  if (requireApproved && status !== "approved") {
    if (location.pathname !== FRONTEND_ROUTES.DOCTOR_PENDING) {
      return <Navigate to={FRONTEND_ROUTES.DOCTOR_PENDING} replace />;
    }
  }

  // If the doctor is approved but tries to access the pending page, redirect to dashboard
  if (status === "approved" && location.pathname === FRONTEND_ROUTES.DOCTOR_PENDING) {
      return <Navigate to={FRONTEND_ROUTES.DOCTOR_DASHBOARD} replace />;
  }

  return children;
};

export default DoctorProtectedRoute;
