import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../redux/user/userSlice";
import { selectCurrentDoctor } from "../redux/doctor/doctorSlice";
import { selectCurrentAdmin } from "../redux/admin/adminSlice";
import { FRONTEND_ROUTES } from "../utils/constants";

interface Props {
  children: React.ReactElement;
  /** Roles that are allowed to access this route. If omitted, it's public for anyone EXCEPT logged-in users who belong to other modules. */
  allowedRoles?: ("patient" | "user" | "doctor" | "admin")[];
  /** If true, the user MUST be logged in. */
  requireAuth?: boolean;
  /** If true, prevents logged-in users from viewing this route (for login/register pages). Redirects them to their dashboard. */
  publicOnlyFor?: "patient" | "user" | "doctor" | "admin";
  /** Specific for doctor routes */
  requireDoctorApproval?: boolean;
}

const RoleRoute: React.FC<Props> = ({ 
  children, 
  allowedRoles, 
  requireAuth = false, 
  publicOnlyFor,
  requireDoctorApproval = false 
}) => {
  const currentUser = useSelector(selectCurrentUser);
  const currentDoctor = useSelector(selectCurrentDoctor);
  const currentAdmin = useSelector(selectCurrentAdmin);
  const location = useLocation();

  const isPatientLoggedIn = !!(currentUser && (currentUser.role as string === "user" || currentUser.role === "patient"));
  const isDoctorLoggedIn = !!(currentDoctor && currentDoctor.role === "doctor");
  const isAdminLoggedIn = !!currentAdmin;

  // 1. Handle PublicOnly routes (Login/Register pages)
  if (publicOnlyFor) {
    if (publicOnlyFor === "admin" && isAdminLoggedIn) return <Navigate to={FRONTEND_ROUTES.ADMIN_DASHBOARD} replace />;
    if (publicOnlyFor === "doctor" && isDoctorLoggedIn) {
      if (currentDoctor?.isActive === false) return children;
      return <Navigate to={FRONTEND_ROUTES.DOCTOR_DASHBOARD} replace />;
    }
    if ((publicOnlyFor === "patient" || publicOnlyFor === "user") && isPatientLoggedIn) {
      if (currentUser?.isActive === false) return children;
      return <Navigate to={FRONTEND_ROUTES.HOME} replace />;
    }
    
    // We allow visiting a login page for role B even if logged in as role A
    return children;
  }

  // 2. Auth & Role Restriction
  if (allowedRoles) {
    const allowsAdmin = allowedRoles.includes("admin");
    const allowsDoctor = allowedRoles.includes("doctor");
    const allowsPatient = allowedRoles.includes("patient") || allowedRoles.includes("user");

    // Check if we meet any of the required auth states
    const hasAdminAccess = allowsAdmin && isAdminLoggedIn;
    const hasDoctorAccess = allowsDoctor && isDoctorLoggedIn;
    const hasPatientAccess = allowsPatient && isPatientLoggedIn;

    if (requireAuth) {
      if (!hasAdminAccess && !hasDoctorAccess && !hasPatientAccess) {
        // If already logged in but as a different role, redirect to their own dashboard
        if (isAdminLoggedIn) return <Navigate to={FRONTEND_ROUTES.ADMIN_DASHBOARD} replace />;
        if (isDoctorLoggedIn) return <Navigate to={FRONTEND_ROUTES.DOCTOR_DASHBOARD} replace />;
        if (isPatientLoggedIn) return <Navigate to={FRONTEND_ROUTES.HOME} replace />;

        // Not logged in at all, redirect to the appropriate login page
        if (allowsAdmin) return <Navigate to={FRONTEND_ROUTES.ADMIN_LOGIN} replace />;
        if (allowsDoctor) return <Navigate to={FRONTEND_ROUTES.DOCTOR_LOGIN} replace />;
        return <Navigate to={FRONTEND_ROUTES.LOGIN} replace />;
      }
    }
  }

  // 3. Blocked Users
  if (isPatientLoggedIn && currentUser?.isActive === false && location.pathname.startsWith("/profile")) {
    return <Navigate to={`${FRONTEND_ROUTES.LOGIN}?error=blocked`} replace />;
  }
  if (isDoctorLoggedIn && currentDoctor?.isActive === false && location.pathname.startsWith("/doctor")) {
    return <Navigate to={`${FRONTEND_ROUTES.DOCTOR_LOGIN}?error=blocked`} replace />;
  }

  // 4. Doctor Approval Check
  if (isDoctorLoggedIn && requireDoctorApproval) {
    const status = currentDoctor?.verificationStatus?.toLowerCase();
    if (status !== "approved" && location.pathname !== FRONTEND_ROUTES.DOCTOR_PENDING) {
      return <Navigate to={FRONTEND_ROUTES.DOCTOR_PENDING} replace />;
    }
    if (status === "approved" && location.pathname === FRONTEND_ROUTES.DOCTOR_PENDING) {
      return <Navigate to={FRONTEND_ROUTES.DOCTOR_DASHBOARD} replace />;
    }
  }

  return children;
};

export default RoleRoute;
