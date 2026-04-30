import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../redux/user/userSlice";
import { selectCurrentAdmin } from "../redux/admin/adminSlice";
import { FRONTEND_ROUTES } from "../utils/constants";

interface Props {
  children: React.ReactElement;
  roleScope?: "admin" | "user" | "doctor"; // Optional to allow fallback, but we should specify it
}

const PublicRoute: React.FC<Props> = ({ children, roleScope = "user" }) => {
  const currentUser = useSelector(selectCurrentUser);
  const currentAdmin = useSelector(selectCurrentAdmin);

  if (roleScope === "admin") {
    if (currentAdmin) {
      return <Navigate to={FRONTEND_ROUTES.ADMIN_DASHBOARD} replace />;
    }
  } else if (roleScope === "doctor") {
    if (currentUser && currentUser.role === "doctor") {
      return <Navigate to={FRONTEND_ROUTES.HOME} replace />; // Or doctor dashboard if available
    }
  } else {
    if (currentUser) {
      return <Navigate to={FRONTEND_ROUTES.HOME} replace />;
    }
  }

  return children;
};

export default PublicRoute;
